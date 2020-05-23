process.env.NODE_ENV = 'test';
import Faker from 'faker';
import { IUserToken, ISignInAdapted } from "../../authentication/types";
import jwt from 'jsonwebtoken';
import knexDatabase from '../../../knex-database';
import { OrganizationRoles, IOrganizationSimple, OrganizationInviteStatus } from '../types';
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

const INATIVE_USER_IN_ORGANIZATION = `
    mutation inativeUserInOrganization($input: InativeUserInOrganizationInput!) {
        inativeUserInOrganization(input: $input){
            id
            inviteStatus
            inviteHash
            updatedAt
            createdAt
            user{
                id
            }
            organization{
                id
            }
        }
    }
`

const HANDLE_USER_PERMISSION_IN_ORGANIZATION = `
    mutation handleUserPermissionInOrganization($input: HandleUserPermissionInOrganizationInput!) {
        handleUserPermissionInOrganization(input: $input){
            id
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

const FIND_USERS_TO_ORGANIZATION = `
    query findUsersToOrganization($input: FindUsersToOrganizationInput!) {
        findUsersToOrganization(input: $input){
            inviteStatus
            usersOrganizationsId
            user{
                id
                email
                username
            }
        }
    }
`

const LIST_MY_ORGANIZATIONS = `
    query listMyOrganizations{
        listMyOrganizations{
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

const ORGANIZATION_DETAILS = `
    query organizationDetails($input: OrganizationDetailsInput!){
        organizationDetails(input: $input){
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

const LIST_USERS_IN_ORGANIZATION = `
    query listUsersInOrganization($input: ListUsersInOrganizationInput!) {
        listUsersInOrganization(input: $input){
            id
            user{
                id
            }
            organization{
                id
            }
            inviteStatus
            inviteHash
            createdAt
            updatedAt
            active
            organizationRole{
                id
                name
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
    });

    afterAll(async () => {
        await knexDatabase.cleanMyTestDB();
    })

    describe("organization tests with user verified", () => {
        
        beforeEach(async () => {
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
    
            const organizationOnDb = await knexDatabase.knex('organizations').select();
    
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

        test("user should list your organizations", async done => {

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
    
            const listMyOrganizationsResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': LIST_MY_ORGANIZATIONS, 
            'variables': {
                    input: createOrganizationPayload
                }
            });
    
            expect(listMyOrganizationsResponse.statusCode).toBe(200);
    
            expect(listMyOrganizationsResponse.body.data.listMyOrganizations).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: createOrganizationResponse.body.data.createOrganization.id,
                        name: createOrganizationPayload.name,
                        contactEmail: createOrganizationPayload.contactEmail,
                        user: expect.objectContaining({
                            id: userClient.id
                        }),
                        active: true,
                        updatedAt: expect.any(String),
                        createdAt: expect.any(String)
                    })
                ])
            )
    
            done();
    
        })

        test("user should list your organization details", async done => {

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
    
            const organizationDetailsPayload = {
                organizationName: createOrganizationResponse.body.data.createOrganization.name
            }

            const organizationDetailsResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': ORGANIZATION_DETAILS, 
            'variables': {
                    input: organizationDetailsPayload
                }
            });

            expect(organizationDetailsResponse.statusCode).toBe(200);
            expect(organizationDetailsResponse.body.data.organizationDetails).toEqual(
                    expect.objectContaining({
                        id: createOrganizationResponse.body.data.createOrganization.id,
                        name: createOrganizationPayload.name,
                        contactEmail: createOrganizationPayload.contactEmail,
                        user: expect.objectContaining({
                            id: userClient.id
                        }),
                        active: true,
                        updatedAt: expect.any(String),
                        createdAt: expect.any(String)
                    })
            )
    
            done();
    
        })

        test('user organization admin should invite existent members', async done => {

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

            const organizationCreated = createOrganizationResponse.body.data.createOrganization;
    
            let signUpOtherMemberPayload = {
                username: Faker.name.firstName(),
                email: Faker.internet.email(),
                password: "B8oneTeste123!"
            };

            const signUpResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .send({
            'query': SIGN_UP, 
            'variables': {
                    input: signUpOtherMemberPayload
                }
            });
    
            let otherSignUpCreated = signUpResponse.body.data.signUp
    
            const inviteUserToOrganizationPayload = {
                organizationId: organizationCreated.id,
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                }]
            }

            const inviteUserToOrganizationResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': INVITE_USER_TO_ORGANIZATION, 
            'variables': {
                    input: inviteUserToOrganizationPayload
                }
            });

            expect(inviteUserToOrganizationResponse.statusCode).toBe(200);
            expect(inviteUserToOrganizationResponse.body.data.inviteUserToOrganization).toBeTruthy();

            const userOrganizations = await knexDatabase.knex('users_organizations').select();

            expect(userOrganizations).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(String),
                        user_id: userClient.id,
                        organization_id: organizationCreated.id,
                        invite_status: OrganizationInviteStatus.ACCEPT,
                        invite_hash: null,
                        updated_at: expect.any(Date),
                        created_at: expect.any(Date)
                    }),
                    expect.objectContaining({
                        id: expect.any(String),
                        user_id: otherSignUpCreated.id,
                        organization_id: organizationCreated.id,
                        invite_status: OrganizationInviteStatus.PENDENT,
                        invite_hash: expect.any(String),
                        updated_at: expect.any(Date),
                        created_at: expect.any(Date)
                    })
                ])
            )
    
            const userOrganizationRoles = await knexDatabase.knex('users_organization_roles').select();
    
            const organizationRoles = await knexDatabase.knex('organization_roles').select('id', 'name');
    
            const adminRole = organizationRoles.filter((role: IOrganizationSimple) => role.name === OrganizationRoles.ADMIN)
            const memberRole = organizationRoles.filter((role: IOrganizationSimple) => role.name === OrganizationRoles.MEMBER)

            expect(userOrganizationRoles).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(String),
                        users_organization_id: expect.any(String),
                        organization_role_id: adminRole[0].id,
                        updated_at: expect.any(Date),
                        created_at: expect.any(Date)
                    }),
                    expect.objectContaining({
                        id: expect.any(String),
                        users_organization_id: expect.any(String),
                        organization_role_id: memberRole[0].id,
                        updated_at: expect.any(Date),
                        created_at: expect.any(Date)
                    })
                ])
            )
    
            done();
        });

        test('user organization admin should invite inexistent members', async done => {

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

            const organizationCreated = createOrganizationResponse.body.data.createOrganization;
    
            let signUpOtherMemberPayload = {
                email: Faker.internet.email(),
            };
    
            const inviteUserToOrganizationPayload = {
                organizationId: organizationCreated.id,
                users: [{
                    email: signUpOtherMemberPayload.email
                }]
            }

            const inviteUserToOrganizationResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': INVITE_USER_TO_ORGANIZATION, 
            'variables': {
                    input: inviteUserToOrganizationPayload
                }
            });

            expect(inviteUserToOrganizationResponse.statusCode).toBe(200);
            expect(inviteUserToOrganizationResponse.body.data.inviteUserToOrganization).toBeTruthy();

            const userOrganizations = await knexDatabase.knex('users_organizations').select();

            expect(userOrganizations).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(String),
                        user_id: userClient.id,
                        organization_id: organizationCreated.id,
                        invite_status: OrganizationInviteStatus.ACCEPT,
                        invite_hash: null,
                        updated_at: expect.any(Date),
                        created_at: expect.any(Date)
                    }),
                    expect.objectContaining({
                        id: expect.any(String),
                        user_id: expect.any(String),
                        organization_id: organizationCreated.id,
                        invite_status: OrganizationInviteStatus.PENDENT,
                        invite_hash: expect.any(String),
                        updated_at: expect.any(Date),
                        created_at: expect.any(Date)
                    })
                ])
            )
    
            const userOrganizationRoles = await knexDatabase.knex('users_organization_roles').select();
    
            const organizationRoles = await knexDatabase.knex('organization_roles').select('id', 'name');
    
            const adminRole = organizationRoles.filter((role: IOrganizationSimple) => role.name === OrganizationRoles.ADMIN)
            const memberRole = organizationRoles.filter((role: IOrganizationSimple) => role.name === OrganizationRoles.MEMBER)

            const [user] = await knexDatabase.knex('users').where('email', inviteUserToOrganizationPayload.users[0].email).select('id');
    
            expect(userOrganizationRoles).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(String),
                        users_organization_id: expect.any(String),
                        organization_role_id: adminRole[0].id,
                        updated_at: expect.any(Date),
                        created_at: expect.any(Date)
                    }),
                    expect.objectContaining({
                        id: expect.any(String),
                        users_organization_id: expect.any(String),
                        organization_role_id: memberRole[0].id,
                        updated_at: expect.any(Date),
                        created_at: expect.any(Date)
                    })
                ]),
            )
    
            done();
        });
    
        test('existent user should accept invite', async done => {
    
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

            const organizationCreated = createOrganizationResponse.body.data.createOrganization;
    
            let signUpOtherMemberPayload = {
                username: Faker.name.firstName(),
                email: Faker.internet.email(),
                password: "B8oneTeste123!"
            };

            const signUpResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .send({
            'query': SIGN_UP, 
            'variables': {
                    input: signUpOtherMemberPayload
                }
            });
    
            let otherSignUpCreated = signUpResponse.body.data.signUp
    
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
    
            const [invitedUserToOrganization] = await knexDatabase.knex('users_organizations').where("user_id", otherSignUpCreated.id).select('invite_hash');
    
            const responseOrganizationInvitePayload = {
                inviteHash: invitedUserToOrganization.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }

            const responseOrganizationInviteResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': RESPONSE_INVITE, 
            'variables': {
                    input: responseOrganizationInvitePayload
                }
            });
    
            expect(responseOrganizationInviteResponse.statusCode).toBe(200);
            expect(responseOrganizationInviteResponse.body.data.responseOrganizationInvite).toBeTruthy();
    
            const [invitedUserToOrganizationAfter] = await knexDatabase.knex('users_organizations').where("user_id", otherSignUpCreated.id).select('*');
    
            expect(invitedUserToOrganizationAfter).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    user_id: otherSignUpCreated.id,
                    organization_id: organizationCreated.id,
                    invite_status: OrganizationInviteStatus.ACCEPT,
                    updated_at: expect.any(Date),
                    created_at: expect.any(Date)
                })
            )
    
            done();
    
        });
    
        test('existent user should refuse invite', async done => {
    
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

            const organizationCreated = createOrganizationResponse.body.data.createOrganization;
    
            let signUpOtherMemberPayload = {
                username: Faker.name.firstName(),
                email: Faker.internet.email(),
                password: "B8oneTeste123!"
            };

            const signUpResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .send({
            'query': SIGN_UP, 
            'variables': {
                    input: signUpOtherMemberPayload
                }
            });
    
            let otherSignUpCreated = signUpResponse.body.data.signUp
    
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
    
            const [invitedUserToOrganization] = await knexDatabase.knex('users_organizations').where("user_id", otherSignUpCreated.id).select('invite_hash');
    
            const responseOrganizationInvitePayload = {
                inviteHash: invitedUserToOrganization.invite_hash,
                response: OrganizationInviteStatus.REFUSED
            }

            const responseOrganizationInviteResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': RESPONSE_INVITE, 
            'variables': {
                    input: responseOrganizationInvitePayload
                }
            });
    
            expect(responseOrganizationInviteResponse.statusCode).toBe(200);
            expect(responseOrganizationInviteResponse.body.data.responseOrganizationInvite).toBeTruthy();
    
            const [invitedUserToOrganizationAfter] = await knexDatabase.knex('users_organizations').where("user_id", otherSignUpCreated.id).select('*');
    
            expect(invitedUserToOrganizationAfter).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    user_id: otherSignUpCreated.id,
                    organization_id: organizationCreated.id,
                    invite_status: OrganizationInviteStatus.REFUSED,
                    updated_at: expect.any(Date),
                    created_at: expect.any(Date)
                })
            )
    
            done();
    
        });
    
        test('no existent user should accept invite', async done => {
    
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

            const organizationCreated = createOrganizationResponse.body.data.createOrganization;
    
            let signUpOtherMemberPayload = {
                email: Faker.internet.email(),
            };
    
            const inviteUserToOrganizationPayload = {
                organizationId: organizationCreated.id,
                users: [{
                    email: signUpOtherMemberPayload.email
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

            const [userFound] = await knexDatabase.knex('users').where('email', signUpOtherMemberPayload.email).select('id')
    
            const [invitedUserToOrganization] = await knexDatabase.knex('users_organizations').where("user_id", userFound.id).select('invite_hash');
    
            const responseOrganizationInvitePayload = {
                inviteHash: invitedUserToOrganization.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }

            const responseOrganizationInviteResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': RESPONSE_INVITE, 
            'variables': {
                    input: responseOrganizationInvitePayload
                }
            });
    
            expect(responseOrganizationInviteResponse.statusCode).toBe(200);
            expect(responseOrganizationInviteResponse.body.data.responseOrganizationInvite).toBeFalsy();
    
            const [invitedUserToOrganizationAfter] = await knexDatabase.knex('users_organizations').where("user_id", userFound.id).select('*');
    
            expect(invitedUserToOrganizationAfter).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    user_id: userFound.id,
                    organization_id: organizationCreated.id,
                    invite_status: OrganizationInviteStatus.PENDENT,
                    updated_at: expect.any(Date),
                    created_at: expect.any(Date)
                })
            )
    
            done();
    
        })

        test("user should search other members", async done => {
    
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

            const organizationCreated = createOrganizationResponse.body.data.createOrganization;

            const signUpPayload2 = {
                username: "User1",
                email: "user1@b8one.com",
                password: "B8oneTeste123!"
            }

            const signUpPayload3 = {
                username: "User2",
                email: "user2@b8one.com",
                password: "B8oneTeste123!"
            }
    
            const signUpResponse2 = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .send({
            'query': SIGN_UP, 
            'variables': {
                    input: signUpPayload2
                }
            });
    
            let signUpCreated2 = signUpResponse2.body.data.signUp

            const signUpResponse3 = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .send({
            'query': SIGN_UP, 
            'variables': {
                    input: signUpPayload3
                }
            });
    
            let signUpCreated3 = signUpResponse3.body.data.signUp
    
    
            const [userFromDb2] = await knexDatabase.knex('users').where('id', signUpCreated2.id).select('verification_hash');
            const [userFromDb3] = await knexDatabase.knex('users').where('id', signUpCreated3.id).select('verification_hash');

            const userVerifyEmailPayload2 = {
                verificationHash: userFromDb2.verification_hash
            }

            const userVerifyEmailPayload3 = {
                verificationHash: userFromDb3.verification_hash
            }
    
            await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .send({
            'query': USER_VERIFY_EMAIL, 
            'variables': {
                    input: userVerifyEmailPayload2
                }
            });
    
            await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .send({
            'query': USER_VERIFY_EMAIL, 
            'variables': {
                    input: userVerifyEmailPayload3
                }
            });
    
            const findUsersPayload = {
                name: "user",
                organizationId: organizationCreated.id
            }


            const findUsersToOrganizationResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': FIND_USERS_TO_ORGANIZATION, 
            'variables': {
                    input: findUsersPayload
                }
            });

            expect(findUsersToOrganizationResponse.statusCode).toBe(200);
            expect(findUsersToOrganizationResponse.body.data.findUsersToOrganization).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        user: expect.objectContaining({
                            id: expect.any(String),
                            username: signUpPayload2.username,
                            email: signUpPayload2.email,
                        }),
                        inviteStatus: null,
                        usersOrganizationsId: null
                    }),
                    expect.objectContaining({
                        user: expect.objectContaining({
                            id: expect.any(String),
                            username: signUpPayload3.username,
                            email: signUpPayload3.email,
                        }),
                        inviteStatus: null,
                        usersOrganizationsId: null
                    })
                ])
            )
    
            const userFoundsOnDB = await knexDatabase.knexTest('users').select();
    
            expect(userFoundsOnDB).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        username: signUpCreated.username,
                        email: signUpCreated.email
                    }),
                    expect.objectContaining({
                        username: signUpPayload2.username,
                        email: signUpPayload2.email
                    }),
                    expect.objectContaining({
                        username: signUpPayload3.username,
                        email: signUpPayload3.email
                    })
                ])
            )
    
            done();
    
        })

        test("user should search other invited members", async done => {
    
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

            const organizationCreated = createOrganizationResponse.body.data.createOrganization;

            const signUpPayload2 = {
                username: "User3",
                email: "user3@b8one.com",
                password: "B8oneTeste123!"
            }

            const signUpPayload3 = {
                username: "User4",
                email: "user4@b8one.com",
                password: "B8oneTeste123!"
            }
    
            const signUpResponse2 = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .send({
            'query': SIGN_UP, 
            'variables': {
                    input: signUpPayload2
                }
            });

            let signUpCreated2 = signUpResponse2.body.data.signUp

            const signUpResponse3 = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .send({
            'query': SIGN_UP, 
            'variables': {
                    input: signUpPayload3
                }
            });
    
            let signUpCreated3 = signUpResponse3.body.data.signUp
    
    
            const [userFromDb2] = await knexDatabase.knex('users').where('id', signUpCreated2.id).select('verification_hash');
            const [userFromDb3] = await knexDatabase.knex('users').where('id', signUpCreated3.id).select('verification_hash');

            const userVerifyEmailPayload2 = {
                verificationHash: userFromDb2.verification_hash
            }

            const userVerifyEmailPayload3 = {
                verificationHash: userFromDb3.verification_hash
            }
    
            await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .send({
            'query': USER_VERIFY_EMAIL, 
            'variables': {
                    input: userVerifyEmailPayload2
                }
            });
    
            await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .send({
            'query': USER_VERIFY_EMAIL, 
            'variables': {
                    input: userVerifyEmailPayload3
                }
            });

            const inviteUserToOrganizationPayload = {
                organizationId: organizationCreated.id,
                users: [{
                    id: signUpCreated2.id,
                    email: signUpCreated2.email
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
    
            const findUsersPayload = {
                name: "user",
                organizationId: organizationCreated.id
            }

            const findUsersToOrganizationResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': FIND_USERS_TO_ORGANIZATION, 
            'variables': {
                    input: findUsersPayload
                }
            });

            expect(findUsersToOrganizationResponse.statusCode).toBe(200);
            expect(findUsersToOrganizationResponse.body.data.findUsersToOrganization).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        inviteStatus: OrganizationInviteStatus.PENDENT,
                        usersOrganizationsId: expect.any(String),
                        user: expect.objectContaining({
                            id: expect.any(String),
                            username: signUpPayload2.username,
                            email: signUpPayload2.email,
                        })
                    }),
                    expect.objectContaining({
                        user: expect.objectContaining({
                            id: expect.any(String),
                            username: signUpPayload3.username,
                            email: signUpPayload3.email,
                        }),
                        inviteStatus: null,
                        usersOrganizationsId: null
                    })
                ])
            )
    
            const userFoundsOnDB = await knexDatabase.knexTest('users').select();
    
            expect(userFoundsOnDB).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        username: signUpCreated.username,
                        email: signUpCreated.email
                    }),
                    expect.objectContaining({
                        username: signUpPayload2.username,
                        email: signUpPayload2.email
                    }),
                    expect.objectContaining({
                        username: signUpPayload3.username,
                        email: signUpPayload3.email
                    })
                ])
            )
    
            done();
    
        })

        test("user should inative user from organization", async done => {

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

            const organizationCreated = createOrganizationResponse.body.data.createOrganization;
    
            let signUpOtherMemberPayload = {
                username: Faker.name.firstName(),
                email: Faker.internet.email(),
                password: "B8oneTeste123!"
            };

            const signUpResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .send({
            'query': SIGN_UP, 
            'variables': {
                    input: signUpOtherMemberPayload
                }
            });
    
            let otherSignUpCreated = signUpResponse.body.data.signUp
    
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
    
            const inativeUserInOrganizationPayload = {
                userId: otherSignUpCreated.id,
                organizationId: organizationCreated.id
            }
    
            const inativeUserInOrganizationResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': INATIVE_USER_IN_ORGANIZATION, 
            'variables': {
                    input: inativeUserInOrganizationPayload
                }
            });
    
            expect(inativeUserInOrganizationResponse.statusCode).toBe(200);
            expect(inativeUserInOrganizationResponse.body.data.inativeUserInOrganization).toEqual(
                expect.objectContaining({
                    id: invitedUserToOrganization.id,
                    user: expect.objectContaining({
                        id: otherSignUpCreated.id
                    }),
                    organization: expect.objectContaining({
                        id: organizationCreated.id
                    }),
                    inviteStatus: OrganizationInviteStatus.ACCEPT,
                    inviteHash: null,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String)
                })
            )
    
            done();
        })

        test("member/admin should list users from organization by optional name graphql", async done => {

            let signUpPayload3 = {
                username: "userteste",
                email: "userteste@b8one.com",
                password: "B8oneTeste123!"
            }
    
            const signUpResponse3 = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .send({
            'query': SIGN_UP, 
            'variables': {
                    input: signUpPayload3
                }
            });
    
            let signUpCreated3 = signUpResponse3.body.data.signUp
    
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

            const organizationCreated = createOrganizationResponse.body.data.createOrganization;
    
            let signUpOtherMemberPayload = {
                username: `aaaaaaaaaa`,
                email: `aaaaaaaaaa@b8one.com`,
                password: "B8oneTeste123!"
            };
    
            const signUpOtherMemberCreatedResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .send({
            'query': SIGN_UP, 
            'variables': {
                    input: signUpOtherMemberPayload
                }
            });
    
            let signUpOtherMemberCreated = signUpOtherMemberCreatedResponse.body.data.signUp
    
    
            const inviteUserToOrganizationPayload = {
                organizationId: organizationCreated.id,
                users: [{
                    id: signUpOtherMemberCreated.id,
                    email: signUpOtherMemberCreated.email
                },{
                    id: signUpCreated3.id,
                    email: signUpCreated3.email
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
    
            const [invitedUserToOrganization] = await knexDatabase.knex('users_organizations').where("user_id", signUpOtherMemberCreated.id).select('invite_hash', 'id');
    
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

            const [invitedUserToOrganization2] = await knexDatabase.knex('users_organizations').where("user_id", signUpCreated3.id).select('invite_hash', 'id');
    
            const responseOrganizationInvitePayload2 = {
                inviteHash: invitedUserToOrganization2.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }

            await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': RESPONSE_INVITE, 
            'variables': {
                    input: responseOrganizationInvitePayload2
                }
            });
    
            const listUsersInOrganizationPayload = {
                name: "user",
                organizationId: organizationCreated.id
            }

            const listUsersInOrganizationResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': LIST_USERS_IN_ORGANIZATION, 
            'variables': {
                    input: listUsersInOrganizationPayload
                }
            });

            expect(listUsersInOrganizationResponse.statusCode).toBe(200)
    
            const [memberRole] = await knexDatabase.knex('organization_roles').where('name', OrganizationRoles.MEMBER).select('id');
    
            expect(listUsersInOrganizationResponse.body.data.listUsersInOrganization).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: invitedUserToOrganization2.id,
                        user: expect.objectContaining({
                            id: signUpCreated3.id
                        }),
                        organization: expect.objectContaining({
                            id: organizationCreated.id
                        }),
                        inviteStatus: OrganizationInviteStatus.ACCEPT,
                        inviteHash: null,
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String),
                        active: true,
                        organizationRole: expect.objectContaining({
                            id: memberRole.id,
                            name: OrganizationRoles.MEMBER
                        })
                    })
                ])
            )
    
            done();
        })

        test("organization admin should handle member permissions to admin", async done => {

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

            const organizationCreated = createOrganizationResponse.body.data.createOrganization;
    
            let signUpOtherMemberPayload = {
                username: Faker.internet.userName(),
                email: Faker.internet.email(),
                password: "B8oneTeste123!"
            };
    
            const signUpOtherMemberCreatedResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .send({
            'query': SIGN_UP, 
            'variables': {
                    input: signUpOtherMemberPayload
                }
            });
    
            let signUpOtherMemberCreated = signUpOtherMemberCreatedResponse.body.data.signUp
    
            const inviteUserToOrganizationPayload = {
                organizationId: organizationCreated.id,
                users: [{
                    id: signUpOtherMemberCreated.id,
                    email: signUpOtherMemberCreated.email
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
    
            const [invitedUserToOrganization] = await knexDatabase.knex('users_organizations').where("user_id", signUpOtherMemberCreated.id).select('invite_hash', 'id');
    
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

            const handleUserPermissionInOrganizationPayload = {
                userId: signUpOtherMemberCreated.id,
                organizationId: organizationCreated.id,
                permission: OrganizationRoles.ADMIN
            };

            const handleUserPermissionInOrganizationResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': HANDLE_USER_PERMISSION_IN_ORGANIZATION, 
            'variables': {
                    input: handleUserPermissionInOrganizationPayload
                }
            });

            expect(handleUserPermissionInOrganizationResponse.statusCode).toBe(200);
    
            const [userOrganizationRoleFound] = await knexDatabase.knex('users_organization_roles').where('users_organization_id', invitedUserToOrganization.id).select('id');
            
            expect(handleUserPermissionInOrganizationResponse.body.data.handleUserPermissionInOrganization).toEqual(
                expect.objectContaining({
                    id: userOrganizationRoleFound.id,
                    userOrganization: expect.objectContaining({
                        id: invitedUserToOrganization.id,
                        user: expect.objectContaining({
                            id: signUpOtherMemberCreated.id
                        }),
                        organization: expect.objectContaining({
                            id: organizationCreated.id
                        }),
                    }),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String)
                })
            )
    
            done();
        })

    })

});