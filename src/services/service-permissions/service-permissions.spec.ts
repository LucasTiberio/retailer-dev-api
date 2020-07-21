process.env.NODE_ENV = "test";
import UserService from "../users/service";
import OrganizationService from "../organization/service";
import ServicesService from "../services/service";
import VtexService from "../vtex/service";
import service from "./service";
import Faker from "faker";
import { Transaction } from "knex";
import { ISignUpAdapted } from "../users/types";
import { IUserToken } from "../authentication/types";
import knexDatabase from "../../knex-database";
import redisClient from "../../lib/Redis";
import { createOrganizationPayload } from "../../__mocks__";
import { IContext } from "../../common/types";
import { IOrganizationAdapted } from "../organization/types";
import { PermissionGrant, ServicePermissionName } from "./types";
import { Services, ServiceRoles } from "../services/types";

describe("Organization Permissions", () => {
  let trx: Transaction;

  let signUpCreated: ISignUpAdapted;

  let signUpPayload = {
    username: Faker.name.firstName(),
    email: Faker.internet.email(),
    password: "B8oneTeste123!",
  };

  let userToken: IUserToken;

  let context: IContext;

  let organizationCreated: IOrganizationAdapted;

  beforeAll(async () => {
    trx = await knexDatabase.knex.transaction();
  });

  afterAll(async () => {
    await trx.rollback();
    await trx.destroy();
    redisClient.end();
    return new Promise((resolve) => {
      resolve();
    });
  });

  beforeEach(async () => {
    await trx("users_organization_service_roles").del();
    await trx("organization_services").del();
    await trx("users_organization_roles").del();
    await trx("users_organizations").del();
    await trx("organizations").del();
    await trx("users").del();
    await redisClient.flushall("ASYNC");
    signUpCreated = await UserService.signUp(signUpPayload, trx);
    userToken = { origin: "user", id: signUpCreated.id };

    organizationCreated = await OrganizationService.createOrganization(
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

  test("user organization admin should get your service permissions", async (done) => {
    context.isOrganizationAdmin = true;

    const userOrganizationPermission = await service.userServicePermissions(
      { serviceName: Services.AFFILIATE },
      context,
      trx
    );

    const serviceByName = await ServicesService.getServiceByName(
      Services.AFFILIATE,
      trx
    );

    let permissions = ["commission", "orders", "generateLink", "payments"];

    expect(userOrganizationPermission).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          permissionName: permissions[0],
          serviceRoleName: ServiceRoles.ADMIN,
          grant: PermissionGrant.write,
          serviceId: serviceByName.id,
        }),
        expect.objectContaining({
          id: expect.any(String),
          permissionName: permissions[1],
          serviceRoleName: ServiceRoles.ADMIN,
          grant: PermissionGrant.read,
          serviceId: serviceByName.id,
        }),
        expect.objectContaining({
          id: expect.any(String),
          permissionName: permissions[2],
          serviceRoleName: ServiceRoles.ADMIN,
          grant: PermissionGrant.hide,
          serviceId: serviceByName.id,
        }),
      ])
    );

    done();
  });

  test("user organization admin should get your permissions by name", async (done) => {
    const userServicePermissionsPayload = {
      name: ServicePermissionName.commission,
      serviceName: Services.AFFILIATE,
    };

    context.isOrganizationAdmin = true;

    const userServicePermission = await service.userServicePermissions(
      userServicePermissionsPayload,
      context,
      trx
    );

    const serviceByName = await ServicesService.getServiceByName(
      Services.AFFILIATE,
      trx
    );

    expect(userServicePermission).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          permissionName: userServicePermissionsPayload.name,
          serviceRoleName: ServiceRoles.ADMIN,
          grant: PermissionGrant.write,
          serviceId: serviceByName.id,
        }),
      ])
    );

    done();
  });

  test("user service analyst should get your permissions", async (done) => {
    let permissions = ["commission", "orders", "generateLink", "payments"];

    let otherSignUpPayload = {
      username: Faker.name.firstName(),
      email: Faker.internet.email(),
      password: "B8oneTeste123!",
    };

    let otherSignUpCreated = await UserService.signUp(otherSignUpPayload, trx);
    const [userFromDb] = await (trx || knexDatabase.knex)("users")
      .where("id", otherSignUpCreated.id)
      .select("verification_hash");
    await UserService.verifyEmail(userFromDb.verification_hash, trx);

    //add vtex secrets

    const vtexSecrets = {
      xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
      xVtexApiAppToken:
        "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
      accountName: "beightoneagency",
    };

    // await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

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

    //set currento other organization
    const currentOrganizationPayload = {
      organizationId: organizationCreated.id,
    };

    let otherUserToken = { origin: "user", id: otherSignUpCreated.id };

    await OrganizationService.setCurrentOrganization(
      currentOrganizationPayload,
      { client: otherUserToken, redisClient },
      trx
    );

    let otherContext = {
      client: otherUserToken,
      organizationId: organizationCreated.id,
      isOrganizationAdmin: false,
    };

    const userOrganizationPermission = await service.userServicePermissions(
      { serviceName: Services.AFFILIATE },
      otherContext,
      trx
    );

    const serviceByName = await ServicesService.getServiceByName(
      Services.AFFILIATE,
      trx
    );

    expect(userOrganizationPermission).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          permissionName: permissions[0],
          serviceRoleName: ServiceRoles.ANALYST,
          grant: PermissionGrant.read,
          serviceId: serviceByName.id,
        }),
        expect.objectContaining({
          id: expect.any(String),
          permissionName: permissions[1],
          serviceRoleName: ServiceRoles.ANALYST,
          grant: PermissionGrant.read,
          serviceId: serviceByName.id,
        }),
        expect.objectContaining({
          id: expect.any(String),
          permissionName: permissions[2],
          serviceRoleName: ServiceRoles.ANALYST,
          grant: PermissionGrant.write,
          serviceId: serviceByName.id,
        }),
      ])
    );

    done();
  });
});
