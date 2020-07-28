process.env.NODE_ENV = "test";
import service from "../service";
import UserService from "../../../services/users/service";
import OrganizationService from "../../../services/organization/service";
import IntegrationService from "../../../services/integration/service";
import { createOrganizationPayload, vtexSecretsMock } from "../../../__mocks__";
import Faker from "faker";
import { Transaction } from "knex";
import { ISignUpAdapted } from "../../../services/users/types";
import { IUserToken } from "../../../services/authentication/types";
import OrganizationRulesService from "../../../services/organization-rules/service";
jest.mock("../../../services/organization-rules/service");
import { IOrganizationAdapted } from "../../../services/organization/types";
import knexDatabase from "../../../knex-database";
import { IServiceAdaptedFromDB } from "../../../services/services/types";
import { IContext } from "../../../common/types";
import redisClient from "../../../lib/Redis";
import { Integrations } from "../../../services/integration/types";

describe("Affiliate - Handle Commission By Department Id", () => {
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

    await redisClient.flushall("ASYNC");

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
  });

  beforeEach(async () => {
    await IntegrationService.createIntegration(vtexSecretsMock, context, trx);
  });

  afterAll(async () => {
    await trx.rollback();
    await trx.destroy();
    await redisClient.end();
    return new Promise((resolve) => {
      resolve();
    });
  });

  test("organization admin get organization commissions", async (done) => {
    const organizationCommissionInput = {
      departmentId: "1",
      commissionPercentage: 15.5,
      active: true,
    };

    await service.handleOrganizationCommission(
      organizationCommissionInput,
      context,
      trx
    );

    const organizationCommissions = await service.getOrganizationCommissionByOrganizationId(
      context,
      trx
    );

    expect(organizationCommissions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          departmentId: organizationCommissionInput.departmentId,
          commissionPercentage: String(
            organizationCommissionInput.commissionPercentage.toFixed(2)
          ),
          active: organizationCommissionInput.active,
          type: Integrations.VTEX,
        }),
      ])
    );

    done();
  });
});
