process.env.NODE_ENV = 'test';
import service from './service';
import UserService from '../users/service';
import Faker from 'faker';
import { Transaction } from 'knex';
import { ISignUpAdapted } from '../users/types';
import { IUserToken } from '../authentication/types';
import { OrganizationRoles, OrganizationInviteStatus, IOrganizationSimple } from './types';
import knexDatabase from '../../knex-database';

describe('Organizations', () => {

    let trx : Transaction;

    let signUpCreated: ISignUpAdapted;

    
    let signUpPayload = {
        username: Faker.name.firstName(),
        email: Faker.internet.email(),
        password: Faker.internet.password()
    }
    
    let userToken : IUserToken;

    beforeAll(async () => {
        trx = await knexDatabase.knex.transaction(); 
    });

    afterAll(async () => {
        await trx.rollback();
        await trx.destroy();
        return new Promise(resolve => {
            resolve();
        }); 
    });

    beforeEach(async () => {
        await trx('users_organization_roles').del();
        await trx('organizations').del();
        await trx('users').del();
        signUpCreated = await UserService.signUp(signUpPayload, trx);
        userToken = { origin: 'user', id: signUpCreated.id };
    })

    test("user should create new organization and grant admin role", async done => {

        const createOrganizationPayload = {
            name: Faker.internet.userName(),
            contactEmail: Faker.internet.email(),
        }

        const organizationCreated = await service.createOrganization(createOrganizationPayload, userToken, trx);

        expect(organizationCreated).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                name: createOrganizationPayload.name,
                contactEmail: createOrganizationPayload.contactEmail,
                userId: userToken.id,
                active: true,
                updatedAt: expect.any(Date),
                createdAt: expect.any(Date)
            })    
        );

        const organizationOnDb = await (trx || knexDatabase.knex)('organizations').select();

        expect(organizationOnDb).toHaveLength(1);
        expect(organizationOnDb[0]).toEqual(
            expect.objectContaining({
                id: organizationCreated.id,
                name: createOrganizationPayload.name,
                contact_email: createOrganizationPayload.contactEmail,
                user_id: userToken.id,
                active: true,
                updated_at: expect.any(Date),
                created_at: expect.any(Date)
            })
        )

        const [organizationRoles] = await (trx || knexDatabase.knex)('organization_roles').where('name', OrganizationRoles.ADMIN).select();

        expect(organizationRoles).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                name: OrganizationRoles.ADMIN,
                updated_at: expect.any(Date),
                created_at: expect.any(Date)
            })
        );
        
        const userOrganizationRoles = await (trx || knexDatabase.knex)('users_organization_roles').select();

        expect(userOrganizationRoles).toHaveLength(1);
        expect(userOrganizationRoles[0]).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                user_id: userToken.id,
                organization_id: organizationCreated.id,
                organization_role_id: organizationRoles.id,
                invite_status: OrganizationInviteStatus.ACCEPT,
                updated_at: expect.any(Date),
                created_at: expect.any(Date)
            })
        )

        done();
    })

    test("user should verify organization duplicated name before create with new organization", async done => {

        const verifyOrganizationNamePayload = {
            name: Faker.internet.domainName()
        }

        const verifiedOrganizationName = await service.verifyOrganizationName(verifyOrganizationNamePayload.name, trx);

        expect(verifiedOrganizationName).toBeFalsy();

        done();

    })

    test("user should verify organization duplicated name before create with exists organization", async done => {

        const createOrganizationPayload = {
            name: Faker.internet.domainName(),
            contactEmail: Faker.internet.email(),
        }

        await service.createOrganization(createOrganizationPayload, userToken, trx);

        const verifiedOrganizationName = await service.verifyOrganizationName(createOrganizationPayload.name, trx);

        expect(verifiedOrganizationName).toBeTruthy();

        done();

    })

    test('user organization admin should invite existent members', async done => {

        const createOrganizationPayload = {
            name: Faker.internet.userName(),
            contactEmail: Faker.internet.email(),
        }

        const organizationCreated = await service.createOrganization(createOrganizationPayload, userToken, trx);

        let signUpOtherMemberPayload = {
            username: Faker.name.firstName(),
            email: Faker.internet.email(),
            password: Faker.internet.password()
        };

        const signUpOtherMemberCreated = await UserService.signUp(signUpOtherMemberPayload, trx);

        const inviteUserToOrganizationPayload = {
            organizationId: organizationCreated.id,
            users: [{
                id: signUpOtherMemberCreated.id,
                email: signUpOtherMemberCreated.email
            }]
        }

        const invitedUserToOrganization = await service.inviteUserToOrganization(inviteUserToOrganizationPayload, userToken, trx);

        expect(invitedUserToOrganization).toBeTruthy();

        const userOrganizationRoles = await (trx || knexDatabase.knex)('users_organization_roles').select();

        const organizationRoles = await(trx || knexDatabase.knex)('organization_roles').select('id', 'name');

        const adminRole = organizationRoles.filter((role: IOrganizationSimple) => role.name === OrganizationRoles.ADMIN)
        const memberRole = organizationRoles.filter((role: IOrganizationSimple) => role.name === OrganizationRoles.MEMBER)

        expect(userOrganizationRoles).toHaveLength(2);
        expect(userOrganizationRoles).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    user_id: userToken.id,
                    organization_id: organizationCreated.id,
                    organization_role_id: adminRole[0].id,
                    invite_status: OrganizationInviteStatus.ACCEPT,
                    invite_hash: null,
                    updated_at: expect.any(Date),
                    created_at: expect.any(Date)
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    user_id: signUpOtherMemberCreated.id,
                    organization_id: organizationCreated.id,
                    organization_role_id: memberRole[0].id,
                    invite_status: OrganizationInviteStatus.PENDENT,
                    invite_hash: expect.any(String),
                    updated_at: expect.any(Date),
                    created_at: expect.any(Date)
                })
            ]),
        )

        done();
    })

    test('user organization admin should invite new members', async done => {

        const createOrganizationPayload = {
            name: Faker.internet.userName(),
            contactEmail: Faker.internet.email(),
        }

        const organizationCreated = await service.createOrganization(createOrganizationPayload, userToken, trx);

        let signUpOtherMemberPayload = {
            email: Faker.internet.email(),
        };

        const inviteUserToOrganizationPayload = {
            organizationId: organizationCreated.id,
            users: [{
                email: signUpOtherMemberPayload.email
            }]
        }

        const invitedUserToOrganization = await service.inviteUserToOrganization(inviteUserToOrganizationPayload, userToken, trx);

        expect(invitedUserToOrganization).toBeTruthy();

        const userOrganizationRoles = await (trx || knexDatabase.knex)('users_organization_roles').select();

        const organizationRoles = await(trx || knexDatabase.knex)('organization_roles').select('id', 'name');

        const adminRole = organizationRoles.filter((role: IOrganizationSimple) => role.name === OrganizationRoles.ADMIN)
        const memberRole = organizationRoles.filter((role: IOrganizationSimple) => role.name === OrganizationRoles.MEMBER)

        expect(userOrganizationRoles).toHaveLength(2);
        expect(userOrganizationRoles).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    user_id: userToken.id,
                    organization_id: organizationCreated.id,
                    organization_role_id: adminRole[0].id,
                    invite_status: OrganizationInviteStatus.ACCEPT,
                    invite_hash: null,
                    updated_at: expect.any(Date),
                    created_at: expect.any(Date)
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    user_id: expect.any(String),
                    organization_id: organizationCreated.id,
                    organization_role_id: memberRole[0].id,
                    invite_status: OrganizationInviteStatus.PENDENT,
                    invite_hash: expect.any(String),
                    updated_at: expect.any(Date),
                    created_at: expect.any(Date)
                })
            ]),
        )

        done();
    })

    test('existent user should refused invite', async done => {

        const createOrganizationPayload = {
            name: Faker.internet.userName(),
            contactEmail: Faker.internet.email()
        }

        const organizationCreated = await service.createOrganization(createOrganizationPayload, userToken, trx);

        let signUpOtherMemberPayload = {
            username: Faker.name.firstName(),
            email: Faker.internet.email(),
            password: Faker.internet.password()
        };

        const signUpOtherMemberCreated = await UserService.signUp(signUpOtherMemberPayload, trx);

        const inviteUserToOrganizationPayload = {
            organizationId: organizationCreated.id,
            users: [{
                id: signUpOtherMemberCreated.id,
                email: signUpOtherMemberCreated.email
            }]
        }

        await service.inviteUserToOrganization(inviteUserToOrganizationPayload, userToken, trx);

        const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organization_roles').where("user_id", signUpOtherMemberCreated.id).select('invite_hash');

        const responseInvitePayload = {
            inviteHash: invitedUserToOrganization.invite_hash,
            response: OrganizationInviteStatus.ACCEPT
        }

        const invitedAccept = await service.responseInvite(responseInvitePayload, trx);

        expect(invitedAccept).toBeTruthy();

        const [invitedUserToOrganizationAfter] = await (trx || knexDatabase.knex)('users_organization_roles').where("user_id", signUpOtherMemberCreated.id).select('*');

        const [organizationRoles] = await (trx || knexDatabase.knex)('organization_roles').where('name', OrganizationRoles.MEMBER).select();

        expect(invitedUserToOrganizationAfter).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                user_id: signUpOtherMemberCreated.id,
                organization_id: organizationCreated.id,
                organization_role_id: organizationRoles.id,
                invite_status: OrganizationInviteStatus.ACCEPT,
                updated_at: expect.any(Date),
                created_at: expect.any(Date)
            })
        )

        done();

    })

    test('existent user should accept invite', async done => {

        const createOrganizationPayload = {
            name: Faker.internet.userName(),
            contactEmail: Faker.internet.email()
        }

        const organizationCreated = await service.createOrganization(createOrganizationPayload, userToken, trx);

        let signUpOtherMemberPayload = {
            username: Faker.name.firstName(),
            email: Faker.internet.email(),
            password: Faker.internet.password()
        };

        const signUpOtherMemberCreated = await UserService.signUp(signUpOtherMemberPayload, trx);

        const inviteUserToOrganizationPayload = {
            organizationId: organizationCreated.id,
            users: [{
                id: signUpOtherMemberCreated.id,
                email: signUpOtherMemberCreated.email
            }]
        }

        await service.inviteUserToOrganization(inviteUserToOrganizationPayload, userToken, trx);

        const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organization_roles').where("user_id", signUpOtherMemberCreated.id).select('invite_hash');

        const responseInvitePayload = {
            inviteHash: invitedUserToOrganization.invite_hash,
            response: OrganizationInviteStatus.REFUSED
        }

        const invitedAccept = await service.responseInvite(responseInvitePayload, trx);

        expect(invitedAccept).toBeTruthy();

        const [invitedUserToOrganizationAfter] = await (trx || knexDatabase.knex)('users_organization_roles').where("user_id", signUpOtherMemberCreated.id).select('*');

        const [organizationRoles] = await (trx || knexDatabase.knex)('organization_roles').where('name', OrganizationRoles.MEMBER).select();

        expect(invitedUserToOrganizationAfter).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                user_id: signUpOtherMemberCreated.id,
                organization_id: organizationCreated.id,
                organization_role_id: organizationRoles.id,
                invite_status: OrganizationInviteStatus.REFUSED,
                updated_at: expect.any(Date),
                created_at: expect.any(Date)
            })
        )

        done();

    })

    test('no existent user should accept invite', async done => {

        const createOrganizationPayload = {
            name: Faker.internet.userName(),
            contactEmail: Faker.internet.email()
        }

        const organizationCreated = await service.createOrganization(createOrganizationPayload, userToken, trx);

        let signUpOtherMemberPayload = {
            email: Faker.internet.email(),
        };

        const inviteUserToOrganizationPayload = {
            organizationId: organizationCreated.id,
            users: [{
                email: signUpOtherMemberPayload.email
            }]
        }

        await service.inviteUserToOrganization(inviteUserToOrganizationPayload, userToken, trx);

        const [userFound] = await (trx || knexDatabase.knex)('users').where('email', signUpOtherMemberPayload.email).select('id')

        const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organization_roles').where("user_id", userFound.id).select('invite_hash');

        const responseInvitePayload = {
            inviteHash: invitedUserToOrganization.invite_hash,
            response: OrganizationInviteStatus.ACCEPT
        }

        const invitedAccept = await service.responseInvite(responseInvitePayload, trx);

        expect(invitedAccept).toBeFalsy();

        const [invitedUserToOrganizationAfter] = await (trx || knexDatabase.knex)('users_organization_roles').where("user_id", userFound.id).select('*');

        const [organizationRoles] = await (trx || knexDatabase.knex)('organization_roles').where('name', OrganizationRoles.MEMBER).select();

        expect(invitedUserToOrganizationAfter).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                user_id: userFound.id,
                organization_id: organizationCreated.id,
                organization_role_id: organizationRoles.id,
                invite_status: OrganizationInviteStatus.PENDENT,
                updated_at: expect.any(Date),
                created_at: expect.any(Date)
            })
        )

        done();

    })
        
});