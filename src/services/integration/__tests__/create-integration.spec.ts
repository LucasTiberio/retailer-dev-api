import OrganizationRulesService from "../../organization-rules/service";
jest.mock("../../organization-rules/service");
import service from "../service";
import UserService from "../../users/service";
import OrganizationService from "../../organization/service";
import { Transaction } from "knex";
import knexDatabase from "../../../knex-database";
import { createOrganizationPayload } from "../../../__mocks__";
import { ISignUpAdapted } from "../../users/types";
import { IUserToken } from "../../authentication/types";
import Faker from "faker";
import redisClient from "../../../lib/Redis";
import { IContext } from "../../../common/types";
import { Integrations } from "../types";
import common from "../../../common";

describe("create integration", () => {
  let trx: Transaction;

  let signUpCreated: ISignUpAdapted;

  let signUpPayload = {
    username: Faker.name.firstName(),
    email: Faker.internet.email(),
    password: "B8oneTeste123!",
  };

  let userToken: IUserToken;

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
  });

  beforeEach(async () => {
    await trx("organization_integration_secrets").del();
    await trx("integration_secrets").del();
    await trx("organization_services").del();
    await trx("users_organization_roles").del();
    await trx("users_organizations").del();
    await trx("organizations").del();
    await trx("organization_additional_infos").del();
    await trx("users").del();
    signUpCreated = await UserService.signUp(signUpPayload, trx);
    userToken = { origin: "user", id: signUpCreated.id };

    const organizationCreated = await OrganizationService.createOrganization(
      createOrganizationPayload(),
      { client: userToken, redisClient },
      trx
    );

    const currentOrganizationPayload = {
      organizationId: organizationCreated.id,
    };

    await OrganizationService.setCurrentOrganization(
      currentOrganizationPayload,
      { client: userToken, redisClient },
      trx
    );

    context = { client: userToken, organizationId: organizationCreated.id };
  });

  afterAll(async () => {
    await trx.rollback();
    await trx.destroy();
    redisClient.end();
    return new Promise((resolve) => {
      resolve();
    });
  });

  test("user organization admin should create vtex integration", async (done) => {
    const createIntegrationInput = {
      secrets: {
        xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
        xVtexApiAppToken:
          "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
        accountName: "beightoneagency",
      },
      type: Integrations.VTEX,
    };

    const secretCreated = await service.createIntegration(
      createIntegrationInput,
      context,
      trx
    );

    expect(secretCreated).toBe(true);

    const integrationSecrets = await (trx || knexDatabase.knex)(
      "integration_secrets"
    )
      .first()
      .select();

    expect(integrationSecrets).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        secret: common.jwtEncode(createIntegrationInput.secrets),
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      })
    );

    const organizationIntegration = await (trx || knexDatabase.knex)(
      "organization_integration_secrets"
    )
      .first()
      .select();

    expect(organizationIntegration).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        active: true,
        type: Integrations.VTEX,
        organization_id: context.organizationId,
        integration_secrets_id: integrationSecrets.id,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      })
    );

    done();
  });

  test("user organization admin should create the same vtex integration", async (done) => {
    const createIntegrationInput = {
      secrets: {
        xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
        xVtexApiAppToken:
          "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
        accountName: "beightoneagency",
      },
      type: Integrations.VTEX,
    };

    await service.createIntegration(createIntegrationInput, context, trx);

    const secretCreated = await service.createIntegration(
      createIntegrationInput,
      context,
      trx
    );

    expect(secretCreated).toBe(true);

    const integrationSecrets = await (trx || knexDatabase.knex)(
      "integration_secrets"
    ).select();

    expect(integrationSecrets).toHaveLength(1);

    const organizationIntegration = await (trx || knexDatabase.knex)(
      "organization_integration_secrets"
    ).select();

    expect(organizationIntegration).toHaveLength(1);

    done();
  });

  test("user organization admin should create loja integrada integration", async (done) => {
    const createIntegrationInput = {
      secrets: {
        appKey: "f0ceb7be2309c30ba3bd",
      },
      type: Integrations.LOJA_INTEGRADA,
    };

    const secretCreated = await service.createIntegration(
      createIntegrationInput,
      context,
      trx
    );

    expect(secretCreated).toBe(true);

    const integrationSecrets = await (trx || knexDatabase.knex)(
      "integration_secrets"
    )
      .first()
      .select();

    expect(integrationSecrets).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        secret: common.jwtEncode(createIntegrationInput.secrets),
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      })
    );

    const organizationIntegration = await (trx || knexDatabase.knex)(
      "organization_integration_secrets"
    )
      .first()
      .select();

    expect(organizationIntegration).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        active: true,
        type: Integrations.LOJA_INTEGRADA,
        organization_id: context.organizationId,
        integration_secrets_id: integrationSecrets.id,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      })
    );

    done();
  });

  test("user organization admin should create loja integrada integration after vtex ingration and inative vtex", async (done) => {
    const createVTEXIntegrationInput = {
      secrets: {
        xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
        xVtexApiAppToken:
          "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
        accountName: "beightoneagency",
      },
      type: Integrations.VTEX,
    };

    await service.createIntegration(createVTEXIntegrationInput, context, trx);

    const createIntegrationInput = {
      secrets: {
        appKey: "f0ceb7be2309c30ba3bd",
      },
      type: Integrations.LOJA_INTEGRADA,
    };

    const secretCreated = await service.createIntegration(
      createIntegrationInput,
      context,
      trx
    );

    expect(secretCreated).toBe(true);

    const integrationSecrets = await (trx || knexDatabase.knex)(
      "integration_secrets"
    ).select();

    expect(integrationSecrets).toHaveLength(2);

    const organizationIntegration = await (trx || knexDatabase.knex)(
      "organization_integration_secrets"
    ).select();

    expect(organizationIntegration).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          active: true,
          type: Integrations.LOJA_INTEGRADA,
          organization_id: context.organizationId,
          integration_secrets_id: expect.any(String),
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
        }),
        expect.objectContaining({
          id: expect.any(String),
          active: false,
          type: Integrations.VTEX,
          organization_id: context.organizationId,
          integration_secrets_id: expect.any(String),
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
        }),
      ])
    );

    done();
  });
});
