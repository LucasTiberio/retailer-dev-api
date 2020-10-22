process.env.NODE_ENV = "test";
import service from "./service";
import UserService from "../users/service";
import OrganizationService from "../organization/service";
import IntegrationService from "../integration/service";
import BankDataService from "../bank-data/service";
import VtexService from "../vtex/service";
import { createOrganizationPayload, vtexSecretsMock } from "../../__mocks__";
import Faker from "faker";
import database from "../../knex-database";
import { Transaction } from "knex";
import { ISignUpAdapted } from "../users/types";
import {
  MESSAGE_ERROR_USER_DOES_NOT_HAVE_SALE_ROLE,
  SALE_VTEX_PIXEL_NAMESPACE,
} from "../../common/consts";
import { IUserToken } from "../authentication/types";
import OrganizationRulesService from "../organization-rules/service";
jest.mock("../organization-rules/service");
import {
  IOrganizationAdapted,
  OrganizationInviteStatus,
} from "../organization/types";
import knexDatabase from "../../knex-database";
import {
  IServiceAdaptedFromDB,
  Services,
  ServiceRoles,
} from "../services/types";
import { IContext } from "../../common/types";
import redisClient from "../../lib/Redis";

describe("Affiliate", () => {
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
    trx = await database.knexConfig.transaction();

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

    const [serviceFoundDB] = await (trx || knexDatabase.knexConfig)("services")
      .where("name", Services.AFFILIATE)
      .select("id");
    serviceFound = serviceFoundDB;

    signUpCreated = await UserService.signUp(signUpPayload, trx);
    userToken = { origin: "user", id: signUpCreated.id };
    organizationCreated = await OrganizationService.createOrganization(
      createOrganizationPayload(),
      { client: userToken, redisClient },
      trx
    );
    const [userFromDb] = await (trx || knexDatabase.knexConfig)("users")
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
    await redisClient.end;
    return new Promise((resolve) => {
      resolve();
    });
  });

  afterEach(async () => {
    await trx("users_organization_service_roles_url_shortener").del();
    await trx("url_shorten").del();
    await trx("users_organization_service_roles").del();
    await trx("banks_data").del();
  });

  test("generate shortcode", async (done) => {
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

    const affiliateGenerateShortenerUrlPayload = {
      originalUrl: Faker.internet.url(),
      serviceName: Services.AFFILIATE,
    };

    const affiliateToken = { origin: "user", id: otherSignUpCreated.id };
    const affiliateContext = {
      client: affiliateToken,
      organizationId: organizationCreated.id,
    };

    const affiliateGenerateShortenerUrl = await service.generateShortenerUrl(
      affiliateGenerateShortenerUrlPayload,
      affiliateContext,
      trx
    );

    const [userInOrganizationService] = await (trx || knexDatabase)(
      "users_organization_service_roles"
    ).select();

    const affiliateId = userInOrganizationService.id;

    expect(affiliateGenerateShortenerUrl).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        usersOrganizationServiceRolesId: affiliateId,
        urlShortenId: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    );

    done();
  });

  test("get my short codes", async (done) => {
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

    const affiliateGenerateShortenerUrlPayload = {
      originalUrl: Faker.internet.url(),
      organizationId: organizationCreated.id,
      serviceName: Services.AFFILIATE,
    };

    const affiliateToken = { origin: "user", id: otherSignUpCreated.id };
    const affiliateContext = {
      client: affiliateToken,
      organizationId: organizationCreated.id,
    };

    await service.generateShortenerUrl(
      affiliateGenerateShortenerUrlPayload,
      affiliateContext,
      trx
    );

    const [userInOrganizationService] = await (trx || knexDatabase)(
      "users_organization_service_roles"
    ).select();

    const affiliateId = userInOrganizationService.id;

    const userOrganizationServicePayload = {
      userOrganizationServiceId: affiliateId,
    };

    const shorterUrlByUserOrganizationServiceId = await service.getShorterUrlByUserOrganizationServiceId(
      userOrganizationServicePayload,
      affiliateToken,
      trx
    );

    expect(shorterUrlByUserOrganizationServiceId).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          usersOrganizationServiceRolesId: affiliateId,
          urlShortenId: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      ])
    );

    done();
  });

  test("affiliate should create bank values", async (done) => {
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

    const [userInOrganizationService] = await (trx || knexDatabase)(
      "users_organization_service_roles"
    ).select();

    const affiliateToken = { origin: "user", id: otherSignUpCreated.id };
    const affiliateContext = {
      client: affiliateToken,
      organizationId: organizationCreated.id,
      userServiceOrganizationRolesId: userInOrganizationService.id,
    };

    const getBrazilBanksPayload = {
      name: "260",
    };

    const brazilBanks = await BankDataService.getBrazilBanks(
      getBrazilBanksPayload,
      affiliateContext,
      trx
    );

    const createUserBankValuesPayload = {
      name: Faker.name.firstName(),
      agency: "0000",
      account: "00000",
      accountDigit: "0",
      document: "000000000000",
      brazilBankId: brazilBanks[0].id,
    };

    const affiliateBankValuesCreated = await service.createAffiliateBankValues(
      createUserBankValuesPayload,
      affiliateContext,
      trx
    );

    expect(affiliateBankValuesCreated).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        serviceRolesId: expect.any(String),
        usersOrganizationId: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        active: true,
        bankDataId: expect.any(String),
      })
    );

    done();
  });

  test("affiliate should update bank values", async (done) => {
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

    const [userInOrganizationService] = await (trx || knexDatabase)(
      "users_organization_service_roles"
    ).select();

    const affiliateToken = { origin: "user", id: otherSignUpCreated.id };
    const affiliateContext = {
      client: affiliateToken,
      organizationId: organizationCreated.id,
      userServiceOrganizationRolesId: userInOrganizationService.id,
    };

    const getBrazilBanksPayload = {
      name: "260",
    };

    const brazilBanks = await BankDataService.getBrazilBanks(
      getBrazilBanksPayload,
      affiliateContext,
      trx
    );

    const createUserBankValuesPayload = {
      name: Faker.name.firstName(),
      agency: "0000",
      account: "00000",
      accountDigit: "0",
      document: "000000000000",
      brazilBankId: brazilBanks[0].id,
    };

    await service.createAffiliateBankValues(
      createUserBankValuesPayload,
      affiliateContext,
      trx
    );

    const updateUserBankValuesPayload = {
      name: Faker.name.firstName(),
      agency: "1111",
      account: "11111",
      accountDigit: "1",
      document: "11111111",
      brazilBankId: brazilBanks[0].id,
    };

    const affiliateBankValuesCreated = await service.createAffiliateBankValues(
      updateUserBankValuesPayload,
      affiliateContext,
      trx
    );

    expect(affiliateBankValuesCreated).toEqual(
      expect.objectContaining({
        id: userInOrganizationService.id,
        serviceRolesId: expect.any(String),
        usersOrganizationId: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        active: true,
        bankDataId: expect.any(String),
      })
    );

    const dataBankFound = await (trx || knexDatabase)("banks_data").select();

    expect(dataBankFound).toHaveLength(1);
    expect(dataBankFound).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          agency: updateUserBankValuesPayload.agency,
          account: updateUserBankValuesPayload.account,
          account_digit: updateUserBankValuesPayload.accountDigit,
          document: updateUserBankValuesPayload.document,
          brazil_bank_id: expect.any(String),
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
        }),
      ])
    );

    done();
  });

  test("users admin should not consult sale email", async (done) => {
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

    const generateSalesJWTPayload = {
      email: signUpCreated.email,
      organizationId: organizationCreated.id,
      serviceName: Services.AFFILIATE,
    };

    try {
      await service.generateSalesJWT(
        generateSalesJWTPayload,
        { redisClient },
        trx
      );
    } catch (error) {
      expect(error.message).toBe(MESSAGE_ERROR_USER_DOES_NOT_HAVE_SALE_ROLE);
      done();
    }
  });

  test("users not sale should not consult sale email", async (done) => {
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

    const [userInOrganizationService] = await (trx || knexDatabase)(
      "users_organization_service_roles"
    ).select();

    const generateSalesJWTPayload = {
      email: otherSignUpCreated.email,
      organizationId: organizationCreated.id,
      serviceName: Services.AFFILIATE,
    };

    try {
      await service.generateSalesJWT(
        generateSalesJWTPayload,
        { redisClient },
        trx
      );
    } catch (error) {
      expect(error.message).toBe(MESSAGE_ERROR_USER_DOES_NOT_HAVE_SALE_ROLE);
      done();
    }
  });

  test("users sale should consult sale email and get jwt expire token", async (done) => {
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

    const inviteAffiliatesInput = {
      users: [
        {
          email: otherSignUpCreated.email,
          role: ServiceRoles.SALE,
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

    const [userInOrganizationService] = await (trx || knexDatabase)(
      "users_organization_service_roles"
    ).select();

    const generateSalesJWTPayload = {
      email: otherSignUpCreated.email,
      organizationId: organizationCreated.id,
      serviceName: Services.AFFILIATE,
    };

    const saleServiceUserChecked = await service.generateSalesJWT(
      generateSalesJWTPayload,
      { redisClient },
      trx
    );

    expect(saleServiceUserChecked).toEqual(
      expect.objectContaining({
        salesId: userInOrganizationService.id,
        vtexSalePixelJwt: expect.any(String),
      })
    );

    redisClient.get(
      `${SALE_VTEX_PIXEL_NAMESPACE}_${saleServiceUserChecked.vtexSalePixelJwt}`,
      (_, data) => {
        expect(data).toBe(userInOrganizationService.id);
        redisClient.keys("*", function (_, keys) {
          done();
        });
      }
    );

    done();
  });

  test("users sale should generate utms url and send shorter", async (done) => {
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

    const inviteAffiliatesInput = {
      users: [
        {
          email: otherSignUpCreated.email,
          role: ServiceRoles.SALE,
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

    const [userInOrganizationService] = await (trx || knexDatabase)(
      "users_organization_service_roles"
    ).select();

    const generateSalesJWTPayload = {
      email: otherSignUpCreated.email,
      organizationId: organizationCreated.id,
      serviceName: Services.AFFILIATE,
    };

    await service.generateSalesJWT(
      generateSalesJWTPayload,
      { redisClient },
      trx
    );

    let generateSalesShortenPayload = {
      url:
        "https://www.teste.com.br/checkout/?orderFormId=768a71136a1245e795a28ff81de99406#/cart#",
    };

    const saleShorten = await service.generateSalesShorten(
      generateSalesShortenPayload,
      { salesId: userInOrganizationService.id },
      trx
    );

    expect(saleShorten).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        originalUrl: generateSalesShortenPayload.url,
        shortUrl: expect.any(String),
        urlCode: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    );

    const usersOrganizationServiceRolesUrlShorter = await (
      trx || knexDatabase.knexConfig
    )("users_organization_service_roles_url_shortener").select();

    expect(usersOrganizationServiceRolesUrlShorter).toHaveLength(1);
    expect(usersOrganizationServiceRolesUrlShorter[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        users_organization_service_roles_id: userInOrganizationService.id,
        url_shorten_id: saleShorten.id,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      })
    );

    done();
  });

  test("service admin should be add time to pay comission in service", async (done) => {
    const organizationId = organizationCreated.id;

    const context = { client: userToken, organizationId };

    const handleTimeToPayCommissionPayload = {
      days: 30,
    };

    const timeToPayCommissionAdded = await service.handleTimeToPayCommission(
      handleTimeToPayCommissionPayload,
      context,
      trx
    );

    const [organizationService] = await (trx || knexDatabase.knexConfig)(
      "organization_services"
    )
      .where("organization_id", organizationCreated.id)
      .select("id");

    expect(timeToPayCommissionAdded).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        days: String(handleTimeToPayCommissionPayload.days),
        organizationServiceId: organizationService.id,
        type: "commission",
        updatedAt: expect.any(Date),
        createdAt: expect.any(Date),
      })
    );

    done();
  });

  test("service admin should be handle time to pay comission in service", async (done) => {
    const organizationId = organizationCreated.id;

    const context = { client: userToken, organizationId };

    const handleTimeToPayCommissionPayload = {
      days: 30,
    };

    await service.handleTimeToPayCommission(
      handleTimeToPayCommissionPayload,
      context,
      trx
    );

    const handleTimeToPayCommissionPayload2 = {
      days: 30,
    };

    const timeToPayCommissionHandled = await service.handleTimeToPayCommission(
      handleTimeToPayCommissionPayload,
      context,
      trx
    );

    const [organizationService] = await (trx || knexDatabase.knexConfig)(
      "organization_services"
    )
      .where("organization_id", organizationCreated.id)
      .select("id");

    expect(timeToPayCommissionHandled).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        days: String(handleTimeToPayCommissionPayload2.days),
        organizationServiceId: organizationService.id,
        type: "commission",
        updatedAt: expect.any(Date),
        createdAt: expect.any(Date),
      })
    );

    done();
  });

  test("service admin should be get time to pay comission in service", async (done) => {
    const organizationId = organizationCreated.id;

    const context = { client: userToken, organizationId };

    const handleTimeToPayCommissionPayload = {
      days: 30,
    };

    await service.handleTimeToPayCommission(
      handleTimeToPayCommissionPayload,
      context,
      trx
    );

    const [organizationService] = await (trx || knexDatabase.knexConfig)(
      "organization_services"
    )
      .where("organization_id", organizationCreated.id)
      .select("id");

    const timeToPayCommission = await service.getTimeToPayCommission(
      context,
      trx
    );

    expect(timeToPayCommission).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        days: String(handleTimeToPayCommissionPayload.days),
        organizationServiceId: organizationService.id,
        type: "commission",
        updatedAt: expect.any(Date),
        createdAt: expect.any(Date),
      })
    );

    done();
  });

  test("service admin should be handle default comission in service", async (done) => {
    const organizationId = organizationCreated.id;

    const context = { client: userToken, organizationId };

    const handleDefaultCommission = {
      percentage: 10,
    };

    const defaultCommission = await service.handleDefaultommission(
      handleDefaultCommission,
      context,
      trx
    );

    const [organizationService] = await (trx || knexDatabase.knexConfig)(
      "organization_services"
    )
      .where("organization_id", organizationCreated.id)
      .select("id");

    expect(defaultCommission).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        percentage: handleDefaultCommission.percentage.toFixed(2),
        organizationServiceId: organizationService.id,
        updatedAt: expect.any(Date),
        createdAt: expect.any(Date),
      })
    );

    done();
  });

  test("service admin should be handle default comission in service", async (done) => {
    const organizationId = organizationCreated.id;

    const context = { client: userToken, organizationId };

    const handleDefaultCommission = {
      percentage: 10,
    };

    await service.handleDefaultommission(handleDefaultCommission, context, trx);

    const handleDefaultCommissionAgain = {
      percentage: 20,
    };

    const defaultCommission = await service.handleDefaultommission(
      handleDefaultCommissionAgain,
      context,
      trx
    );

    const [organizationService] = await (trx || knexDatabase.knexConfig)(
      "organization_services"
    )
      .where("organization_id", organizationCreated.id)
      .select("id");

    expect(defaultCommission).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        percentage: handleDefaultCommissionAgain.percentage.toFixed(2),
        organizationServiceId: organizationService.id,
        updatedAt: expect.any(Date),
        createdAt: expect.any(Date),
      })
    );

    const defComissionFoundDb = await (trx || knexDatabase.knexConfig)(
      "organization_services_def_commission"
    ).select();

    expect(defComissionFoundDb).toHaveLength(1);

    done();
  });

  test("service admin should be get time to pay comission in service", async (done) => {
    const organizationId = organizationCreated.id;

    const context = { client: userToken, organizationId };

    const handleDefaultCommission = {
      percentage: 10,
    };

    await service.handleDefaultommission(handleDefaultCommission, context, trx);

    const [organizationService] = await (trx || knexDatabase.knexConfig)(
      "organization_services"
    )
      .where("organization_id", organizationCreated.id)
      .select("id");

    const defaultCommission = await service.getDefaultCommission(context, trx);

    expect(defaultCommission).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        percentage: handleDefaultCommission.percentage.toFixed(2),
        organizationServiceId: organizationService.id,
        updatedAt: expect.any(Date),
        createdAt: expect.any(Date),
      })
    );

    done();
  });
});
