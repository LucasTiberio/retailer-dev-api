process.env.NODE_ENV = "test";
import OrganizationRulesService from "../../../organization-rules/service";
jest.mock("../../../organization-rules/service");
import Faker from "faker";
import { IUserToken, ISignInAdapted } from "../../../authentication/types";
import jwt from "jsonwebtoken";
import knexDatabase from "../../../../knex-database";
import { IOrganizationAdapted } from "../../../organization/types";
import redisClient from "../../../../lib/Redis";
import { Integrations } from "../../types";
const app = require("../../../../app");
const request = require("supertest").agent(app);

declare var process: {
  env: {
    NODE_ENV: "production" | "development" | "test";
    JWT_SECRET: string;
  };
};

const SIGN_UP = `
    mutation signUp($input: SignUpInput!) {
        signUp(input: $input) {
            id
            email
            username
        }
    }
`;

const USER_VERIFY_EMAIL = `
    mutation userVerifyEmail($input: UserVerifyEmailInput!) {
        userVerifyEmail(input: $input)
    }
`;

const CREATE_ORGANIZATION = `
    mutation createOrganization($input: CreateOrganizationInput!) {
        createOrganization(input: $input){
            id
            contactEmail
            slug
            name
            active
            updatedAt
            createdAt
            user{
                id
            }
        }
    }
`;

const SET_CURRENT_ORGANIZATION = `
    mutation setCurrentOrganization($input: SetCurrentOrganizationInput!) {
        setCurrentOrganization(input: $input)
    }
`;

const CREATE_INTEGRATION = `
    mutation createIntegration($input: CreateIntegrationInput!){
        createIntegration(input: $input)
    }
`;

describe("create integration graphql", () => {
  let signUpCreated: ISignInAdapted;

  let userClient: IUserToken;

  let userToken: string;

  let organizationCreated: IOrganizationAdapted;

  beforeAll(async () => {
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
    const signUpPayload = {
      username: Faker.name.firstName(),
      email: Faker.internet.email(),
      password: "B8oneTeste123!",
    };

    const signUpResponse = await request
      .post("/graphql")
      .set("content-type", "application/json")
      .send({
        query: SIGN_UP,
        variables: {
          input: signUpPayload,
        },
      });

    signUpCreated = signUpResponse.body.data.signUp;

    userClient = { origin: "user", id: signUpCreated.id };

    userToken = await jwt.sign(userClient, process.env.JWT_SECRET);

    await redisClient.flushall("ASYNC");

    const [userFromDb] = await knexDatabase
      .knexConfig("users")
      .where("id", signUpCreated.id)
      .select("verification_hash");

    const userVerifyEmailPayload = {
      verificationHash: userFromDb.verification_hash,
    };

    await request
      .post("/graphql")
      .set("content-type", "application/json")
      .send({
        query: USER_VERIFY_EMAIL,
        variables: {
          input: userVerifyEmailPayload,
        },
      });

    await knexDatabase.knexConfig("organization_vtex_secrets").del();

    let createOrganizationPayload = {
      organization: {
        name: Faker.name.firstName(),
        contactEmail: "gabriel-tamura@b8one.com",
        phone: "551123213123123",
      },
      additionalInfos: {
        segment: "Beleza e Cosméticos",
        resellersEstimate: 500,
        reason: "Ter mais uma opção de canal de vendas",
        plataform: "vtex",
      },
    };

    const createOrganizationResponse = await request
      .post("/graphql")
      .set("content-type", "application/json")
      .set("x-api-token", userToken)
      .send({
        query: CREATE_ORGANIZATION,
        variables: {
          input: createOrganizationPayload,
        },
      });

    organizationCreated =
      createOrganizationResponse.body.data.createOrganization;

    const currentOrganizationPayload = {
      organizationId: organizationCreated.id,
    };

    await redisClient.flushall("ASYNC");
    await request
      .post("/graphql")
      .set("content-type", "application/json")
      .set("x-api-token", userToken)
      .send({
        query: SET_CURRENT_ORGANIZATION,
        variables: {
          input: currentOrganizationPayload,
        },
      });
  });

  afterAll(async () => {
    await knexDatabase.cleanMyTestDB();
    await redisClient.end();
  });

  test("user organization admin should create vtex integration - graphql", async (done) => {
    const createIntegrationInput = {
      secrets: {
        xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
        xVtexApiAppToken:
          "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
        accountName: "beightoneagency",
      },
      type: Integrations.VTEX,
    };

    const createIntegrationResponse = await request
      .post("/graphql")
      .set("content-type", "application/json")
      .set("x-api-token", userToken)
      .send({
        query: CREATE_INTEGRATION,
        variables: {
          input: createIntegrationInput,
        },
      });

    expect(createIntegrationResponse.statusCode).toBe(200);

    expect(createIntegrationResponse.body.data.createIntegration).toBeTruthy();

    done();
  });
});
