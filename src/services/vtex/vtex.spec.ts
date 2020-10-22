process.env.NODE_ENV = "test";
import UserService from "../users/service";
import OrganizationService from "../organization/service";
import AffiliateService from "../affiliate/service";
import VtexService from "../vtex/service";
import Faker from "faker";
import database from "../../knex-database";
import { Transaction } from "knex";
import { ISignUpAdapted } from "../users/types";
import { IUserToken } from "../authentication/types";
import {
  IOrganizationAdapted,
  OrganizationInviteStatus,
} from "../organization/types";
import knexDatabase from "../../knex-database";
import service from "./service";
import {
  mockVtexDepartments,
  createOrganizationPayload,
} from "../../__mocks__";
import { ServiceRoles } from "../services/types";
import redisClient from "../../lib/Redis";

describe("Vtex", () => {
  let trx: Transaction;

  let signUpCreated: ISignUpAdapted;

  let signUpPayload = {
    username: Faker.name.firstName(),
    email: Faker.internet.email(),
    password: "B8oneTeste123!",
  };

  let userToken: IUserToken;
  let organizationCreated: IOrganizationAdapted;

  beforeAll(async () => {
    trx = await database.knexConfig.transaction();
  });

  afterAll(async () => {
    await trx.rollback();
    await trx.destroy();
    return new Promise((resolve) => {
      resolve();
    });
  });

  beforeEach(async () => {
    await trx("organization_services_def_commission").del();
    await trx("organization_services_time_to_pay").del();
    await trx("organization_vtex_comission").del();
    await trx("organization_vtex_secrets").del();
    await trx("users_organization_roles").del();
    await trx("users_organization_service_roles").del();
    await trx("organization_services").del();
    await trx("users_organizations").del();
    await trx("organizations").del();
    await trx("users").del();
    signUpCreated = await UserService.signUp(signUpPayload, trx);
    userToken = { origin: "user", id: signUpCreated.id };
    const [userFromDb] = await (trx || knexDatabase.knexConfig)("users")
      .where("id", signUpCreated.id)
      .select("verification_hash");
    await UserService.verifyEmail(userFromDb.verification_hash, trx);
    organizationCreated = await OrganizationService.createOrganization(
      createOrganizationPayload(),
      { client: userToken, redisClient },
      trx
    );
  });

  test("organization admin should add vtex secrets and hook attached", async (done) => {
    const vtexSecrets = {
      xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
      xVtexApiAppToken:
        "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
      accountName: "beightoneagency",
    };

    const organizationId = organizationCreated.id;

    const context = { client: userToken, organizationId };

    // const verifyVtexOrderResource = await service.verifyAndAttachVtexSecrets(
    //   vtexSecrets,
    //   context,
    //   trx
    // );

    // expect(verifyVtexOrderResource).toBeTruthy();

    const vtexSecretsOnDb = await (trx || knexDatabase.knexConfig)(
      "organization_vtex_secrets"
    ).select();

    expect(vtexSecretsOnDb).toHaveLength(1);
    expect(vtexSecretsOnDb).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          organization_id: organizationCreated.id,
          store_name: vtexSecrets.accountName,
          vtex_key: vtexSecrets.xVtexApiAppKey,
          vtex_token: vtexSecrets.xVtexApiAppToken,
        }),
      ])
    );

    done();
  });

  test("organization admin should add false vtex secrets", async (done) => {
    const vtexSecrets = {
      xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
      xVtexApiAppToken: "KDOAKOD",
      accountName: "beightoneagency",
    };

    const organizationId = organizationCreated.id;

    const context = { client: userToken, organizationId };

    try {
      // await service.verifyAndAttachVtexSecrets(vtexSecrets, context, trx);
    } catch (e) {
      expect(e.message).toBe("Acesso não autorizado");
    }

    done();
  });

  test("organization admin should change vtex secrets", async (done) => {
    const vtexSecrets = {
      xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
      xVtexApiAppToken:
        "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
      accountName: "beightoneagency",
    };

    const organizationId = organizationCreated.id;

    const context = { client: userToken, organizationId };

    // const verifyVtexOrderResource = await service.verifyAndAttachVtexSecrets(
    //   vtexSecrets,
    //   context,
    //   trx
    // );

    // expect(verifyVtexOrderResource).toBeTruthy();

    const newVtexSecrets = {
      xVtexApiAppKey: "vtexappkey-beightoneagency-IQMERK",
      xVtexApiAppToken:
        "KLWRMMNMNBADAMKNIZJCIPXDGFTWXOLAYWDQOOQKLFVQFUUFMLVKWHFVOTLHSQOZPZFEJUYTJYQCTHYLLOJMSBEQQHCVCJSVRWBFPPWSNBAXRCCGUZVEGCGNVPNBRCRA",
      accountName: "beightoneagency",
    };

    // const verifyVtexOrderResourceChange = await service.verifyAndAttachVtexSecrets(
    //   newVtexSecrets,
    //   context,
    //   trx
    // );

    // expect(verifyVtexOrderResourceChange).toBeTruthy();

    const vtexSecretsOnDb = await (trx || knexDatabase.knexConfig)(
      "organization_vtex_secrets"
    ).select();

    expect(vtexSecretsOnDb).toHaveLength(1);
    expect(vtexSecretsOnDb).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          organization_id: organizationCreated.id,
          store_name: newVtexSecrets.accountName,
          vtex_key: newVtexSecrets.xVtexApiAppKey,
          vtex_token: newVtexSecrets.xVtexApiAppToken,
        }),
      ])
    );

    done();
  });

  test("user should get vtex integration departments", async (done) => {
    const vtexSecrets = {
      xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
      xVtexApiAppToken:
        "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
      accountName: "beightoneagency",
    };

    const organizationId = organizationCreated.id;

    const context = { client: userToken, organizationId };

    // await service.verifyAndAttachVtexSecrets(vtexSecrets, context, trx);

    const getVtexDepartmentsPayload = {
      organizationId: organizationCreated.id,
    };

    const vtexDepartments = await service.getVtexDepartments(
      getVtexDepartmentsPayload,
      userToken,
      trx
    );

    expect(vtexDepartments).toBeDefined();

    done();
  });

  test("user should list vtex comission actived or inactived", async (done) => {
    const vtexSecrets = {
      xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
      xVtexApiAppToken:
        "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
      accountName: "beightoneagency",
    };

    const organizationId = organizationCreated.id;

    const context = { client: userToken, organizationId };

    // await service.verifyAndAttachVtexSecrets(vtexSecrets, context, trx);

    await (trx || knexDatabase.knexConfig)("organization_vtex_comission").insert({
      organization_id: organizationCreated.id,
      vtex_department_id: 1,
      vtex_commission_percentage: 15,
    });

    const vtexCommissions = await service.getVtexDepartmentsCommissions(
      context,
      trx
    );

    expect(vtexCommissions).toEqual(
      expect.objectContaining(
        mockVtexDepartments.map((item) =>
          expect.objectContaining({
            id: item.id,
            name: item.name,
            url: item.url,
            active: item.id === 1,
            percentage: item.id === 1 ? 15 : null,
          })
        )
      )
    );

    done();
  });

  test("org admin should handle vtex comission and active", async (done) => {
    const vtexSecrets = {
      xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
      xVtexApiAppToken:
        "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
      accountName: "beightoneagency",
    };

    const organizationId = organizationCreated.id;

    const context = { client: userToken, organizationId };

    // await service.verifyAndAttachVtexSecrets(vtexSecrets, context, trx);

    const handleOrganizationVtexComissionPayload = {
      vtexDepartmentId: "1",
      vtexCommissionPercentage: 15,
      active: true,
    };

    const organizationVtexComissionAdded = await service.handleOrganizationVtexComission(
      handleOrganizationVtexComissionPayload,
      context,
      trx
    );

    expect(organizationVtexComissionAdded).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        organizationId: organizationCreated.id,
        vtexDepartmentId:
          handleOrganizationVtexComissionPayload.vtexDepartmentId,
        vtexCommissionPercentage:
          handleOrganizationVtexComissionPayload.vtexCommissionPercentage,
        active: handleOrganizationVtexComissionPayload.active,
        updatedAt: expect.any(Date),
        createdAt: expect.any(Date),
      })
    );

    const vtexCommissions = await service.getVtexDepartmentsCommissions(
      context,
      trx
    );

    expect(vtexCommissions).toEqual(
      expect.objectContaining(
        mockVtexDepartments.map((item) =>
          expect.objectContaining({
            id: item.id,
            name: item.name,
            url: item.url,
            active: item.id === 1,
            percentage: item.id === 1 ? 15 : null,
          })
        )
      )
    );

    done();
  });

  test("org admin should handle vtex comission to inactive", async (done) => {
    const vtexSecrets = {
      xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
      xVtexApiAppToken:
        "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
      accountName: "beightoneagency",
    };

    const organizationId = organizationCreated.id;

    const context = { client: userToken, organizationId };

    // await service.verifyAndAttachVtexSecrets(vtexSecrets, context, trx);

    const handleOrganizationVtexComissionPayload = {
      vtexDepartmentId: "1",
      vtexCommissionPercentage: 15,
      active: true,
    };

    await service.handleOrganizationVtexComission(
      handleOrganizationVtexComissionPayload,
      context,
      trx
    );

    const handleOrganizationVtexComissionDesactivePayload = {
      vtexDepartmentId: "1",
      vtexCommissionPercentage: 15,
      active: false,
    };

    const organizationVtexComissionDesactived = await service.handleOrganizationVtexComission(
      handleOrganizationVtexComissionDesactivePayload,
      context,
      trx
    );

    expect(organizationVtexComissionDesactived).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        organizationId: organizationCreated.id,
        vtexDepartmentId:
          handleOrganizationVtexComissionPayload.vtexDepartmentId,
        vtexCommissionPercentage:
          handleOrganizationVtexComissionPayload.vtexCommissionPercentage,
        active: handleOrganizationVtexComissionDesactivePayload.active,
        updatedAt: expect.any(Date),
        createdAt: expect.any(Date),
      })
    );

    const vtexCommissions = await service.getVtexDepartmentsCommissions(
      context,
      trx
    );

    expect(vtexCommissions).toEqual(
      expect.objectContaining(
        mockVtexDepartments.map((item) =>
          expect.objectContaining({
            id: item.id,
            name: item.name,
            url: item.url,
            active: false,
            percentage: item.id === 1 ? 15 : null,
          })
        )
      )
    );

    done();
  });

  test("get comission/(vtex department id) (id do afiliado) ->", async (done) => {
    const organizationId = organizationCreated.id;

    const context = { client: userToken, organizationId };

    let otherSignUpPayload = {
      username: Faker.name.firstName(),
      email: Faker.internet.email(),
      password: "B8oneTeste123!",
    };

    let otherSignUpCreated = await UserService.signUp(otherSignUpPayload, trx);
    const [userFromDb] = await (trx || knexDatabase.knexConfig)("users")
      .where("id", otherSignUpCreated.id)
      .select("verification_hash");
    await UserService.verifyEmail(userFromDb.verification_hash, trx);

    const vtexSecrets = {
      xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
      xVtexApiAppToken:
        "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
      accountName: "beightoneagency",
    };

    // await VtexService.verifyAndAttachVtexSecrets(vtexSecrets, context, trx);

    const inviteAffiliatesInput = {
      users: [
        {
          email: otherSignUpCreated.email,
          role: ServiceRoles.ANALYST,
        },
      ],
    };

    await OrganizationService.inviteAffiliateServiceMembers(
      inviteAffiliatesInput,
      context,
      trx
    );

    const [invitedUserToOrganization] = await (trx || knexDatabase.knexConfig)(
      "users_organizations"
    )
      .where("user_id", otherSignUpCreated.id)
      .andWhere("organization_id", organizationCreated.id)
      .select("invite_hash", "id");

    const responseInvitePayload = {
      inviteHash: invitedUserToOrganization.invite_hash,
      response: OrganizationInviteStatus.ACCEPT,
    };

    await OrganizationService.responseInvite(responseInvitePayload, trx);

    const handleOrganizationVtexComissionPayload = {
      vtexDepartmentId: "1",
      vtexCommissionPercentage: 15,
      active: true,
    };

    const organizationVtexComissionAdded = await service.handleOrganizationVtexComission(
      handleOrganizationVtexComissionPayload,
      context,
      trx
    );

    const handleTimeToPayCommissionPayload = {
      days: 30,
    };

    await AffiliateService.handleTimeToPayCommission(
      handleTimeToPayCommissionPayload,
      context,
      trx
    );

    const [userInOrganizationService] = await (trx || knexDatabase.knexConfig)(
      "users_organization_service_roles"
    ).select();

    const vtexComissionsByAffiliateIdAndDepartmentIdPayload = {
      vtexDepartmentsIds: ["1", "2"],
      affiliateId: userInOrganizationService.id,
    };

    const vtexComissionsByAffiliateIdAndDepartmentId = await service.getVtexCommissionInfosByAffiliateIdAndDepartmentId(
      vtexComissionsByAffiliateIdAndDepartmentIdPayload,
      trx
    );

    expect(vtexComissionsByAffiliateIdAndDepartmentId).toStrictEqual([
      expect.objectContaining({
        vtexDepartmentId: "1",
        percentage:
          handleOrganizationVtexComissionPayload.vtexCommissionPercentage,
        payDay: String(handleTimeToPayCommissionPayload.days),
      }),
      expect.objectContaining({
        vtexDepartmentId: "2",
        percentage: null,
        payDay: String(handleTimeToPayCommissionPayload.days),
      }),
    ]);

    done();
  });

  test("get comission/(vtex department id) (id do afiliado) -> with default commission", async (done) => {
    const organizationId = organizationCreated.id;

    const context = { client: userToken, organizationId };

    let otherSignUpPayload = {
      username: Faker.name.firstName(),
      email: Faker.internet.email(),
      password: "B8oneTeste123!",
    };

    let otherSignUpCreated = await UserService.signUp(otherSignUpPayload, trx);
    const [userFromDb] = await (trx || knexDatabase.knexConfig)("users")
      .where("id", otherSignUpCreated.id)
      .select("verification_hash");
    await UserService.verifyEmail(userFromDb.verification_hash, trx);

    const vtexSecrets = {
      xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
      xVtexApiAppToken:
        "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
      accountName: "beightoneagency",
    };

    // await VtexService.verifyAndAttachVtexSecrets(vtexSecrets, context, trx);

    const inviteAffiliatesInput = {
      users: [
        {
          email: otherSignUpCreated.email,
          role: ServiceRoles.ANALYST,
        },
      ],
    };

    await OrganizationService.inviteAffiliateServiceMembers(
      inviteAffiliatesInput,
      context,
      trx
    );

    const [invitedUserToOrganization] = await (trx || knexDatabase.knexConfig)(
      "users_organizations"
    )
      .where("user_id", otherSignUpCreated.id)
      .andWhere("organization_id", organizationCreated.id)
      .select("invite_hash", "id");

    const responseInvitePayload = {
      inviteHash: invitedUserToOrganization.invite_hash,
      response: OrganizationInviteStatus.ACCEPT,
    };

    await OrganizationService.responseInvite(responseInvitePayload, trx);

    const handleDefaultCommission = {
      percentage: 10,
    };

    await AffiliateService.handleDefaultommission(
      handleDefaultCommission,
      context,
      trx
    );

    const [userInOrganizationService] = await (trx || knexDatabase.knexConfig)(
      "users_organization_service_roles"
    ).select();

    const vtexComissionsByAffiliateIdAndDepartmentIdPayload = {
      vtexDepartmentsIds: ["1"],
      affiliateId: userInOrganizationService.id,
    };

    const vtexComissionsByAffiliateIdAndDepartmentId = await service.getVtexCommissionInfosByAffiliateIdAndDepartmentId(
      vtexComissionsByAffiliateIdAndDepartmentIdPayload,
      trx
    );

    expect(vtexComissionsByAffiliateIdAndDepartmentId).toStrictEqual([
      expect.objectContaining({
        vtexDepartmentId: "1",
        percentage: handleDefaultCommission.percentage.toFixed(2),
        payDay: null,
      }),
    ]);

    done();
  });
});
