process.env.NODE_ENV = 'test';
import knexDatabase from '../../../knex-database';
import Faker from 'faker';
import { IUserToken, ISignInAdapted } from "../../authentication/types";
import jwt from 'jsonwebtoken';
import { IOrganizationAdapted, OrganizationInviteStatus } from '../../organization/types';
import { Services, IServiceAdapted, IServiceAdaptedFromDB, ServiceRoles } from '../types';
const app = require('../../../app');
const request = require('supertest').agent(app);
import redisClient from '../../../lib/Redis';
import { createOrganizationPayload } from '../../../__mocks__';

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
    query listAvailableServices{
        listAvailableServices{
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
        responseOrganizationInvite(input: $input){
            status
            email
        }
    }
`

const USER_IN_SERVICE_HANDLE_ROLE = `
    mutation userInServiceHandleRole($input: UserInServiceHandleRoleInput!) {
        userInServiceHandleRole(input: $input){
            id
            serviceRoles{
                id
                name
            }
            userOrganization{
                id
                user{
                    id
                }
                organization{
                    id
                }
            }
            service{
                id
                name
            }
            createdAt
            updatedAt
        }
    }
`

const INATIVE_USER_FROM_SERVICE_ORGANIZATION = `
    mutation inativeUserFromServiceOrganization($input: InativeUserFromServiceOrganizationInput!) {
        inativeUserFromServiceOrganization(input: $input){
            id
            createdAt
            updatedAt
            active
            service{
                id
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

const LIST_AVAILABLE_USERS_TO_SERVICE = `
    query listAvailableUsersToService($input: ListAvailableUsersToServiceInput!) {
        listAvailableUsersToService(input: $input){
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
`

const LIST_USERS_IN_ORGANIZATION_SERVICE = `
    query listUsersInOrganizationService($input: ListUsersInOrganizationServiceInput!) {
        listUsersInOrganizationService(input: $input){
            id
            serviceRoles{
                id
            }
            userOrganization{
                id
                user{
                    id
                }
                organization{
                    id
                }
            }
            createdAt
            updatedAt
        }
    }
`

const GET_USER_IN_ORGANIZATION_SERVICE = `
    query getUserInOrganizationService($input: GetUserInOrganizationServiceInput!) {
        getUserInOrganizationService(input: $input){
            id
            serviceRoles{
                id
            }
            userOrganization{
                id
                user{
                    id
                }
                organization{
                    id
                }
            }
            createdAt
            updatedAt
        }
    }
`

const GET_USER_ORGANIZATION_BY_SERVICE_NAME = `
    query getUserOrganizationByServiceName($input: GetUserOrganizationByServiceNameInput!) {
        getUserOrganizationByServiceName(input: $input){
            id
            serviceRoles{
                id
            }
            userOrganization{
                id
                user{
                    id
                }
                organization{
                    id
                }
            }
            createdAt
            updatedAt
        }
    }
`

const VERIFY_AND_ATTACH_VTEX_SECRETS_RESPONSE = `
    mutation verifyAndAttachVtexSecrets($input: VerifyAndAttachVtexSecretsInput!) {
        verifyAndAttachVtexSecrets(input: $input)
    }
`

const SET_CURRENT_ORGANIZATION = `
    mutation setCurrentOrganization($input: SetCurrentOrganizationInput!) {
        setCurrentOrganization(input: $input)
    }
`

describe('services graphql', () => {

    let signUpCreated: ISignInAdapted;

    let userClient: IUserToken;

    let userToken: string;

    let organizationCreated: IOrganizationAdapted;

    beforeEach(async () => {

        await knexDatabase.knexConfig('users_organization_service_roles_url_shortener').del();
        await knexDatabase.knexConfig('users_organization_service_roles').del();

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

        const [userFromDb] = await knexDatabase.knexConfig('users').where('id', signUpCreated.id).select('verification_hash');

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

        const createOrganizationResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
        'query': CREATE_ORGANIZATION, 
        'variables': {
                input: createOrganizationPayload()
            }
        });

        organizationCreated = createOrganizationResponse.body.data.createOrganization;

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await redisClient.flushall('ASYNC');
        await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
        'query': SET_CURRENT_ORGANIZATION, 
        'variables': {
                input: currentOrganizationPayload
            }
        });
    });

    afterAll(async () => {
        await knexDatabase.cleanMyTestDB();
        await redisClient.end();
    })

    describe("organization tests with user verified", () => {

        test("user should list services availables to organization", async done => {

            const servicesFound = await knexDatabase.knexConfig('services').select('id', 'name');

            const listAvailableServicesResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': LIST_AVAILABLE_SERVICES
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
                const [serviceFoundDB] = await knexDatabase.knexConfig('services').where('name', Services.AFFILIATE).select('id', 'name', 'active');
                serviceFound = serviceFoundDB

                await knexDatabase.knexConfig('organization_vtex_secrets').del();

                const vtexSecrets = {
                    xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
                    xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
                    accountName: "beightoneagency"
                }
    
                await request
                .post('/graphql')
                .set('content-type', 'application/json')
                .set('x-api-token', userToken)
                .send({
                'query': VERIFY_AND_ATTACH_VTEX_SECRETS_RESPONSE,
                'variables': {
                        input: vtexSecrets
                    }
                });

            })
    
            // test('organization admin should added member on service graphql', async done => {
    
            //     const otherSignUpPayload = {
            //         username: Faker.name.firstName(),
            //         email: Faker.internet.email(),
            //         password: "B8oneTeste123!"
            //     }
        
            //     const otherSignUpResponse = await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .send({
            //     'query': SIGN_UP, 
            //     'variables': {
            //             input: otherSignUpPayload
            //         }
            //     });
        
            //     let otherSignUpCreated = otherSignUpResponse.body.data.signUp

            //     const [userFromDb] = await knexDatabase.knexConfig('users').where('id', otherSignUpCreated.id).select('verification_hash');

            //     const userVerifyEmailPayload = {
            //         verificationHash: userFromDb.verification_hash
            //     }
        
            //     await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .send({
            //     'query': USER_VERIFY_EMAIL, 
            //     'variables': {
            //             input: userVerifyEmailPayload
            //         }
            //     });
    
            //     const inviteUserToOrganizationPayload = {
            //         users: [{
            //             id: otherSignUpCreated.id,
            //             email: otherSignUpCreated.email
            //         }]
            //     }

            //     await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .set('x-api-token', userToken)
            //     .send({
            //     'query': INVITE_USER_TO_ORGANIZATION, 
            //     'variables': {
            //             input: inviteUserToOrganizationPayload
            //         }
            //     });

            //     const [invitedUserToOrganization] = await knexDatabase.knexConfig('users_organizations').where("user_id", otherSignUpCreated.id).select('invite_hash', 'id');
    
            //     const responseOrganizationInvitePayload = {
            //         inviteHash: invitedUserToOrganization.invite_hash,
            //         response: OrganizationInviteStatus.ACCEPT
            //     }
    
            //     await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .set('x-api-token', userToken)
            //     .send({
            //     'query': RESPONSE_INVITE, 
            //     'variables': {
            //             input: responseOrganizationInvitePayload
            //         }
            //     });

            //     const addUserInOrganizationPayload = {
            //         userId: otherSignUpCreated.id,
            //         serviceName: Services.AFFILIATE
            //     }

            //     const addUserInOrganizationServiceResponse = await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .set('x-api-token', userToken)
            //     .send({
            //     'query': ADD_USER_IN_ORGANIZATION_SERVICE, 
            //     'variables': {
            //             input: addUserInOrganizationPayload
            //         }
            //     });

            //     expect(addUserInOrganizationServiceResponse.statusCode).toBe(200);

            //     const [serviceRoles] = await knexDatabase.knexConfig('service_roles').where('name', ServiceRoles.ANALYST).select('id');

            //     expect(addUserInOrganizationServiceResponse.body.data.addUserInOrganizationService).toEqual(
            //         expect.objectContaining({
            //             id: expect.any(String),
            //             serviceRoles: expect.objectContaining({
            //                 id: serviceRoles.id,
            //                 name: ServiceRoles.ANALYST
            //             }),
            //             userOrganization: expect.objectContaining({
            //                 id: invitedUserToOrganization.id,
            //                 user: expect.objectContaining({
            //                     id: otherSignUpCreated.id,
            //                     username: otherSignUpCreated.username,
            //                     email: otherSignUpCreated.email
            //                 }),
            //                 organization: expect.objectContaining({
            //                     id: organizationCreated.id,
            //                     name: organizationCreated.name,
            //                     contactEmail: organizationCreated.contactEmail
            //                 })
            //             }),
            //             service: expect.objectContaining({
            //                 id: serviceFound.id,
            //                 name: serviceFound.name,
            //                 active: serviceFound.active,
            //                 createdAt: expect.any(String),
            //                 updatedAt: expect.any(String)
            //             }),
            //             createdAt: expect.any(String),
            //             updatedAt: expect.any(String),
            //         })
            //     )
        
            //     done();
            // })

            // test('organization admin should list member available to enjoi in service', async done => {

            //     const otherSignUpPayload = {
            //         username: Faker.name.firstName(),
            //         email: Faker.internet.email(),
            //         password: "B8oneTeste123!"
            //     }
        
            //     const otherSignUpResponse = await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .send({
            //     'query': SIGN_UP, 
            //     'variables': {
            //             input: otherSignUpPayload
            //         }
            //     });
        
            //     let otherSignUpCreated = otherSignUpResponse.body.data.signUp
        
            //     const [userFromDb] = await knexDatabase.knexConfig('users').where('id', otherSignUpCreated.id).select('verification_hash', 'id');
        
            //     const userVerifyEmailPayload = {
            //         verificationHash: userFromDb.verification_hash,
            //         response: OrganizationInviteStatus.ACCEPT
            //     }
        
            //     await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .send({
            //     'query': USER_VERIFY_EMAIL, 
            //     'variables': {
            //             input: userVerifyEmailPayload
            //         }
            //     });
    
            //     const inviteUserToOrganizationPayload = {
            //         users: [{
            //             id: otherSignUpCreated.id,
            //             email: otherSignUpCreated.email
            //         }]
            //     }

            //     await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .set('x-api-token', userToken)
            //     .send({
            //     'query': INVITE_USER_TO_ORGANIZATION, 
            //     'variables': {
            //             input: inviteUserToOrganizationPayload
            //         }
            //     });
    
            //     const [invitedUserToOrganization] = await knexDatabase.knexConfig('users_organizations').where("user_id", otherSignUpCreated.id).select('invite_hash', 'id');
    
            //     const responseOrganizationInvitePayload = {
            //         inviteHash: invitedUserToOrganization.invite_hash,
            //         response: OrganizationInviteStatus.ACCEPT
            //     }
    
            //     await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .set('x-api-token', userToken)
            //     .send({
            //     'query': RESPONSE_INVITE, 
            //     'variables': {
            //             input: responseOrganizationInvitePayload
            //         }
            //     });
    
            //     const listAvailableUsersToServicePayload = {
            //         serviceName: Services.AFFILIATE,
            //         name: "usu"
            //     }

            //     const listAvailableUsersToServicesResponse = await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .set('x-api-token', userToken)
            //     .send({
            //     'query': LIST_AVAILABLE_USERS_TO_SERVICE, 
            //     'variables': {
            //             input: listAvailableUsersToServicePayload
            //         }
            //     });

            //     expect(listAvailableUsersToServicesResponse.statusCode).toBe(200);
            //     expect(listAvailableUsersToServicesResponse.body.data.listAvailableUsersToService).toEqual(
            //         expect.arrayContaining([
            //             expect.objectContaining({
            //                 id: invitedUserToOrganization.id,
            //                 user: expect.objectContaining({
            //                     id: otherSignUpCreated.id,
            //                     username: otherSignUpCreated.username,
            //                     email: otherSignUpCreated.email
            //                 }),
            //                 organization: expect.objectContaining({
            //                     id: organizationCreated.id,
            //                     name: organizationCreated.name,
            //                     contactEmail: organizationCreated.contactEmail
            //                 })
            //             })
            //         ])
            //     )
    
            //     done()
    
            // })

            // test('organization members should list users in service', async done => {

            //     const otherSignUpPayload = {
            //         username: Faker.name.firstName(),
            //         email: Faker.internet.email(),
            //         password: "B8oneTeste123!"
            //     }
        
            //     const otherSignUpResponse = await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .send({
            //     'query': SIGN_UP, 
            //     'variables': {
            //             input: otherSignUpPayload
            //         }
            //     });
        
            //     let otherSignUpCreated = otherSignUpResponse.body.data.signUp
        
            //     const [userFromDb] = await knexDatabase.knexConfig('users').where('id', otherSignUpCreated.id).select('verification_hash', 'id');
        
            //     const userVerifyEmailPayload = {
            //         verificationHash: userFromDb.verification_hash,
            //         response: OrganizationInviteStatus.ACCEPT
            //     }
        
            //     await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .send({
            //     'query': USER_VERIFY_EMAIL, 
            //     'variables': {
            //             input: userVerifyEmailPayload
            //         }
            //     });

            //     const inviteUserToOrganizationPayload = {
            //         users: [{
            //             id: otherSignUpCreated.id,
            //             email: otherSignUpCreated.email
            //         }]
            //     }

            //     await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .set('x-api-token', userToken)
            //     .send({
            //     'query': INVITE_USER_TO_ORGANIZATION, 
            //     'variables': {
            //             input: inviteUserToOrganizationPayload
            //         }
            //     });
    
            //     const [invitedUserToOrganization] = await knexDatabase.knexConfig('users_organizations').where("user_id", otherSignUpCreated.id).select('invite_hash', 'id');
    
            //     const responseOrganizationInvitePayload = {
            //         inviteHash: invitedUserToOrganization.invite_hash,
            //         response: OrganizationInviteStatus.ACCEPT
            //     }
    
            //     await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .set('x-api-token', userToken)
            //     .send({
            //     'query': RESPONSE_INVITE, 
            //     'variables': {
            //             input: responseOrganizationInvitePayload
            //         }
            //     });

            //     const addUserInOrganizationPayload = {
            //         userId: otherSignUpCreated.id,
            //         serviceName: Services.AFFILIATE
            //     }

            //     const addUserInOrganizationServiceResponse = await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .set('x-api-token', userToken)
            //     .send({
            //     'query': ADD_USER_IN_ORGANIZATION_SERVICE, 
            //     'variables': {
            //             input: addUserInOrganizationPayload
            //         }
            //     });
    
            //     const listUsersInOrganizationServicePayload = {
            //         serviceName: Services.AFFILIATE 
            //     }

            //     const listUsersInOrganizationServiceResponse = await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .set('x-api-token', userToken)
            //     .send({
            //     'query': LIST_USERS_IN_ORGANIZATION_SERVICE,
            //     'variables': {
            //             input: listUsersInOrganizationServicePayload
            //         }
            //     });

            //     expect(listUsersInOrganizationServiceResponse.statusCode).toBe(200);
    
            //     const [analystServiceRole] = await knexDatabase.knexConfig('service_roles').where('name', ServiceRoles.ANALYST).select('id');

            //     expect(listUsersInOrganizationServiceResponse.body.data.listUsersInOrganizationService).toEqual(
            //         expect.arrayContaining([
            //             expect.objectContaining({
            //                 id: addUserInOrganizationServiceResponse.body.data.addUserInOrganizationService.id,
            //                 serviceRoles: expect.objectContaining({
            //                     id: analystServiceRole.id
            //                 }),
            //                 userOrganization: expect.objectContaining({
            //                     id: invitedUserToOrganization.id,
            //                     user: expect.objectContaining({
            //                         id: otherSignUpCreated.id
            //                     }),
            //                     organization: expect.objectContaining({
            //                         id: organizationCreated.id
            //                     })
            //                 }),
            //                 createdAt: expect.any(String),
            //                 updatedAt: expect.any(String)
            //             })
            //         ])
            //     )
    
            //     done();
            // })

            // test('organization members should list user in service', async done => {

            //     const otherSignUpPayload = {
            //         username: Faker.name.firstName(),
            //         email: Faker.internet.email(),
            //         password: "B8oneTeste123!"
            //     }
        
            //     const otherSignUpResponse = await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .send({
            //     'query': SIGN_UP, 
            //     'variables': {
            //             input: otherSignUpPayload
            //         }
            //     });
        
            //     let otherSignUpCreated = otherSignUpResponse.body.data.signUp
        
            //     const [userFromDb] = await knexDatabase.knexConfig('users').where('id', otherSignUpCreated.id).select('verification_hash', 'id');
        
            //     const userVerifyEmailPayload = {
            //         verificationHash: userFromDb.verification_hash,
            //         response: OrganizationInviteStatus.ACCEPT
            //     }
        
            //     await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .send({
            //     'query': USER_VERIFY_EMAIL, 
            //     'variables': {
            //             input: userVerifyEmailPayload
            //         }
            //     });

            //     const inviteUserToOrganizationPayload = {
            //         users: [{
            //             id: otherSignUpCreated.id,
            //             email: otherSignUpCreated.email
            //         }]
            //     }

            //     await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .set('x-api-token', userToken)
            //     .send({
            //     'query': INVITE_USER_TO_ORGANIZATION, 
            //     'variables': {
            //             input: inviteUserToOrganizationPayload
            //         }
            //     });
    
            //     const [invitedUserToOrganization] = await knexDatabase.knexConfig('users_organizations').where("user_id", otherSignUpCreated.id).select('invite_hash', 'id');
    
            //     const responseOrganizationInvitePayload = {
            //         inviteHash: invitedUserToOrganization.invite_hash,
            //         response: OrganizationInviteStatus.ACCEPT
            //     }
    
            //     await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .set('x-api-token', userToken)
            //     .send({
            //     'query': RESPONSE_INVITE, 
            //     'variables': {
            //             input: responseOrganizationInvitePayload
            //         }
            //     });

            //     const addUserInOrganizationPayload = {
            //         userId: otherSignUpCreated.id,
            //         serviceName: Services.AFFILIATE
            //     }

            //     const addUserInOrganizationServiceResponse = await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .set('x-api-token', userToken)
            //     .send({
            //     'query': ADD_USER_IN_ORGANIZATION_SERVICE, 
            //     'variables': {
            //             input: addUserInOrganizationPayload
            //         }
            //     });
    
            //     const getUserInOrganizationServicePayload = {
            //         userOrganizationId: invitedUserToOrganization.id 
            //     }

            //     const getUserInOrganizationServiceResponse = await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .set('x-api-token', userToken)
            //     .send({
            //     'query': GET_USER_IN_ORGANIZATION_SERVICE,
            //     'variables': {
            //             input: getUserInOrganizationServicePayload
            //         }
            //     });

            //     expect(getUserInOrganizationServiceResponse.statusCode).toBe(200);
    
            //     const [analystServiceRole] = await knexDatabase.knexConfig('service_roles').where('name', ServiceRoles.ANALYST).select('id');

            //     expect(getUserInOrganizationServiceResponse.body.data.getUserInOrganizationService).toEqual(
            //             expect.objectContaining({
            //                 id: addUserInOrganizationServiceResponse.body.data.addUserInOrganizationService.id,
            //                 serviceRoles: expect.objectContaining({
            //                     id: analystServiceRole.id
            //                 }),
            //                 userOrganization: expect.objectContaining({
            //                     id: invitedUserToOrganization.id,
            //                     user: expect.objectContaining({
            //                         id: otherSignUpCreated.id
            //                     }),
            //                     organization: expect.objectContaining({
            //                         id: organizationCreated.id
            //                     })
            //                 }),
            //                 createdAt: expect.any(String),
            //                 updatedAt: expect.any(String)
            //             })
            //     )
    
            //     done();
            // })

            test('organization admin should handle user service to admin role', async done => {

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
        
                const [userFromDb] = await knexDatabase.knexConfig('users').where('id', otherSignUpCreated.id).select('verification_hash', 'id');
        
                const userVerifyEmailPayload = {
                    verificationHash: userFromDb.verification_hash,
                    response: OrganizationInviteStatus.ACCEPT
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

                const vtexSecrets = {
                    xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
                    xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
                    accountName: "beightoneagency"
                }
                
                await request
                .post('/graphql')
                .set('content-type', 'application/json')
                .set('x-api-token', userToken)
                .send({
                'query': VERIFY_AND_ATTACH_VTEX_SECRETS_RESPONSE,
                'variables': {
                        input: vtexSecrets
                    }
                });
    
                const inviteUserToOrganizationPayload = {
                    users: [{
                        id: otherSignUpCreated.id,
                        email: otherSignUpCreated.email,
                        services: [{
                            name: Services.AFFILIATE,
                            role: ServiceRoles.ANALYST
                        }]
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
    
                const [invitedUserToOrganization] = await knexDatabase.knexConfig('users_organizations').where("user_id", otherSignUpCreated.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');
    
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
    
                const userInServiceHandleRolePayload = {
                    userId: otherSignUpCreated.id,
                    serviceName: Services.AFFILIATE,
                    serviceRole: ServiceRoles.ADMIN
                };

                const userInServiceHandleRoleResponse = await request
                .post('/graphql')
                .set('content-type', 'application/json')
                .set('x-api-token', userToken)
                .send({
                'query': USER_IN_SERVICE_HANDLE_ROLE, 
                'variables': {
                        input: userInServiceHandleRolePayload
                    }
                });

                expect(userInServiceHandleRoleResponse.statusCode).toBe(200)
    
                const [adminServiceRoles] = await knexDatabase.knexConfig('service_roles').where('name', ServiceRoles.ADMIN).select('id');
                
                const [userInOrganizationService] = await knexDatabase.knexConfig('users_organization_service_roles').select();
    
                expect(userInServiceHandleRoleResponse.body.data.userInServiceHandleRole).toEqual(
                    expect.objectContaining({
                        id: userInOrganizationService.id,
                        serviceRoles: expect.objectContaining({
                            id: adminServiceRoles.id,
                            name: ServiceRoles.ADMIN
                        }),
                        userOrganization: expect.objectContaining({
                            id: invitedUserToOrganization.id,
                            user: expect.objectContaining({
                                id: otherSignUpCreated.id
                            }),
                            organization: expect.objectContaining({
                                id: organizationCreated.id
                            })
                        }),
                        service: expect.objectContaining({
                            id: serviceFound.id,
                            name: Services.AFFILIATE
                        }),
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String),
                    })
                )
    
                done();
            })

            // test('org admin should inative service members graphql', async done => {

            //     const otherSignUpPayload = {
            //         username: Faker.name.firstName(),
            //         email: Faker.internet.email(),
            //         password: "B8oneTeste123!"
            //     }
        
            //     const otherSignUpResponse = await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .send({
            //     'query': SIGN_UP, 
            //     'variables': {
            //             input: otherSignUpPayload
            //         }
            //     });
        
            //     let otherSignUpCreated = otherSignUpResponse.body.data.signUp
        
            //     const [userFromDb] = await knexDatabase.knexConfig('users').where('id', otherSignUpCreated.id).select('verification_hash', 'id');
        
            //     const userVerifyEmailPayload = {
            //         verificationHash: userFromDb.verification_hash,
            //         response: OrganizationInviteStatus.ACCEPT
            //     }
        
            //     await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .send({
            //     'query': USER_VERIFY_EMAIL, 
            //     'variables': {
            //             input: userVerifyEmailPayload
            //         }
            //     });
    
            //     const inviteUserToOrganizationPayload = {
            //         users: [{
            //             id: otherSignUpCreated.id,
            //             email: otherSignUpCreated.email
            //         }]
            //     }
        
            //     await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .set('x-api-token', userToken)
            //     .send({
            //     'query': INVITE_USER_TO_ORGANIZATION, 
            //     'variables': {
            //             input: inviteUserToOrganizationPayload
            //         }
            //     });
    
            //     const [invitedUserToOrganization] = await knexDatabase.knexConfig('users_organizations').where("user_id", otherSignUpCreated.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');
    
            //     const responseOrganizationInvitePayload = {
            //         inviteHash: invitedUserToOrganization.invite_hash,
            //         response: OrganizationInviteStatus.ACCEPT
            //     }
        
            //     await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .set('x-api-token', userToken)
            //     .send({
            //     'query': RESPONSE_INVITE, 
            //     'variables': {
            //             input: responseOrganizationInvitePayload
            //         }
            //     });
    
            //     const addUserInOrganizationServicePayload = {
            //         userId: otherSignUpCreated.id,
            //         serviceName: Services.AFFILIATE 
            //     };
    
            //     const addUserInOrganizationServiceResponse = await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .set('x-api-token', userToken)
            //     .send({
            //     'query': ADD_USER_IN_ORGANIZATION_SERVICE, 
            //     'variables': {
            //             input: addUserInOrganizationServicePayload
            //         }
            //     });
    
            //     const inativeUserFromServiceOrganizationPayload = {
            //         userId: otherSignUpCreated.id,
            //         serviceName: Services.AFFILIATE 
            //     }

            //     const inativeUserFromServiceOrganizationResponse = await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .set('x-api-token', userToken)
            //     .send({
            //     'query': INATIVE_USER_FROM_SERVICE_ORGANIZATION, 
            //     'variables': {
            //             input: inativeUserFromServiceOrganizationPayload
            //         }
            //     });

            //     expect(inativeUserFromServiceOrganizationResponse.statusCode).toBe(200);
    
            //     const [responsibleServiceRoles] = await knexDatabase.knexConfig('service_roles').where('name', ServiceRoles.ANALYST).select('id');
    
            //     expect(inativeUserFromServiceOrganizationResponse.body.data.inativeUserFromServiceOrganization).toEqual(
            //         expect.objectContaining({
            //             id: addUserInOrganizationServiceResponse.body.data.addUserInOrganizationService.id,
            //             serviceRoles: expect.objectContaining({
            //                 id: responsibleServiceRoles.id
            //             }),
            //             userOrganization: expect.objectContaining({
            //                 id: invitedUserToOrganization.id,
            //                 user: expect.objectContaining({
            //                     id: otherSignUpCreated.id
            //                 }),
            //                 organization: expect.objectContaining({
            //                     id: organizationCreated.id
            //                 })
            //             }),
            //             service: expect.objectContaining({
            //                 id: serviceFound.id
            //             }),
            //             createdAt: expect.any(String),
            //             updatedAt: expect.any(String),
            //             active: false
            //         })
            //     )
    
            //     done();
            // })

            // test('getUserOrganizationServiceByServiceName - organization member should get your data', async done => {

            //     const otherSignUpPayload = {
            //         username: Faker.name.firstName(),
            //         email: Faker.internet.email(),
            //         password: "B8oneTeste123!"
            //     }
        
            //     const otherSignUpResponse = await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .send({
            //     'query': SIGN_UP, 
            //     'variables': {
            //             input: otherSignUpPayload
            //         }
            //     });
        
            //     let otherSignUpCreated = otherSignUpResponse.body.data.signUp
        
            //     const [otherUserFromDB] = await knexDatabase.knexConfig('users').where('id', otherSignUpCreated.id).select('verification_hash', 'id');
        
            //     const userVerifyEmailPayload = {
            //         verificationHash: otherUserFromDB.verification_hash
            //     }
        
            //     await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .send({
            //     'query': USER_VERIFY_EMAIL, 
            //     'variables': {
            //             input: userVerifyEmailPayload
            //         }
            //     });

            //     const inviteUserToOrganizationPayload = {
            //         users: [{
            //             id: otherSignUpCreated.id,
            //             email: otherSignUpCreated.email
            //         }]
            //     }

            //     await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .set('x-api-token', userToken)
            //     .send({
            //     'query': INVITE_USER_TO_ORGANIZATION, 
            //     'variables': {
            //             input: inviteUserToOrganizationPayload
            //         }
            //     });

            //     const [invitedUserToOrganization] = await knexDatabase.knexConfig('users_organizations').where("user_id", otherSignUpCreated.id).select('invite_hash', 'id');

    
            //     const responseOrganizationInvitePayload = {
            //         inviteHash: invitedUserToOrganization.invite_hash,
            //         response: OrganizationInviteStatus.ACCEPT
            //     }
    
            //     await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .set('x-api-token', userToken)
            //     .send({
            //     'query': RESPONSE_INVITE, 
            //     'variables': {
            //             input: responseOrganizationInvitePayload
            //         }
            //     });

            //     const addUserInOrganizationPayload = {
            //         userId: otherSignUpCreated.id,
            //         serviceName: Services.AFFILIATE
            //     }

            //     const addUserInOrganizationServiceResponse = await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .set('x-api-token', userToken)
            //     .send({
            //     'query': ADD_USER_IN_ORGANIZATION_SERVICE, 
            //     'variables': {
            //             input: addUserInOrganizationPayload
            //         }
            //     });
    
            //     let getUserOrganizationServiceByServiceNamePayload = {
            //         serviceName: Services.AFFILIATE 
            //     }

            //     let affiliateUserClient = { origin: 'user', id: otherSignUpCreated.id };

            //     let affiliateToken = await jwt.sign(affiliateUserClient, process.env.JWT_SECRET);

            //     const currentOrganizationPayload = {
            //         organizationId: organizationCreated.id
            //     }
        
            //     await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .set('x-api-token', affiliateToken)
            //     .send({
            //     'query': SET_CURRENT_ORGANIZATION, 
            //     'variables': {
            //             input: currentOrganizationPayload
            //         }
            //     });

            //     const getUserOrganizationByServiceNameResponse = await request
            //     .post('/graphql')
            //     .set('content-type', 'application/json')
            //     .set('x-api-token', affiliateToken)
            //     .send({
            //     'query': GET_USER_ORGANIZATION_BY_SERVICE_NAME, 
            //     'variables': {
            //             input: getUserOrganizationServiceByServiceNamePayload
            //         }
            //     });

            //     expect(getUserOrganizationByServiceNameResponse.statusCode).toBe(200);
    
            //     const [analystServiceRole] = await knexDatabase.knexConfig('service_roles').where('name', ServiceRoles.ANALYST).select('id');

            //     expect(getUserOrganizationByServiceNameResponse.body.data.getUserOrganizationByServiceName).toEqual(
            //             expect.objectContaining({
            //                 id: addUserInOrganizationServiceResponse.body.data.addUserInOrganizationService.id,
            //                 serviceRoles: expect.objectContaining({
            //                     id: analystServiceRole.id
            //                 }),
            //                 userOrganization: expect.objectContaining({
            //                     id: invitedUserToOrganization.id,
            //                     user: expect.objectContaining({
            //                         id: otherSignUpCreated.id
            //                     }),
            //                     organization: expect.objectContaining({
            //                         id: organizationCreated.id
            //                     })
            //                 }),
            //                 createdAt: expect.any(String),
            //                 updatedAt: expect.any(String)
            //             })
            //     )
    
            //     done();
            // })            
    
        })

    })

});