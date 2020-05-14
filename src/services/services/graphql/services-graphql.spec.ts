process.env.NODE_ENV = 'test';
import knexDatabase from '../../../knex-database';
import Faker from 'faker';
import { IUserToken, ISignInAdapted } from "../../authentication/types";
import jwt from 'jsonwebtoken';
import { IOrganizationAdapted } from '../../organization/types';
import { Services, IServiceAdapted } from '../types';
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

const LIST_AVAILABLE_SERVICES = `
    query listAvailableServices($input: ListAvailableServicesInput!) {
        listAvailableServices(input: $input){
            id
            name
            active
            updatedAt
            createdAt
            hasOrganization
        }
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
                organizationId: organizationCreated.id,
                serviceId: serviceFound.id,
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

        test.only("user should list services availables to organization", async done => {

            const servicesFound = await knexDatabase.knex('services').select('id', 'name');

            const listAvailableServicesPayload = {
                organizationId: organizationCreated.id
            }

            const listAvailableServicesResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': LIST_AVAILABLE_SERVICES, 
            'variables': {
                    input: listAvailableServicesPayload
                }
            });

            expect(listAvailableServicesResponse.statusCode).toBe(200);
            expect(listAvailableServicesResponse.body.data.listAvailableServices).toEqual(
                expect.arrayContaining(
                    servicesFound.map((service : IServiceAdapted) => 
                        expect.objectContaining({
                            id: service.id,
                            name: service.name,
                            active: true,
                            updatedAt: expect.any(String),
                            createdAt: expect.any(String)
                        })
                    )
                )
            )

            done();

        })

    })

});