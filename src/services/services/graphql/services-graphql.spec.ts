process.env.NODE_ENV = 'test';
import knexDatabase from '../../../knex-database';
import Faker from 'faker';
import { IUserToken, ISignInAdapted } from "../../authentication/types";
import jwt from 'jsonwebtoken';
import { IOrganizationAdapted } from '../../organization/types';
import { Services } from '../types';
const app = require('../../../app');
const request = require('supertest').agent(app);

declare var process : {
	env: {
      NODE_ENV: "production" | "development" | "test"
      JWT_SECRET: string
	}
}

const SIGN_UP = `
    mutation signUp($input: SignUpInput!) {
        signUp(input: $input) {
            id
            email
            username
        }
    }
`

const USER_VERIFY_EMAIL = `
    mutation userVerifyEmail($input: UserVerifyEmailInput!) {
        userVerifyEmail(input: $input)
    }
`

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
`

const CREATE_SERVICE_IN_ORGANIZATION = `
    mutation createServiceInOrganization($input: CreateServiceInOrganizationInput!) {
        createServiceInOrganization(input: $input)
    }
`

describe('services graphql', () => {

    let signUpCreated: ISignInAdapted;

    let userClient: IUserToken;

    let userToken: string;

    let organizationCreated: IOrganizationAdapted;

    beforeEach(async () => {

        const signUpPayload = {
            username: Faker.name.firstName(),
            email: Faker.internet.email(),
            password: Faker.internet.password()
        }

        const signUpResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .send({
        'query': SIGN_UP, 
        'variables': {
                input: signUpPayload
            }
        });

        signUpCreated = signUpResponse.body.data.signUp

        userClient = { origin: 'user', id: signUpCreated.id };

        userToken = await jwt.sign(userClient, process.env.JWT_SECRET);

        const [userFromDb] = await knexDatabase.knex('users').where('id', signUpCreated.id).select('verification_hash');

        const userVerifyEmailPayload = {
            verificationHash: userFromDb.verification_hash
        }

        await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .send({
        'query': USER_VERIFY_EMAIL, 
        'variables': {
                input: userVerifyEmailPayload
            }
        });

        const createOrganizationPayload = {
            name: Faker.internet.userName(),
            contactEmail: Faker.internet.email()
        }

        const createOrganizationResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
        'query': CREATE_ORGANIZATION, 
        'variables': {
                input: createOrganizationPayload
            }
        });

        organizationCreated = createOrganizationResponse.body.data.createOrganization;
    });

    afterAll(async () => {
        await knexDatabase.cleanMyTestDB();
    })

    describe("organization tests with user verified", () => {

        test("user should create new service in organization graphql", async done => {

            const [serviceFound] = await knexDatabase.knex('services').where('name', Services.AFFILIATE).select('id');

            const createServiceInOrganizationPayload = {
                serviceId: serviceFound.id,
                organizationId: organizationCreated.id,
            }

            const createServiceInOrganizationResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': CREATE_SERVICE_IN_ORGANIZATION, 
            'variables': {
                    input: createServiceInOrganizationPayload
                }
            });

            expect(createServiceInOrganizationResponse.statusCode).toBe(200);
            expect(createServiceInOrganizationResponse.body.data.createServiceInOrganization).toBeTruthy();
    
            const organizationService = await knexDatabase.knex('organization_services').select();
            
            expect(organizationService).toHaveLength(1);
            expect(organizationService[0]).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    service_id: serviceFound.id,
                    organization_id: organizationCreated.id,
                    updated_at: expect.any(Date),
                    created_at: expect.any(Date)
                })
            )
    
            done();
        })

    })

});