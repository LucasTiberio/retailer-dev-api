process.env.NODE_ENV = 'test';
import service from './service';
import UserService from '../users/service';
import OrganizationService from '../organization/service';
import Faker from 'faker';
import database from '../../knex-database';
import { Transaction } from 'knex';
import { ISignUpAdapted } from '../users/types';
import { IUserToken } from '../authentication/types';
import { Services, IServiceAdaptedFromDB, IServiceAdapted, ServiceRoles } from './types';
import { IOrganizationAdapted, OrganizationInviteStatus, IUserOrganizationAdapted } from '../organization/types';
import knexDatabase from '../../knex-database';

describe('Services', () => {

    let trx : Transaction;

    let signUpCreated: ISignUpAdapted;

    
    let signUpPayload = {
        username: Faker.name.firstName(),
        email: Faker.internet.email(),
        password: "B8oneTeste123!"
    }

    const createOrganizationPayload = {
        name: Faker.internet.userName(),
        contactEmail: Faker.internet.email(),
    }
    
    let userToken : IUserToken;
    let organizationCreated: IOrganizationAdapted;
    let serviceFound: IServiceAdaptedFromDB;

    beforeAll(async () => {
        trx = await database.knex.transaction(); 

        const [serviceFoundDB] = await (trx || knexDatabase.knex)('services').where('name', Services.AFFILIATE).select('id');
        serviceFound = serviceFoundDB
    });

    afterAll(async () => {
        await trx.rollback();
        await trx.destroy();
        return new Promise(resolve => {
            resolve();
        }); 
    });

    beforeEach(async () => {
        await trx('users_organization_service_roles').del();
        await trx('users_organization_roles').del();
        await trx('users_organizations').del();
        await trx('organization_services').del();
        await trx('organizations').del();
        await trx('users').del();
        signUpCreated = await UserService.signUp(signUpPayload, trx);
        userToken = { origin: 'user', id: signUpCreated.id };
        organizationCreated = await OrganizationService.createOrganization(createOrganizationPayload, userToken, trx);
        const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', signUpCreated.id).select('verification_hash');
        await UserService.verifyEmail(userFromDb.verification_hash, trx);
    })

    test("user should create new service in organization", async done => {

        const serviceInOrganizationCreated = await service.createServiceInOrganization(serviceFound.id, organizationCreated.id, userToken, trx);

        expect(serviceInOrganizationCreated).toBeTruthy();

        const organizationService = await (trx || database.knex)('organization_services').select();
        
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

    test("organization admin should list services", async done => {

        const servicesFound = await (trx || knexDatabase.knex)('services').select('id', 'name');

        const listServices = await service.listUsedServices(organizationCreated.id ,userToken, trx);

        expect(listServices).toEqual(
            expect.arrayContaining(
                servicesFound.map(service => 
                    expect.objectContaining({
                        id: service.id,
                        name: service.name,
                        active: true,
                        updatedAt: expect.any(Date),
                        createdAt: expect.any(Date)
                    })
                )
            )
        )

        done();
    });

    describe('services with service organization attached', () => {

        let serviceFound : IServiceAdaptedFromDB;

        beforeEach(async () => {
            const [serviceFoundDB] = await (trx || knexDatabase.knex)('services').where('name', Services.AFFILIATE).select('id');
            serviceFound = serviceFoundDB
            await service.createServiceInOrganization(serviceFound.id, organizationCreated.id, userToken, trx);
        })

        test('organization admin should list member available to enjoi in service', async done => {

            let otherSignUpPayload = {
                username: "usuario2",
                email: "usuario2@b8one.com",
                password: "B8oneTeste123!"
            }

            let otherSignUpCreated = await UserService.signUp(otherSignUpPayload, trx);
            const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', otherSignUpCreated.id).select('verification_hash');
            await UserService.verifyEmail(userFromDb.verification_hash, trx);

            const inviteUserToOrganizationPayload = {
                organizationId: organizationCreated.id,
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                }]
            }
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, userToken, trx);

            const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", otherSignUpCreated.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');

            const responseInvitePayload = {
                inviteHash: invitedUserToOrganization.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }
    
            await OrganizationService.responseInvite(responseInvitePayload, trx);

            const listAvailableUsersToServicePayload = {
                organizationId:organizationCreated.id,
                serviceName: Services.AFFILIATE,
                name: "usu"
            }

            const availableUsersToServiceList = await service.listAvailableUsersToService(listAvailableUsersToServicePayload, userToken, trx);

            expect(availableUsersToServiceList).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: invitedUserToOrganization.id,
                        organizationId: organizationCreated.id,
                        userId: otherSignUpCreated.id
                    })
                ])
            )

            done()

        })

        test('organization admin should not list member in service', async done => {

            let otherSignUpPayload = {
                username: "usuario2",
                email: "usuario2@b8one.com",
                password: "B8oneTeste123!"
            }

            let otherSignUpPayload2 = {
                username: "usuario3",
                email: "usuario3@b8one.com",
                password: "B8oneTeste123!"
            }

            let otherSignUpCreated = await UserService.signUp(otherSignUpPayload, trx);
            const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', otherSignUpCreated.id).select('verification_hash');
            await UserService.verifyEmail(userFromDb.verification_hash, trx);

            let otherSignUpCreated2 = await UserService.signUp(otherSignUpPayload2, trx);
            const [userFromDb2] = await (trx || knexDatabase.knex)('users').where('id', otherSignUpCreated2.id).select('verification_hash');
            await UserService.verifyEmail(userFromDb2.verification_hash, trx);

            const inviteUserToOrganizationPayload = {
                organizationId: organizationCreated.id,
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                },{
                    id: otherSignUpCreated2.id,
                    email: otherSignUpCreated2.email
                }]
            };
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, userToken, trx);

            const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", otherSignUpCreated.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');
            const [invitedUserToOrganization2] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", otherSignUpCreated2.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');

            const responseInvitePayload = {
                inviteHash: invitedUserToOrganization.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }
    
            await OrganizationService.responseInvite(responseInvitePayload, trx);

            const responseInvitePayload2 = {
                inviteHash: invitedUserToOrganization2.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }
    
            await OrganizationService.responseInvite(responseInvitePayload2, trx);

            const addUserInOrganizationServicePayload = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            };

            await service.addUserInOrganizationService(addUserInOrganizationServicePayload, userToken, trx);

            const listAvailableUsersToServicePayload = {
                organizationId:organizationCreated.id,
                serviceName: Services.AFFILIATE,
                name: "usu"
            }

            const availableUsersToServiceList = await service.listAvailableUsersToService(listAvailableUsersToServicePayload, userToken, trx);

            expect(availableUsersToServiceList).toHaveLength(1);
            expect(availableUsersToServiceList).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: invitedUserToOrganization2.id,
                        organizationId: organizationCreated.id,
                        userId: otherSignUpCreated2.id
                    })
                ])
            )

            done();
        })

        test('organization admin should added member on service', async done => {

            let otherSignUpPayload = {
                username: Faker.name.firstName(),
                email: Faker.internet.email(),
                password: "B8oneTeste123!"
            }

            let otherSignUpCreated = await UserService.signUp(otherSignUpPayload, trx);
            const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', otherSignUpCreated.id).select('verification_hash');
            await UserService.verifyEmail(userFromDb.verification_hash, trx);

            const inviteUserToOrganizationPayload = {
                organizationId: organizationCreated.id,
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                }]
            }
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, userToken, trx);

            const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", otherSignUpCreated.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');

            const responseInvitePayload = {
                inviteHash: invitedUserToOrganization.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }
    
            await OrganizationService.responseInvite(responseInvitePayload, trx);

            const addUserInOrganizationServicePayload = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            };

            const newMemberOnOrgazationService = await service.addUserInOrganizationService(addUserInOrganizationServicePayload, userToken, trx);

            const [serviceRoles] = await (trx || knexDatabase)('service_roles').where('name', ServiceRoles.ANALYST).select('id');

            expect(newMemberOnOrgazationService).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    serviceRolesId:serviceRoles.id,
                    usersOrganizationId: invitedUserToOrganization.id,
                    serviceId: serviceFound.id,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date),
                })
            )
    
            done();
        })

        test('organization members should list users in service', async done => {

            let otherSignUpPayload = {
                username: Faker.name.firstName(),
                email: Faker.internet.email(),
                password: "B8oneTeste123!"
            }

            let otherSignUpCreated = await UserService.signUp(otherSignUpPayload, trx);
            const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', otherSignUpCreated.id).select('verification_hash');
            await UserService.verifyEmail(userFromDb.verification_hash, trx);

            const inviteUserToOrganizationPayload = {
                organizationId: organizationCreated.id,
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                }]
            }
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, userToken, trx);

            const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", otherSignUpCreated.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');

            const responseInvitePayload = {
                inviteHash: invitedUserToOrganization.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }
    
            await OrganizationService.responseInvite(responseInvitePayload, trx);

            const addUserInOrganizationServicePayload = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            };

            const userInOrganizationServiceAdded = await service.addUserInOrganizationService(addUserInOrganizationServicePayload, userToken, trx);

            const listUsersInOrganizationServicePayload = {
                organizationId:organizationCreated.id,
                serviceName: Services.AFFILIATE 
            }

            const usersInOrganizationService = await service.listUsersInOrganizationService(listUsersInOrganizationServicePayload, userToken, trx);

            const [analystServiceRole] = await (trx || knexDatabase.knex)('service_roles').where('name', ServiceRoles.ANALYST).select('id');

            expect(usersInOrganizationService).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: userInOrganizationServiceAdded.id,
                        serviceRolesId: analystServiceRole.id,
                        usersOrganizationId: invitedUserToOrganization.id,
                        createdAt: expect.any(Date),
                        updatedAt: expect.any(Date)
                    })
                ])
            )

            done();
        })

        test('organization admin should handle user service to responsible role', async done => {

            let otherSignUpPayload = {
                username: Faker.name.firstName(),
                email: Faker.internet.email(),
                password: "B8oneTeste123!"
            }

            let otherSignUpCreated = await UserService.signUp(otherSignUpPayload, trx);
            const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', otherSignUpCreated.id).select('verification_hash');
            await UserService.verifyEmail(userFromDb.verification_hash, trx);

            const inviteUserToOrganizationPayload = {
                organizationId: organizationCreated.id,
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                }]
            }
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, userToken, trx);

            const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", otherSignUpCreated.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');

            const responseInvitePayload = {
                inviteHash: invitedUserToOrganization.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }
    
            await OrganizationService.responseInvite(responseInvitePayload, trx);

            const addUserInOrganizationServicePayload = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            };

            await service.addUserInOrganizationService(addUserInOrganizationServicePayload, userToken, trx);

            const userInServiceHandleRolePayload = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE,
                serviceRole: ServiceRoles.RESPONSIBLE
            };

            const userHandleRoleToResponsible = await service.userInServiceHandleRole(userInServiceHandleRolePayload, userToken, trx);

            expect(userHandleRoleToResponsible)

            const [responsibleServiceRoles] = await (trx || knexDatabase)('service_roles').where('name', ServiceRoles.RESPONSIBLE).select('id');

            expect(userHandleRoleToResponsible).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    serviceRolesId:responsibleServiceRoles.id,
                    usersOrganizationId: invitedUserToOrganization.id,
                    serviceId: serviceFound.id,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date),
                })
            )

            done();
        })

        test('organization admin should handle user service to admin role', async done => {

            let otherSignUpPayload = {
                username: Faker.name.firstName(),
                email: Faker.internet.email(),
                password: "B8oneTeste123!"
            }

            let otherSignUpCreated = await UserService.signUp(otherSignUpPayload, trx);
            const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', otherSignUpCreated.id).select('verification_hash');
            await UserService.verifyEmail(userFromDb.verification_hash, trx);

            const inviteUserToOrganizationPayload = {
                organizationId: organizationCreated.id,
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                }]
            }
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, userToken, trx);

            const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", otherSignUpCreated.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');

            const responseInvitePayload = {
                inviteHash: invitedUserToOrganization.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }
    
            await OrganizationService.responseInvite(responseInvitePayload, trx);

            const addUserInOrganizationServicePayload = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            };

            await service.addUserInOrganizationService(addUserInOrganizationServicePayload, userToken, trx);

            const userInServiceHandleRolePayload = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE,
                serviceRole: ServiceRoles.ADMIN
            };

            const userHandleRoleToResponsible = await service.userInServiceHandleRole(userInServiceHandleRolePayload, userToken, trx);

            const [responsibleServiceRoles] = await (trx || knexDatabase)('service_roles').where('name', ServiceRoles.ADMIN).select('id');

            expect(userHandleRoleToResponsible).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    serviceRolesId:responsibleServiceRoles.id,
                    usersOrganizationId: invitedUserToOrganization.id,
                    serviceId: serviceFound.id,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date),
                })
            )

            done();
        })

        test('service admin should not handle other service admin role', async done => {

            let otherSignUpPayload = {
                username: Faker.name.firstName(),
                email: Faker.internet.email(),
                password: "B8oneTeste123!"
            }

            let otherSignUpCreated = await UserService.signUp(otherSignUpPayload, trx);
            const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', otherSignUpCreated.id).select('verification_hash');
            await UserService.verifyEmail(userFromDb.verification_hash, trx);

            let otherSignUpPayload3 = {
                username: Faker.name.firstName(),
                email: Faker.internet.email(),
                password: "B8oneTeste123!"
            }

            let otherSignUpCreated3 = await UserService.signUp(otherSignUpPayload3, trx);
            const [userFromDb3] = await (trx || knexDatabase.knex)('users').where('id', otherSignUpCreated3.id).select('verification_hash');
            await UserService.verifyEmail(userFromDb3.verification_hash, trx);

            const inviteUserToOrganizationPayload = {
                organizationId: organizationCreated.id,
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                },{
                    id: otherSignUpCreated3.id,
                    email: otherSignUpCreated3.email
                }]
            }
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, userToken, trx);

            const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", otherSignUpCreated.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');
            const [invitedUserToOrganization3] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", otherSignUpCreated3.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');

            const responseInvitePayload = {
                inviteHash: invitedUserToOrganization.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }
    
            await OrganizationService.responseInvite(responseInvitePayload, trx);

            const responseInvitePayload3 = {
                inviteHash: invitedUserToOrganization3.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }
    
            await OrganizationService.responseInvite(responseInvitePayload3, trx);

            const addUserInOrganizationServicePayload = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            };

            await service.addUserInOrganizationService(addUserInOrganizationServicePayload, userToken, trx);

            const addUserInOrganizationServicePayload3 = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated3.id,
                serviceName: Services.AFFILIATE 
            };

            await service.addUserInOrganizationService(addUserInOrganizationServicePayload3, userToken, trx);

            const userInServiceHandleRolePayload = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE,
                serviceRole: ServiceRoles.ADMIN
            };

            await service.userInServiceHandleRole(userInServiceHandleRolePayload, userToken, trx);

            const userInServiceHandleRolePayload3 = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated3.id,
                serviceName: Services.AFFILIATE,
                serviceRole: ServiceRoles.ADMIN
            };

            await service.userInServiceHandleRole(userInServiceHandleRolePayload3, userToken, trx);

            const userInServiceHandleRoleRemoveAdminPayload = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE,
                serviceRole: ServiceRoles.RESPONSIBLE
            };

            try {
                await service.userInServiceHandleRole(userInServiceHandleRoleRemoveAdminPayload, { origin: "user", id: otherSignUpCreated3.id}, trx);
            } catch(e){
                expect(e.message).toBe("Not auth to remove admin roles");
            }

            done();
        })

        test('organization admin should handle service admin role', async done => {

            let otherSignUpPayload = {
                username: Faker.name.firstName(),
                email: Faker.internet.email(),
                password: "B8oneTeste123!"
            }

            let otherSignUpCreated = await UserService.signUp(otherSignUpPayload, trx);
            const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', otherSignUpCreated.id).select('verification_hash');
            await UserService.verifyEmail(userFromDb.verification_hash, trx);

            const inviteUserToOrganizationPayload = {
                organizationId: organizationCreated.id,
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                }]
            }
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, userToken, trx);

            const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", otherSignUpCreated.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');

            const responseInvitePayload = {
                inviteHash: invitedUserToOrganization.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }
    
            await OrganizationService.responseInvite(responseInvitePayload, trx);

            const addUserInOrganizationServicePayload = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            };

            await service.addUserInOrganizationService(addUserInOrganizationServicePayload, userToken, trx);

            const userInServiceHandleRolePayload = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE,
                serviceRole: ServiceRoles.ADMIN
            };

            await service.userInServiceHandleRole(userInServiceHandleRolePayload, userToken, trx);

            const userInServiceHandleRoleRemoveAdminPayload = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE,
                serviceRole: ServiceRoles.ANALYST
            };

            const serviceOrganizationUserRemovedAdmin = await service.userInServiceHandleRole(userInServiceHandleRoleRemoveAdminPayload, userToken, trx);

            const [responsibleServiceRoles] = await (trx || knexDatabase)('service_roles').where('name', ServiceRoles.ANALYST).select('id');

            expect(serviceOrganizationUserRemovedAdmin).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    serviceRolesId:responsibleServiceRoles.id,
                    usersOrganizationId: invitedUserToOrganization.id,
                    serviceId: serviceFound.id,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date),
                })
            )
            
            done();
        })

        test('org admin should inative service members', async done => {

            // create first user
            let otherSignUpPayload = {
                username: Faker.name.firstName(),
                email: Faker.internet.email(),
                password: "B8oneTeste123!"
            }

            let otherSignUpCreated = await UserService.signUp(otherSignUpPayload, trx);
            const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', otherSignUpCreated.id).select('verification_hash');
            await UserService.verifyEmail(userFromDb.verification_hash, trx);

            //invite to org
            const inviteUserToOrganizationPayload = {
                organizationId: organizationCreated.id,
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                }]
            }
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, userToken, trx);

            //response org invites
            const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", otherSignUpCreated.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');

            const responseInvitePayload = {
                inviteHash: invitedUserToOrganization.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }
    
            await OrganizationService.responseInvite(responseInvitePayload, trx);

            //add users in organization service
            const addUserInOrganizationServicePayload = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            };

            await service.addUserInOrganizationService(addUserInOrganizationServicePayload, userToken, trx);

            const inativeUserFromServiceOrganizationPayload = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            }

            const inativedUserFromServiceOrganization = await service.inativeUserFromServiceOrganization(inativeUserFromServiceOrganizationPayload, userToken, trx);

            const [responsibleServiceRoles] = await (trx || knexDatabase)('service_roles').where('name', ServiceRoles.ANALYST).select('id');

            expect(inativedUserFromServiceOrganization).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    serviceRolesId:responsibleServiceRoles.id,
                    usersOrganizationId: invitedUserToOrganization.id,
                    serviceId: serviceFound.id,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date),
                    active: false
                })
            )

            done();
        })

        test('service admin should inative service members analyst/responsible', async done => {

            // create first user
            let otherSignUpPayload = {
                username: Faker.name.firstName(),
                email: Faker.internet.email(),
                password: "B8oneTeste123!"
            }

            let otherSignUpCreated = await UserService.signUp(otherSignUpPayload, trx);
            const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', otherSignUpCreated.id).select('verification_hash');
            await UserService.verifyEmail(userFromDb.verification_hash, trx);

            //create second user
            let otherSignUpPayload3 = {
                username: Faker.name.firstName(),
                email: Faker.internet.email(),
                password: "B8oneTeste123!"
            }

            let otherSignUpCreated3 = await UserService.signUp(otherSignUpPayload3, trx);
            const [userFromDb3] = await (trx || knexDatabase.knex)('users').where('id', otherSignUpCreated3.id).select('verification_hash');
            await UserService.verifyEmail(userFromDb3.verification_hash, trx);

            //invite to org
            const inviteUserToOrganizationPayload = {
                organizationId: organizationCreated.id,
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                },{
                    id: otherSignUpCreated3.id,
                    email: otherSignUpCreated3.email
                }]
            }
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, userToken, trx);

            //response org invites
            const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", otherSignUpCreated.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');
            const [invitedUserToOrganization3] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", otherSignUpCreated3.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');

            const responseInvitePayload = {
                inviteHash: invitedUserToOrganization.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }
    
            await OrganizationService.responseInvite(responseInvitePayload, trx);

            const responseInvitePayload3 = {
                inviteHash: invitedUserToOrganization3.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }
    
            await OrganizationService.responseInvite(responseInvitePayload3, trx);

            //add users in organization service
            const addUserInOrganizationServicePayload = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            };

            await service.addUserInOrganizationService(addUserInOrganizationServicePayload, userToken, trx);

            const addUserInOrganizationServicePayload3 = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated3.id,
                serviceName: Services.AFFILIATE 
            };

            await service.addUserInOrganizationService(addUserInOrganizationServicePayload3, userToken, trx);

            //handle roles in org service
            const userInServiceHandleRolePayload = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE,
                serviceRole: ServiceRoles.ADMIN
            };

            await service.userInServiceHandleRole(userInServiceHandleRolePayload, userToken, trx);

            const inativeUserFromServiceOrganizationPayload = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated3.id,
                serviceName: Services.AFFILIATE 
            }

            const inativedUserFromServiceOrganization = await service.inativeUserFromServiceOrganization(inativeUserFromServiceOrganizationPayload, {origin: "user", id: otherSignUpCreated.id}, trx);

            const [responsibleServiceRoles] = await (trx || knexDatabase)('service_roles').where('name', ServiceRoles.ANALYST).select('id');

            expect(inativedUserFromServiceOrganization).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    serviceRolesId:responsibleServiceRoles.id,
                    usersOrganizationId: invitedUserToOrganization3.id,
                    serviceId: serviceFound.id,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date),
                    active: false
                })
            )

            done();
        })

        test('service admin should not inative other service admins', async done => {

            // create first user
            let otherSignUpPayload = {
                username: Faker.name.firstName(),
                email: Faker.internet.email(),
                password: "B8oneTeste123!"
            }

            let otherSignUpCreated = await UserService.signUp(otherSignUpPayload, trx);
            const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', otherSignUpCreated.id).select('verification_hash');
            await UserService.verifyEmail(userFromDb.verification_hash, trx);

            //create second user
            let otherSignUpPayload3 = {
                username: Faker.name.firstName(),
                email: Faker.internet.email(),
                password: "B8oneTeste123!"
            }

            let otherSignUpCreated3 = await UserService.signUp(otherSignUpPayload3, trx);
            const [userFromDb3] = await (trx || knexDatabase.knex)('users').where('id', otherSignUpCreated3.id).select('verification_hash');
            await UserService.verifyEmail(userFromDb3.verification_hash, trx);

            //invite to org
            const inviteUserToOrganizationPayload = {
                organizationId: organizationCreated.id,
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                },{
                    id: otherSignUpCreated3.id,
                    email: otherSignUpCreated3.email
                }]
            }
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, userToken, trx);

            //response org invites
            const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", otherSignUpCreated.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');
            const [invitedUserToOrganization3] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", otherSignUpCreated3.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');

            const responseInvitePayload = {
                inviteHash: invitedUserToOrganization.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }
    
            await OrganizationService.responseInvite(responseInvitePayload, trx);

            const responseInvitePayload3 = {
                inviteHash: invitedUserToOrganization3.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }
    
            await OrganizationService.responseInvite(responseInvitePayload3, trx);

            //add users in organization service
            const addUserInOrganizationServicePayload = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            };

            await service.addUserInOrganizationService(addUserInOrganizationServicePayload, userToken, trx);

            const addUserInOrganizationServicePayload3 = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated3.id,
                serviceName: Services.AFFILIATE 
            };

            await service.addUserInOrganizationService(addUserInOrganizationServicePayload3, userToken, trx);

            //handle roles in org service
            const userInServiceHandleRolePayload = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE,
                serviceRole: ServiceRoles.ADMIN
            };

            await service.userInServiceHandleRole(userInServiceHandleRolePayload, userToken, trx);

            const userInServiceHandleRolePayload3 = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated3.id,
                serviceName: Services.AFFILIATE,
                serviceRole: ServiceRoles.ADMIN
            };

            await service.userInServiceHandleRole(userInServiceHandleRolePayload, userToken, trx);

            //inative user
            const inativeUserFromServiceOrganizationPayload = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated3.id,
                serviceName: Services.AFFILIATE 
            }

            try {
                await service.inativeUserFromServiceOrganization(inativeUserFromServiceOrganizationPayload, {origin: "user", id: otherSignUpCreated.id}, trx);
            } catch (error) {
                expect(error.message).toBe("Not auth to remove admin roles");
            }

            done();
        })

        test('org admin should inative service members and reinvite this user', async done => {

            // create first user
            let otherSignUpPayload = {
                username: Faker.name.firstName(),
                email: Faker.internet.email(),
                password: "B8oneTeste123!"
            }

            let otherSignUpCreated = await UserService.signUp(otherSignUpPayload, trx);
            const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', otherSignUpCreated.id).select('verification_hash');
            await UserService.verifyEmail(userFromDb.verification_hash, trx);

            //invite to org
            const inviteUserToOrganizationPayload = {
                organizationId: organizationCreated.id,
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                }]
            }
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, userToken, trx);

            //response org invites
            const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", otherSignUpCreated.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');

            const responseInvitePayload = {
                inviteHash: invitedUserToOrganization.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }
    
            await OrganizationService.responseInvite(responseInvitePayload, trx);

            //add users in organization service
            const addUserInOrganizationServicePayload = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            };

            await service.addUserInOrganizationService(addUserInOrganizationServicePayload, userToken, trx);

            const inativeUserFromServiceOrganizationPayload = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            }

            await service.inativeUserFromServiceOrganization(inativeUserFromServiceOrganizationPayload, userToken, trx);

            //reinvite member

            const addUserInOrganizationServiceAgainPayload = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            };

            const MemberOnOrgazationServiceAddedAgain = await service.addUserInOrganizationService(addUserInOrganizationServiceAgainPayload, userToken, trx);

            const [serviceRoles] = await (trx || knexDatabase)('service_roles').where('name', ServiceRoles.ANALYST).select('id');

            expect(MemberOnOrgazationServiceAddedAgain).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    serviceRolesId:serviceRoles.id,
                    usersOrganizationId: invitedUserToOrganization.id,
                    serviceId: serviceFound.id,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date),
                    active: true
                })
            )

            done();
        })

    })

        
});