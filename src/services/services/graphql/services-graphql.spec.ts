process.env.NODE_ENV = 'test';
import knexDatabase from '../../../knex-database';
import Faker from 'faker';
import { IUserToken, ISignInAdapted } from "../../authentication/types";
import jwt from 'jsonwebtoken';
import { IOrganizationAdapted, OrganizationInviteStatus } from '../../organization/types';
import { Services, IServiceAdapted, IServiceAdaptedFromDB, ServiceRoles } from '../types';
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

const INVITE_USER_TO_ORGANIZATION = `
    mutation inviteUserToOrganization($input: InviteUserToOrganizationInput!) {
        inviteUserToOrganization(input: $input)
    }
`

const RESPONSE_INVITE = `
    mutation responseOrganizationInvite($input: ResponseOrganizationInviteInput!) {
        responseOrganizationInvite(input: $input)
    }
`

const ADD_USER_IN_ORGANIZATION_SERVICE = `
    mutation addUserInOrganizationService($input: AddUserInOrganizationServiceInput!) {
        addUserInOrganizationService(input: $input){
            id
            createdAt
            updatedAt
            service{
                id
                name
                active
                createdAt
                updatedAt
            }
            serviceRoles{
                id
                name
            }
            userOrganization{
                id
                user{
                    id
                    username
                    email
                }
                organization{
                    id
                    name
                    contactEmail
                }
            }
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
            password: "B8oneTeste123!"
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

        test("user should list services availables to organization", async done => {

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

        describe('services with service organization attached', () => {

            let serviceFound : IServiceAdaptedFromDB;
    
            beforeEach(async () => {
                const [serviceFoundDB] = await knexDatabase.knex('services').where('name', Services.AFFILIATE).select('id', 'name', 'active');
                serviceFound = serviceFoundDB
                
                const createServiceInOrganizationPayload = {
                    organizationId: organizationCreated.id,
                    serviceId: serviceFound.id,
                }

                await request
                .post('/graphql')
                .set('content-type', 'application/json')
                .set('x-api-token', userToken)
                .send({
                'query': CREATE_SERVICE_IN_ORGANIZATION, 
                'variables': {
                        input: createServiceInOrganizationPayload
                    }
                });

            })
    
            test('organization admin should added member on service graphql', async done => {
    
                const otherSignUpPayload = {
                    username: Faker.name.firstName(),
                    email: Faker.internet.email(),
                    password: "B8oneTeste123!"
                }
        
                const otherSignUpResponse = await request
                .post('/graphql')
                .set('content-type', 'application/json')
                .send({
                'query': SIGN_UP, 
                'variables': {
                        input: otherSignUpPayload
                    }
                });
        
                let otherSignUpCreated = otherSignUpResponse.body.data.signUp
        
                const [userFromDb] = await knexDatabase.knex('users').where('id', otherSignUpCreated.id).select('verification_hash');
        
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
    
                const inviteUserToOrganizationPayload = {
                    organizationId: organizationCreated.id,
                    users: [{
                        id: otherSignUpCreated.id,
                        email: otherSignUpCreated.email
                    }]
                }

                await request
                .post('/graphql')
                .set('content-type', 'application/json')
                .set('x-api-token', userToken)
                .send({
                'query': INVITE_USER_TO_ORGANIZATION, 
                'variables': {
                        input: inviteUserToOrganizationPayload
                    }
                });
        
                const [invitedUserToOrganization] = await knexDatabase.knex('users_organizations').where("user_id", otherSignUpCreated.id).select('invite_hash', 'id');
    
                const responseOrganizationInvitePayload = {
                    inviteHash: invitedUserToOrganization.invite_hash,
                    response: OrganizationInviteStatus.ACCEPT
                }
    
                await request
                .post('/graphql')
                .set('content-type', 'application/json')
                .set('x-api-token', userToken)
                .send({
                'query': RESPONSE_INVITE, 
                'variables': {
                        input: responseOrganizationInvitePayload
                    }
                });

                const addUserInOrganizationPayload = {
                    userId: otherSignUpCreated.id,
                    organizationId: organizationCreated.id,
                    serviceName: Services.AFFILIATE
                }

                const addUserInOrganizationResponse = await request
                .post('/graphql')
                .set('content-type', 'application/json')
                .set('x-api-token', userToken)
                .send({
                'query': ADD_USER_IN_ORGANIZATION_SERVICE, 
                'variables': {
                        input: addUserInOrganizationPayload
                    }
                });

                expect(addUserInOrganizationResponse.statusCode).toBe(200);
    
                const [serviceRoles] = await knexDatabase.knex('service_roles').where('name', ServiceRoles.ANALYST).select('id');
    
                expect(addUserInOrganizationResponse.body.data.addUserInOrganizationService).toEqual(
                    expect.objectContaining({
                        id: expect.any(String),
                        serviceRoles: expect.objectContaining({
                            id: serviceRoles.id,
                            name: ServiceRoles.ANALYST
                        }),
                        userOrganization: expect.objectContaining({
                            id: invitedUserToOrganization.id,
                            user: expect.objectContaining({
                                id: otherSignUpCreated.id,
                                username: otherSignUpCreated.username,
                                email: otherSignUpCreated.email
                            }),
                            organization: expect.objectContaining({
                                id: organizationCreated.id,
                                name: organizationCreated.name,
                                contactEmail: organizationCreated.contactEmail
                            })
                        }),
                        service: expect.objectContaining({
                            id: serviceFound.id,
                            name: serviceFound.name,
                            active: serviceFound.active,
                            createdAt: expect.any(String),
                            updatedAt: expect.any(String)
                        }),
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String),
                    })
                )
        
                done();
            })
    
        })

    })

});