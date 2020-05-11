process.env.NODE_ENV = 'test';
import database from '../../../knex-database';
import Faker from 'faker';
import { IUserToken, ISignInAdapted } from "../../authentication/types";
import jwt from 'jsonwebtoken';
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

const VERIFY_ORGANIZATION_NAME = `
    query verifyOrganizationName($input: VerifyOrganizationNameInput!) {
        verifyOrganizationName(input: $input)
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

describe('organizations graphql', () => {

    let signUpCreated: ISignInAdapted;

    let userClient: IUserToken;

    let userToken: string;

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
    });

    afterAll(async () => {
        await database.cleanMyTestDB();
    })

    describe("organization tests with user verified", () => {
        
        beforeEach(async () => {
            const [userFromDb] = await database.knex('users').where('id', signUpCreated.id).select('verification_hash');

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
        })

        test("user should create new organization", async done => {

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

            expect(createOrganizationResponse.statusCode).toBe(200);
            expect(createOrganizationResponse.body.data.createOrganization).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    name: createOrganizationPayload.name,
                    contactEmail: createOrganizationPayload.contactEmail,
                    user: expect.objectContaining({
                        id: userClient.id
                    }),
                    active: true,
                    updatedAt: expect.any(String),
                    createdAt: expect.any(String)
                })    
            );
    
            const organizationOnDb = await database.knex('organizations').select();
    
            expect(organizationOnDb).toHaveLength(1);
            expect(organizationOnDb[0]).toEqual(
                expect.objectContaining({
                    id: createOrganizationResponse.body.data.createOrganization.id,
                    name: createOrganizationPayload.name,
                    contact_email: createOrganizationPayload.contactEmail,
                    user_id: userClient.id,
                    active: true,
                    updated_at: expect.any(Date),
                    created_at: expect.any(Date)
                })
            )
    
            done();
        })

        test("user should verify organization duplicated name before create with new organization graphql", async done => {

            const verifyOrganizationNamePayload = {
                name: Faker.internet.domainName()
            }

            const verifiedOrganizationNameResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': VERIFY_ORGANIZATION_NAME, 
            'variables': {
                    input: verifyOrganizationNamePayload
                }
            });
    
            expect(verifiedOrganizationNameResponse.statusCode).toBe(200);
            expect(verifiedOrganizationNameResponse.body.data.verifyOrganizationName).toBeFalsy();
    
            done();
    
        })

        test("user should verify organization duplicated name before create with organization exists graphql", async done => {

            const createOrganizationPayload = {
                name: Faker.internet.userName(),
                contactEmail: Faker.internet.email()
            }

            await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': CREATE_ORGANIZATION, 
            'variables': {
                    input: createOrganizationPayload
                }
            });

            const verifiedOrganizationNameResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': VERIFY_ORGANIZATION_NAME, 
            'variables': {
                    input: {
                        name: createOrganizationPayload.name
                    }
                }
            });
    
            expect(verifiedOrganizationNameResponse.statusCode).toBe(200);
            expect(verifiedOrganizationNameResponse.body.data.verifyOrganizationName).toBeTruthy();
    
            done();
    
        })

    })

});