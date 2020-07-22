import service from "../../service";
import UserService from "../../../users/service";
import VtexService from "../../../vtex/service";
import { Transaction } from "knex";
import knexDatabase from "../../../../knex-database";
import { createOrganizationPayload } from "../../../../__mocks__";
import { ISignUpAdapted } from "../../../users/types";
import { IUserToken } from "../../../authentication/types";
import Faker from "faker";
import redisClient from "../../../../lib/Redis";
import OrganizationRulesService from "../../../organization-rules/service";
import { IUserOrganizationAdapted } from "../../types";
import { IContext } from "../../../../common/types";
import { ServiceRoles } from "../../../services/types";
import { MESSAGE_ERROR_USER_NOT_TEAMMATE } from "../../../../common/consts";
jest.mock("../../../organization-rules/service");

describe("inative teammates", () => {
  let trx: Transaction;

  let signUpCreated: ISignUpAdapted;

  let signUpPayload = {
    username: Faker.name.firstName(),
    email: Faker.internet.email(),
    password: "B8oneTeste123!",
  };

  let userToken: IUserToken;

  let teammates: IUserOrganizationAdapted[];

  let context: IContext;

  const inviteTeammatesInput = {
    emails: Array(1)
      .fill(0)
      .map(() => Faker.internet.email()),
  };

  const inviteAffiliatesInput = {
    users: Array(1)
      .fill(0)
      .map(() => ({
        email: Faker.internet.email(),
        role: ServiceRoles.ANALYST,
      })),
  };

  beforeAll(async () => {
    trx = await knexDatabase.knex.transaction();

    const getAffiliateTeammateRulesSpy = jest.spyOn(
      OrganizationRulesService,
      "getAffiliateTeammateRules"
    );

    getAffiliateTeammateRulesSpy.mockImplementation(
      () =>
        new Promise((resolve) =>
          resolve({
            maxAnalysts: 5,
            maxSales: 5,
            maxTeammates: 5,
            maxTransactionTax: 5,
          })
        )
    );
  });

  beforeEach(async () => {
    await trx("organization_services").del();
    await trx("users_organization_roles").del();
    await trx("users_organizations").del();
    await trx("organizations").del();
    await trx("organization_additional_infos").del();
    await trx("users").del();
    signUpCreated = await UserService.signUp(signUpPayload, trx);
    userToken = { origin: "user", id: signUpCreated.id };

    const organizationCreated = await service.createOrganization(
      createOrganizationPayload(),
      { client: userToken, redisClient },
      trx
    );

    const currentOrganizationPayload = {
      organizationId: organizationCreated.id,
    };

    await service.setCurrentOrganization(
      currentOrganizationPayload,
      { client: userToken, redisClient },
      trx
    );

    context = { client: userToken, organizationId: organizationCreated.id };

    teammates = await service.inviteTeammates(
      inviteTeammatesInput,
      context,
      trx
    );
  });

  afterAll(async () => {
    await trx.rollback();
    await trx.destroy();
    redisClient.end();
    return new Promise((resolve) => {
      resolve();
    });
  });

  test("user organization founder should inative teammates", async (done) => {
    let inativeTeammatesIds = {
      userOrganizationId: teammates[0].id,
      activity: false,
    };

    await service.handleTeammatesActivity(inativeTeammatesIds, context, trx);

    const usersOrganization = await (trx || knexDatabase.knex)(
      "users_organizations"
    )
      .where("active", true)
      .select();

    expect(usersOrganization).toHaveLength(1);

    done();
  });

  test("user organization founder not should inative other affiliate with teammates function", async (done) => {
    const vtexSecrets = {
      xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
      xVtexApiAppToken:
        "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
      accountName: "beightoneagency",
    };

    // await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

    const invitedServiceMembers = await service.inviteAffiliateServiceMembers(
      inviteAffiliatesInput,
      context,
      trx
    );

    let inativeAffiliateIds = {
      userOrganizationId: invitedServiceMembers[0].id,
      activity: false,
    };

    try {
      await service.handleTeammatesActivity(inativeAffiliateIds, context, trx);
    } catch (error) {
      expect(error.message).toBe(MESSAGE_ERROR_USER_NOT_TEAMMATE);
      const usersOrganization = await (trx || knexDatabase.knex)(
        "users_organizations"
      )
        .where("active", true)
        .select();
      expect(usersOrganization).toHaveLength(3);
      done();
    }
  });
});
