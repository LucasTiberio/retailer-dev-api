process.env.NODE_ENV = "test";
import service from "../service";
import OrganizationRulesService from "../../organization-rules/service";
jest.mock("../../organization-rules/service");
import UserService from "../../users/service";
import OrganizationService from "../../organization/service";
import VtexService from "../../vtex/service";
import Faker from "faker";
import database from "../../../knex-database";
import { Transaction } from "knex";
import { ISignUpAdapted } from "../../users/types";
import { IUserToken } from "../../authentication/types";
import { Services, IServiceAdaptedFromDB, ServiceRoles } from "../types";
import {
  IOrganizationAdapted,
  OrganizationInviteStatus,
} from "../../organization/types";
import knexDatabase from "../../../knex-database";
import { IContext } from "../../../common/types";
import { createOrganizationPayload } from "../../../__mocks__";
import redisClient from "../../../lib/Redis";
import { MESSAGE_ERROR_UPGRADE_PLAN } from "../../../common/consts";

describe("Services", () => {
  let trx: Transaction;

  let signUpCreated: ISignUpAdapted;

  let signUpPayload = {
    username: Faker.name.firstName(),
    email: Faker.internet.email(),
    password: "B8oneTeste123!",
  };

  let userToken: IUserToken;
  let organizationCreated: IOrganizationAdapted;
  let serviceFound: IServiceAdaptedFromDB;
  let context: IContext;

  beforeAll(async () => {
    trx = await database.knex.transaction();

    const [serviceFoundDB] = await (trx || knexDatabase.knex)("services")
      .where("name", Services.AFFILIATE)
      .select("id");
    serviceFound = serviceFoundDB;

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

  afterAll(async () => {
    await trx.rollback();
    await trx.destroy();
    return new Promise((resolve) => {
      resolve();
    });
  });

  beforeEach(async () => {
    await trx("affiliate_vtex_campaign").del();
    await trx("organization_vtex_secrets").del();
    await trx("users_organization_service_roles").del();
    await trx("users_organization_roles").del();
    await trx("users_organizations").del();
    await trx("organization_services").del();
    await trx("organizations").del();
    await trx("users").del();
    signUpCreated = await UserService.signUp(signUpPayload, trx);
    userToken = { origin: "user", id: signUpCreated.id };
    organizationCreated = await OrganizationService.createOrganization(
      createOrganizationPayload(),
      { client: userToken, redisClient },
      trx
    );
    const [userFromDb] = await (trx || knexDatabase.knex)("users")
      .where("id", signUpCreated.id)
      .select("verification_hash");
    await UserService.verifyEmail(userFromDb.verification_hash, trx);
    context = { client: userToken, organizationId: organizationCreated.id };

    const vtexSecrets = {
      xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
      xVtexApiAppToken:
        "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
      accountName: "beightoneagency",
    };

    // await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);
  });

  test("organization admin should handle user service to sale role", async (done) => {
    const vtexSecrets = {
      xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
      xVtexApiAppToken:
        "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
      accountName: "beightoneagency",
    };

    // await VtexService.verifyAndAttachVtexSecrets(vtexSecrets, context, trx);

    const inviteAffiliatesInput = {
      users: Array(1)
        .fill(0)
        .map(() => ({
          email: Faker.internet.email(),
          role: ServiceRoles.ANALYST,
        })),
    };

    const invitedServiceMembers = await OrganizationService.inviteAffiliateServiceMembers(
      inviteAffiliatesInput,
      context,
      trx
    );

    const userInOrganizationService = await (trx || knexDatabase.knex)(
      "users_organization_service_roles"
    )
      .first()
      .select();

    const affiliateAnalystRole = await (trx || knexDatabase.knex)(
      "service_roles"
    )
      .where("name", ServiceRoles.ANALYST)
      .first()
      .select("id");

    expect(userInOrganizationService.service_roles_id).toBe(
      affiliateAnalystRole.id
    );

    const handleServiceMemberRole = await service.handleServiceMembersRole(
      {
        serviceName: Services.AFFILIATE,
        serviceRole: ServiceRoles.SALE,
        userOrganizationServiceRoleId: userInOrganizationService.id,
      },
      context,
      trx
    );

    const userInOrganizationServiceChanged = await (trx || knexDatabase.knex)(
      "users_organization_service_roles"
    )
      .first()
      .select();

    const affiliateSaleRole = await (trx || knexDatabase.knex)("service_roles")
      .where("name", ServiceRoles.SALE)
      .first()
      .select("id");

    expect(userInOrganizationServiceChanged.service_roles_id).toBe(
      affiliateSaleRole.id
    );

    done();
  });

  test("organization admin not should handle user service to sale role with no available space", async (done) => {
    const vtexSecrets = {
      xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
      xVtexApiAppToken:
        "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
      accountName: "beightoneagency",
    };

    // await VtexService.verifyAndAttachVtexSecrets(vtexSecrets, context, trx);

    const inviteAffiliatesInput = {
      users: Array(5)
        .fill(0)
        .map(() => ({
          email: Faker.internet.email(),
          role: ServiceRoles.ANALYST,
        })),
    };

    await OrganizationService.inviteAffiliateServiceMembers(
      inviteAffiliatesInput,
      context,
      trx
    );

    const inviteSaleInput = {
      users: Array(5)
        .fill(0)
        .map(() => ({
          email: Faker.internet.email(),
          role: ServiceRoles.SALE,
        })),
    };

    await OrganizationService.inviteAffiliateServiceMembers(
      inviteSaleInput,
      context,
      trx
    );

    const userInOrganizationService = await (trx || knexDatabase.knex)(
      "users_organization_service_roles"
    )
      .first()
      .select();

    try {
      await service.handleServiceMembersRole(
        {
          serviceName: Services.AFFILIATE,
          serviceRole: ServiceRoles.SALE,
          userOrganizationServiceRoleId: userInOrganizationService.id,
        },
        context,
        trx
      );
    } catch (error) {
      expect(error.message).toBe(MESSAGE_ERROR_UPGRADE_PLAN);
    }

    done();
  });
});

//handleServiceMembersRole
