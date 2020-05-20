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
        password: "B8oneTeste123!"
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
        await trx('users_organizations').del();
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
        
        const userOrganizations = await (trx || knexDatabase.knex)('users_organizations').select();

        expect(userOrganizations).toHaveLength(1);
        expect(userOrganizations[0]).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                user_id: userToken.id,
                organization_id: organizationCreated.id,
                invite_status: OrganizationInviteStatus.ACCEPT,
                invite_hash: null
            })
        )
        
        const userOrganizationRoles = await (trx || knexDatabase.knex)('users_organization_roles').select();

        expect(userOrganizationRoles).toHaveLength(1);
        expect(userOrganizationRoles[0]).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                user_id: userToken.id,
                users_organization_id: userOrganizations[0].id,
                organization_role_id: organizationRoles.id,
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
            password: "B8oneTeste123!"
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
        
        const userOrganizations = await (trx || knexDatabase.knex)('users_organizations').select();

        expect(userOrganizations).toHaveLength(2);
        expect(userOrganizations).toEqual(
                expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    user_id: userToken.id,
                    organization_id: organizationCreated.id,
                    invite_status: OrganizationInviteStatus.ACCEPT,
                    invite_hash: null,
                    updated_at: expect.any(Date),
                    created_at: expect.any(Date)
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    user_id: signUpOtherMemberCreated.id,
                    organization_id: organizationCreated.id,
                    invite_status: OrganizationInviteStatus.PENDENT,
                    invite_hash: expect.any(String),
                    updated_at: expect.any(Date),
                    created_at: expect.any(Date)
                })
            ])
        )

        const userOrganizationRoles = await (trx || knexDatabase.knex)('users_organization_roles').select();

        const organizationRoles = await(trx || knexDatabase.knex)('organization_roles').select('id', 'name');

        const adminRole = organizationRoles.filter((role: IOrganizationSimple) => role.name === OrganizationRoles.ADMIN)
        const memberRole = organizationRoles.filter((role: IOrganizationSimple) => role.name === OrganizationRoles.MEMBER)

        const [userOtherUserOrganizations] = await (trx || knexDatabase.knex)('users_organizations').where('user_id', signUpOtherMemberCreated.id).select();
        const [userOrganizationsFounder] = await (trx || knexDatabase.knex)('users_organizations').whereNot('user_id', signUpOtherMemberCreated.id).select();

        expect(userOrganizationRoles).toHaveLength(2);
        expect(userOrganizationRoles).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    user_id: userToken.id,
                    organization_role_id: adminRole[0].id,
                    users_organization_id: userOrganizationsFounder.id,
                    updated_at: expect.any(Date),
                    created_at: expect.any(Date)
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    user_id: signUpOtherMemberCreated.id,
                    organization_role_id: memberRole[0].id,
                    users_organization_id: userOtherUserOrganizations.id,
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

        const userOrganizations = await (trx || knexDatabase.knex)('users_organizations').select();

        expect(userOrganizations).toHaveLength(2);
        expect(userOrganizations).toEqual(
                expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    user_id: userToken.id,
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

        const userOrganizationRoles = await (trx || knexDatabase.knex)('users_organization_roles').select();

        const organizationRoles = await(trx || knexDatabase.knex)('organization_roles').select('id', 'name');

        const adminRole = organizationRoles.filter((role: IOrganizationSimple) => role.name === OrganizationRoles.ADMIN)
        const memberRole = organizationRoles.filter((role: IOrganizationSimple) => role.name === OrganizationRoles.MEMBER)

        const [userCreatedFoundDB] = await (trx || knexDatabase.knex)('users_organizations').where('user_id', signUpCreated.id).select();
        const [otherUserCreatedFoundDB] = await (trx || knexDatabase.knex)('users_organizations').whereNot('user_id', signUpCreated.id).select();

        expect(userOrganizationRoles).toHaveLength(2);
        expect(userOrganizationRoles).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    user_id: userToken.id,
                    organization_role_id: adminRole[0].id,
                    users_organization_id: userCreatedFoundDB.id,
                    updated_at: expect.any(Date),
                    created_at: expect.any(Date)
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    user_id: otherUserCreatedFoundDB.user_id,
                    organization_role_id: memberRole[0].id,
                    users_organization_id: otherUserCreatedFoundDB.id,
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
            password: "B8oneTeste123!"
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

        const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", signUpOtherMemberCreated.id).select('invite_hash');

        const responseInvitePayload = {
            inviteHash: invitedUserToOrganization.invite_hash,
            response: OrganizationInviteStatus.ACCEPT
        }

        const invitedAccept = await service.responseInvite(responseInvitePayload, trx);

        expect(invitedAccept).toBeTruthy();

        const [invitedUserToOrganizationAfter] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", signUpOtherMemberCreated.id).select('*');

        expect(invitedUserToOrganizationAfter).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                user_id: signUpOtherMemberCreated.id,
                organization_id: organizationCreated.id,
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
            password: "B8oneTeste123!"
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

        const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", signUpOtherMemberCreated.id).select('invite_hash');

        const responseInvitePayload = {
            inviteHash: invitedUserToOrganization.invite_hash,
            response: OrganizationInviteStatus.REFUSED
        }

        const invitedRefused = await service.responseInvite(responseInvitePayload, trx);

        expect(invitedRefused).toBeTruthy();

        const [invitedUserToOrganizationAfter] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", signUpOtherMemberCreated.id).select('*');

        expect(invitedUserToOrganizationAfter).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                user_id: signUpOtherMemberCreated.id,
                organization_id: organizationCreated.id,
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

        const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", userFound.id).select('invite_hash');

        const responseInvitePayload = {
            inviteHash: invitedUserToOrganization.invite_hash,
            response: OrganizationInviteStatus.ACCEPT
        }

        const invitedAccept = await service.responseInvite(responseInvitePayload, trx);

        expect(invitedAccept).toBeFalsy();

        const [invitedUserToOrganizationAfter] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", userFound.id).select('*');

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

        const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', signUpCreated.id).select('verification_hash');

        await UserService.verifyEmail(userFromDb.verification_hash, trx);

        const createOrganizationPayload = {
            name: Faker.internet.userName(),
            contactEmail: Faker.internet.email()
        }

        const organizationCreated = await service.createOrganization(createOrganizationPayload, userToken, trx);

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

        let signUpCreated2 = await UserService.signUp(signUpPayload2, trx);
        let signUpCreated3 = await UserService.signUp(signUpPayload3, trx);

        const [userFromDb2] = await (trx || knexDatabase.knex)('users').where('id', signUpCreated2.id).select('verification_hash');

        await UserService.verifyEmail(userFromDb2.verification_hash, trx);

        const [userFromDb3] = await (trx || knexDatabase.knex)('users').where('id', signUpCreated3.id).select('verification_hash');

        await UserService.verifyEmail(userFromDb3.verification_hash, trx);

        const findUsersPayload = {
            name: "user",
            organizationId: organizationCreated.id
        }

        const userFound = await service.findUsersToOrganization(findUsersPayload, userToken, trx);

        expect(userFound).toHaveLength(2);
        expect(userFound).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    user: expect.objectContaining({
                        username: signUpPayload2.username,
                        email: signUpPayload2.email,
                    }),
                    inviteStatus: null,
                    usersOrganizationsId: null
                }),
                expect.objectContaining({
                    user: expect.objectContaining({
                        username: signUpPayload3.username,
                        email: signUpPayload3.email,
                    }),
                    inviteStatus: null,
                    usersOrganizationsId: null
                })
            ])
        )

        const userFoundsOnDB = await (trx || knexDatabase.knexTest)('users').select();

        expect(userFoundsOnDB).toHaveLength(3);
        expect(userFoundsOnDB).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    username: signUpPayload.username,
                    email: signUpPayload.email
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

        const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', signUpCreated.id).select('verification_hash');

        await UserService.verifyEmail(userFromDb.verification_hash, trx);

        const createOrganizationPayload = {
            name: Faker.internet.userName(),
            contactEmail: Faker.internet.email()
        }

        const organizationCreated = await service.createOrganization(createOrganizationPayload, userToken, trx);

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

        let signUpCreated2 = await UserService.signUp(signUpPayload2, trx);
        let signUpCreated3 = await UserService.signUp(signUpPayload3, trx);

        const [userFromDb2] = await (trx || knexDatabase.knex)('users').where('id', signUpCreated2.id).select('verification_hash');

        await UserService.verifyEmail(userFromDb2.verification_hash, trx);

        const [userFromDb3] = await (trx || knexDatabase.knex)('users').where('id', signUpCreated3.id).select('verification_hash');

        await UserService.verifyEmail(userFromDb3.verification_hash, trx);

        const inviteUserToOrganizationPayload = {
            organizationId: organizationCreated.id,
            users: [{
                id: signUpCreated2.id,
                email: signUpCreated2.email
            }]
        }

        await service.inviteUserToOrganization(inviteUserToOrganizationPayload, userToken, trx);

        const findUsersPayload = {
            name: "user",
            organizationId: organizationCreated.id
        }

        const userFound = await service.findUsersToOrganization(findUsersPayload, userToken, trx);

        const [usersOrganizationFound] = await (trx || knexDatabase.knex)('users_organizations')
        .where('user_id', signUpCreated2.id)
        .andWhere("organization_id", organizationCreated.id)
        .select('id')

        expect(userFound).toHaveLength(2);
        expect(userFound).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    user: expect.objectContaining({
                        username: signUpPayload2.username,
                        email: signUpPayload2.email,
                    }),
                    inviteStatus: OrganizationInviteStatus.PENDENT,
                    usersOrganizationsId: usersOrganizationFound.id
                }),
                expect.objectContaining({
                    user: expect.objectContaining({
                        username: signUpPayload3.username,
                        email: signUpPayload3.email,
                    }),
                    inviteStatus: null,
                    usersOrganizationsId: null
                })
            ])
        )

        const userFoundsOnDB = await (trx || knexDatabase.knexTest)('users').select();

        expect(userFoundsOnDB).toHaveLength(3);
        expect(userFoundsOnDB).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    username: signUpPayload.username,
                    email: signUpPayload.email
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

        const organizationCreated = await service.createOrganization(createOrganizationPayload, userToken, trx);

        let signUpOtherMemberPayload = {
            username: Faker.name.firstName(),
            email: Faker.internet.email(),
            password: "B8oneTeste123!"
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

        const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", signUpOtherMemberCreated.id).select('invite_hash', 'id');

        const responseInvitePayload = {
            inviteHash: invitedUserToOrganization.invite_hash,
            response: OrganizationInviteStatus.ACCEPT
        }

        await service.responseInvite(responseInvitePayload, trx);

        const inativeUserInOrganizationPayload = {
            userId: signUpOtherMemberCreated.id,
            organizationId: organizationCreated.id
        }

        const inativedUser = await service.inativeUserInOrganization(inativeUserInOrganizationPayload, userToken, trx);

        expect(inativedUser).toEqual(
            expect.objectContaining({
                id: invitedUserToOrganization.id,
                userId: signUpOtherMemberCreated.id,
                organizationId: organizationCreated.id,
                inviteStatus: OrganizationInviteStatus.ACCEPT,
                inviteHash: null,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date)
            })
        )

        done();
    })

    test("organization admin not should inative other organization admin", async done => {

        const createOrganizationPayload = {
            name: Faker.internet.userName(),
            contactEmail: Faker.internet.email()
        }

        const organizationCreated = await service.createOrganization(createOrganizationPayload, userToken, trx);

        let signUpOtherMemberPayload = {
            username: Faker.name.firstName(),
            email: Faker.internet.email(),
            password: "B8oneTeste123!"
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

        const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", signUpOtherMemberCreated.id).select('invite_hash', 'id');

        const responseInvitePayload = {
            inviteHash: invitedUserToOrganization.invite_hash,
            response: OrganizationInviteStatus.ACCEPT
        }

        await service.responseInvite(responseInvitePayload, trx);

        const organizationAdminRole = await service.getOrganizationRoleId(OrganizationRoles.ADMIN, trx);

        await (trx || knexDatabase.knex)('users_organization_roles')
            .update('organization_role_id', organizationAdminRole.id)
            .where('users_organization_id', invitedUserToOrganization.id)

        const inativeUserInOrganizationPayload = {
            userId: signUpCreated.id,
            organizationId: organizationCreated.id
        }

        let otherUserToken = { origin: 'user', id: signUpOtherMemberCreated.id };

        try {
            await service.inativeUserInOrganization(inativeUserInOrganizationPayload, otherUserToken, trx);
        } catch (e) {
            expect(e.message).toBe('Not possible inative other admins');
        }

        done();
    })

    test("founder should inative admin from organization", async done => {

        const createOrganizationPayload = {
            name: Faker.internet.userName(),
            contactEmail: Faker.internet.email()
        }

        const organizationCreated = await service.createOrganization(createOrganizationPayload, userToken, trx);

        let signUpOtherMemberPayload = {
            username: Faker.name.firstName(),
            email: Faker.internet.email(),
            password: "B8oneTeste123!"
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

        const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", signUpOtherMemberCreated.id).select('invite_hash', 'id');

        const responseInvitePayload = {
            inviteHash: invitedUserToOrganization.invite_hash,
            response: OrganizationInviteStatus.ACCEPT
        }

        const organizationAdminRole = await service.getOrganizationRoleId(OrganizationRoles.ADMIN, trx);

        await (trx || knexDatabase.knex)('users_organization_roles')
            .update('organization_role_id', organizationAdminRole.id)
            .where('users_organization_id', invitedUserToOrganization.id)

        await service.responseInvite(responseInvitePayload, trx);

        const inativeUserInOrganizationPayload = {
            userId: signUpOtherMemberCreated.id,
            organizationId: organizationCreated.id
        }

        const inativedUser = await service.inativeUserInOrganization(inativeUserInOrganizationPayload, userToken, trx);

        expect(inativedUser).toEqual(
            expect.objectContaining({
                id: invitedUserToOrganization.id,
                userId: signUpOtherMemberCreated.id,
                organizationId: organizationCreated.id,
                inviteStatus: OrganizationInviteStatus.ACCEPT,
                inviteHash: null,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date)
            })
        );

        const organizationMemberRole = await service.getOrganizationRoleId(OrganizationRoles.MEMBER, trx);

        const [userOrganizationRoleFound] = await (trx || knexDatabase.knex)('users_organization_roles')
        .where('users_organization_id', invitedUserToOrganization.id)
        .select('organization_role_id');

        expect(userOrganizationRoleFound.organization_role_id).toBe(organizationMemberRole.id);

        done();
    })
        
});