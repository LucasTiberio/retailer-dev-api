process.env.NODE_ENV = "test";
import knexDatabase from "../../../../knex-database";
import Faker from "faker";
import { IUserToken, ISignInAdapted } from "../../../authentication/types";
import jwt from "jsonwebtoken";
import {
  IOrganizationAdapted,
  OrganizationInviteStatus,
} from "../../../organization/types";
import {
  Services,
  IServiceAdaptedFromDB,
  ServiceRoles,
} from "../../../services/types";
import redisClient from "../../../../lib/Redis";
import { createOrganizationPayload } from "../../../../__mocks__";
import { Integrations } from "../../../integration/types";
const app = require("../../../../app");
const request = require("supertest").agent(app);

const backendRedirectUrl = process.env.REDIRECT_URL_STAGING;

declare var process: {
  env: {
    NODE_ENV: "production" | "development" | "test";
    JWT_SECRET: string;
    REDIRECT_URL_STAGING: string;
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

const HANDLE_ORGANIZATION_COMMISSION = `
    mutation handleOrganizationCommission($input: HandleOrganizationCommissionInput!){
        handleOrganizationCommission(input: $input){
            id
            departmentId
            commissionPercentage
            active
            type
        }
    }
`;

const GET_ORGANIZATION_COMMISSIONS = `
    query getOrganizationCommissions{
        getOrganizationCommissions{
            id
            departmentId
            commissionPercentage
            active
            type
        }
    }
`;

describe("affiliate graphql", () => {
  let signUpCreated: ISignInAdapted;

  let userClient: IUserToken;

  let userToken: string;

  let organizationCreated: IOrganizationAdapted;

  beforeEach(async () => {
    await knexDatabase
      .knex("users_organization_service_roles_url_shortener")
      .del();
    await knexDatabase.knex("users_organization_service_roles").del();

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

    const [userFromDb] = await knexDatabase
      .knex("users")
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

    const createOrganizationResponse = await request
      .post("/graphql")
      .set("content-type", "application/json")
      .set("x-api-token", userToken)
      .send({
        query: CREATE_ORGANIZATION,
        variables: {
          input: createOrganizationPayload(),
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

    await knexDatabase.knex("organization_vtex_secrets").del();

    const createIntegrationInput = {
      secrets: {
        xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
        xVtexApiAppToken:
          "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
        accountName: "beightoneagency",
      },
      type: Integrations.VTEX,
    };

    await request
      .post("/graphql")
      .set("content-type", "application/json")
      .set("x-api-token", userToken)
      .send({
        query: CREATE_INTEGRATION,
        variables: {
          input: createIntegrationInput,
        },
      });
  });

  afterAll(async () => {
    await knexDatabase.cleanMyTestDB();
    await redisClient.end();
  });

  test("organization admin get organization commissions graphql", async (done) => {
    const organizationCommissionInput = {
      departmentId: "1",
      commissionPercentage: 15.5,
      active: true,
    };

    await request
      .post("/graphql")
      .set("content-type", "application/json")
      .set("x-api-token", userToken)
      .send({
        query: HANDLE_ORGANIZATION_COMMISSION,
        variables: {
          input: organizationCommissionInput,
        },
      });

    const response = await request
      .post("/graphql")
      .set("content-type", "application/json")
      .set("x-api-token", userToken)
      .send({
        query: GET_ORGANIZATION_COMMISSIONS,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.getOrganizationCommissions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          departmentId: organizationCommissionInput.departmentId,
          commissionPercentage:
            organizationCommissionInput.commissionPercentage,
          active: organizationCommissionInput.active,
          type: Integrations.VTEX,
        }),
      ])
    );

    done();
  });
});
