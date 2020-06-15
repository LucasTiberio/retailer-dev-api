process.env.NODE_ENV = 'test';
import service from './service';
import UserService from '../users/service';
import OrganizationService from '../organization/service';
import VtexService from '../vtex/service';
import Faker from 'faker';
import database from '../../knex-database';
import { Transaction } from 'knex';
import { ISignUpAdapted } from '../users/types';
import { IUserToken } from '../authentication/types';
import { Services, IServiceAdaptedFromDB, ServiceRoles } from './types';
import { IOrganizationAdapted, OrganizationInviteStatus, OrganizationRoles } from '../organization/types';
import knexDatabase from '../../knex-database';
import { IContext } from '../../common/types';
import { MESSAGE_ERROR_CANNOT_ADD_ADMIN_TO_SERVICES } from '../../common/consts';
import redisClient from '../../lib/Redis';

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
    let context: IContext;

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
        await trx('affiliate_vtex_campaign').del();
        await trx('organization_vtex_secrets').del();
        await trx('users_organization_service_roles').del();
        await trx('users_organization_roles').del();
        await trx('users_organizations').del();
        await trx('organization_services').del();
        await trx('organizations').del();
        await trx('users').del();
        signUpCreated = await UserService.signUp(signUpPayload, trx);
        userToken = { origin: 'user', id: signUpCreated.id };
        organizationCreated = await OrganizationService.createOrganization(createOrganizationPayload, {client: userToken, redisClient}, trx);
        const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', signUpCreated.id).select('verification_hash');
        await UserService.verifyEmail(userFromDb.verification_hash, trx);
        context = {client: userToken, organizationId: organizationCreated.id};
    })

    test("organization admin should list services", async done => {

        const servicesFound = await (trx || knexDatabase.knex)('services').select('id', 'name');


        const listServices = await service.listUsedServices(context, trx);

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
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                }]
            }
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

            const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", otherSignUpCreated.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');

            const responseInvitePayload = {
                inviteHash: invitedUserToOrganization.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }
    
            await OrganizationService.responseInvite(responseInvitePayload, trx);

            const listAvailableUsersToServicePayload = {
                serviceName: Services.AFFILIATE,
                name: "usu"
            }

            const availableUsersToServiceList = await service.listAvailableUsersToService(listAvailableUsersToServicePayload, context, trx);

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

        test('organization admin should added member on service', async done => {   

            let otherSignUpPayload = {
                username: Faker.name.firstName(),
                email: Faker.internet.email(),
                password: "B8oneTeste123!"
            }

            let otherSignUpCreated = await UserService.signUp(otherSignUpPayload, trx);
            const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', otherSignUpCreated.id).select('verification_hash');
            await UserService.verifyEmail(userFromDb.verification_hash, trx);

            const vtexSecrets = {
                xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
                xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
                accountName: "beightoneagency"
            }
    
            await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

            const inviteUserToOrganizationPayload = {
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                }]
            }
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

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

            const newMemberOnOrgazationService = await service.addUserInOrganizationService(addUserInOrganizationServicePayload, context, trx);   

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

        test('organization admin should not added other admin on service', async done => {   

            let otherSignUpPayload = {
                username: Faker.name.firstName(),
                email: Faker.internet.email(),
                password: "B8oneTeste123!"
            }

            let otherSignUpCreated = await UserService.signUp(otherSignUpPayload, trx);
            const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', otherSignUpCreated.id).select('verification_hash');
            await UserService.verifyEmail(userFromDb.verification_hash, trx);

            const vtexSecrets = {
                xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
                xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
                accountName: "beightoneagency"
            }
    
            await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

            const inviteUserToOrganizationPayload = {
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                }]
            }
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

            const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", otherSignUpCreated.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');

            const responseInvitePayload = {
                inviteHash: invitedUserToOrganization.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }
    
            await OrganizationService.responseInvite(responseInvitePayload, trx);

            const handleUserPermissionInOrganizationPayload = {
                userId: otherSignUpCreated.id,
                permission: OrganizationRoles.ADMIN
            };
    
            const userPermissionChanged = await OrganizationService.handleUserPermissionInOrganization(handleUserPermissionInOrganizationPayload, context, trx);

            const addUserInOrganizationServicePayload = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            };

            try{
                await service.addUserInOrganizationService(addUserInOrganizationServicePayload, context, trx);   
            } catch(e){
                expect(e.message).toBe(MESSAGE_ERROR_CANNOT_ADD_ADMIN_TO_SERVICES)
                done();
            }
    
        })

        test('organization admin should not added member on service withou vtex key', async done => {   

            let otherSignUpPayload = {
                username: Faker.name.firstName(),
                email: Faker.internet.email(),
                password: "B8oneTeste123!"
            }

            let otherSignUpCreated = await UserService.signUp(otherSignUpPayload, trx);
            const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', otherSignUpCreated.id).select('verification_hash');
            await UserService.verifyEmail(userFromDb.verification_hash, trx);

            const inviteUserToOrganizationPayload = {
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                }]
            }
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

            const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", otherSignUpCreated.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');

            const responseInvitePayload = {
                inviteHash: invitedUserToOrganization.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }
    
            await OrganizationService.responseInvite(responseInvitePayload, trx);

            const addUserInOrganizationServicePayload = {
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            };

            try {
                await service.addUserInOrganizationService(addUserInOrganizationServicePayload, context, trx);   
            } catch (error) {
                expect(error.message).toBe("Vtex Integration not implemented")
            }
    
            done();
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

            const vtexSecrets = {
                xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
                xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
                accountName: "beightoneagency",
                organizationId: organizationCreated.id
            }
    
            await VtexService.verifyAndAttachVtexSecrets(vtexSecrets, context, trx);

            const inviteUserToOrganizationPayload = {
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                },{
                    id: otherSignUpCreated2.id,
                    email: otherSignUpCreated2.email
                }]
            };
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

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
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            };

            await service.addUserInOrganizationService(addUserInOrganizationServicePayload, context, trx);

            const listAvailableUsersToServicePayload = {
                serviceName: Services.AFFILIATE,
                name: "usu"
            }

            const availableUsersToServiceList = await service.listAvailableUsersToService(listAvailableUsersToServicePayload, context, trx);

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

        test('organization members should list users in service', async done => {

            let otherSignUpPayload = {
                username: Faker.name.firstName(),
                email: Faker.internet.email(),
                password: "B8oneTeste123!"
            }

            let otherSignUpCreated = await UserService.signUp(otherSignUpPayload, trx);
            const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', otherSignUpCreated.id).select('verification_hash');
            await UserService.verifyEmail(userFromDb.verification_hash, trx);

            const vtexSecrets = {
                xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
                xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
                accountName: "beightoneagency"
            }
    
            await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

            const inviteUserToOrganizationPayload = {
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                }]
            }
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

            const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", otherSignUpCreated.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');

            const responseInvitePayload = {
                inviteHash: invitedUserToOrganization.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }
    
            await OrganizationService.responseInvite(responseInvitePayload, trx);

            const addUserInOrganizationServicePayload = {
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            };

            const userInOrganizationServiceAdded = await service.addUserInOrganizationService(addUserInOrganizationServicePayload, context, trx);

            const listUsersInOrganizationServicePayload = {
                serviceName: Services.AFFILIATE 
            }

            const usersInOrganizationService = await service.listUsersInOrganizationService(listUsersInOrganizationServicePayload, context, trx);

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

        test('organization members should list users in service', async done => {

            let otherSignUpPayload = {
                username: Faker.name.firstName(),
                email: Faker.internet.email(),
                password: "B8oneTeste123!"
            }

            let otherSignUpCreated = await UserService.signUp(otherSignUpPayload, trx);
            const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', otherSignUpCreated.id).select('verification_hash');
            await UserService.verifyEmail(userFromDb.verification_hash, trx);

            const vtexSecrets = {
                xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
                xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
                accountName: "beightoneagency"
            }
    
            await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

            const inviteUserToOrganizationPayload = {
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                }]
            }
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

            const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", otherSignUpCreated.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');

            const responseInvitePayload = {
                inviteHash: invitedUserToOrganization.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }
    
            await OrganizationService.responseInvite(responseInvitePayload, trx);

            const addUserInOrganizationServicePayload = {
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            };

            const userInOrganizationServiceAdded = await service.addUserInOrganizationService(addUserInOrganizationServicePayload, context, trx);

            const listUserInOrganizationServicePayload = {
                userOrganizationId: invitedUserToOrganization.id 
            }

            const usersInOrganizationService = await service.getUserInOrganizationService(listUserInOrganizationServicePayload, {client: userToken}, trx);

            const [analystServiceRole] = await (trx || knexDatabase.knex)('service_roles').where('name', ServiceRoles.ANALYST).select('id');

            expect(usersInOrganizationService).toEqual(
                expect.objectContaining({
                    id: userInOrganizationServiceAdded.id,
                    serviceRolesId: analystServiceRole.id,
                    usersOrganizationId: invitedUserToOrganization.id,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date)
                })
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

            const vtexSecrets = {
                xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
                xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
                accountName: "beightoneagency"
            }
    
            await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

            const inviteUserToOrganizationPayload = {
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                }]
            }
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

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

            await service.addUserInOrganizationService(addUserInOrganizationServicePayload, context, trx);

            const userInServiceHandleRolePayload = {
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE,
                serviceRole: ServiceRoles.RESPONSIBLE
            };

            const userHandleRoleToResponsible = await service.userInServiceHandleRole(userInServiceHandleRolePayload, context, trx);

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

        test('organization admin should handle user service to sale role', async done => {

            let otherSignUpPayload = {
                username: Faker.name.firstName(),
                email: Faker.internet.email(),
                password: "B8oneTeste123!"
            }

            let otherSignUpCreated = await UserService.signUp(otherSignUpPayload, trx);
            const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', otherSignUpCreated.id).select('verification_hash');
            await UserService.verifyEmail(userFromDb.verification_hash, trx);

            const vtexSecrets = {
                xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
                xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
                accountName: "beightoneagency"
            }
    
            await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

            const inviteUserToOrganizationPayload = {
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                }]
            }
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

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

            await service.addUserInOrganizationService(addUserInOrganizationServicePayload, context, trx);

            const userInServiceHandleRolePayload = {
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE,
                serviceRole: ServiceRoles.SALE
            };

            const userHandleRoleToResponsible = await service.userInServiceHandleRole(userInServiceHandleRolePayload, context, trx);

            const [responsibleServiceRoles] = await (trx || knexDatabase)('service_roles').where('name', ServiceRoles.SALE).select('id');

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

            const vtexSecrets = {
                xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
                xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
                accountName: "beightoneagency"
            }
    
            await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

            const inviteUserToOrganizationPayload = {
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                }]
            }
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

            const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", otherSignUpCreated.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');

            const responseInvitePayload = {
                inviteHash: invitedUserToOrganization.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }
    
            await OrganizationService.responseInvite(responseInvitePayload, trx);

            const addUserInOrganizationServicePayload = {
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            };

            await service.addUserInOrganizationService(addUserInOrganizationServicePayload, context, trx);

            const userInServiceHandleRolePayload = {
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE,
                serviceRole: ServiceRoles.ADMIN
            };

            const userHandleRoleToResponsible = await service.userInServiceHandleRole(userInServiceHandleRolePayload, context, trx);

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

            const vtexSecrets = {
                xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
                xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
                accountName: "beightoneagency"
            }
    
            await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

            const inviteUserToOrganizationPayload = {
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                },{
                    id: otherSignUpCreated3.id,
                    email: otherSignUpCreated3.email
                }]
            }
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

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
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            };

            await service.addUserInOrganizationService(addUserInOrganizationServicePayload, context, trx);

            const addUserInOrganizationServicePayload3 = {
                userId: otherSignUpCreated3.id,
                serviceName: Services.AFFILIATE 
            };

            await service.addUserInOrganizationService(addUserInOrganizationServicePayload3, context, trx);

            const userInServiceHandleRolePayload = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE,
                serviceRole: ServiceRoles.ADMIN
            };

            await service.userInServiceHandleRole(userInServiceHandleRolePayload, context, trx);

            const userInServiceHandleRolePayload3 = {
                userId: otherSignUpCreated3.id,
                serviceName: Services.AFFILIATE,
                serviceRole: ServiceRoles.ADMIN
            };

            await service.userInServiceHandleRole(userInServiceHandleRolePayload3, context, trx);

            const userInServiceHandleRoleRemoveAdminPayload = {
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE,
                serviceRole: ServiceRoles.RESPONSIBLE
            };
            try {
                const otherUserToken = { origin: "user", id: otherSignUpCreated3.id};
                const otherContext = {client: otherUserToken, organizationId: organizationCreated.id};
                await service.userInServiceHandleRole(userInServiceHandleRoleRemoveAdminPayload, otherContext, trx);
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

            const vtexSecrets = {
                xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
                xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
                accountName: "beightoneagency"
            }
    
            await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

            const inviteUserToOrganizationPayload = {
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                }]
            }
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

            const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", otherSignUpCreated.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');

            const responseInvitePayload = {
                inviteHash: invitedUserToOrganization.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }
    
            await OrganizationService.responseInvite(responseInvitePayload, trx);

            const addUserInOrganizationServicePayload = {
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            };

            await service.addUserInOrganizationService(addUserInOrganizationServicePayload, context, trx);

            const userInServiceHandleRolePayload = {
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE,
                serviceRole: ServiceRoles.ADMIN
            };

            await service.userInServiceHandleRole(userInServiceHandleRolePayload, context, trx);

            const userInServiceHandleRoleRemoveAdminPayload = {
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE,
                serviceRole: ServiceRoles.ANALYST
            };

            const serviceOrganizationUserRemovedAdmin = await service.userInServiceHandleRole(userInServiceHandleRoleRemoveAdminPayload, context, trx);

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
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                }]
            }
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

            //response org invites
            const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", otherSignUpCreated.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');

            const responseInvitePayload = {
                inviteHash: invitedUserToOrganization.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }
    
            await OrganizationService.responseInvite(responseInvitePayload, trx);

            const vtexSecrets = {
                xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
                xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
                accountName: "beightoneagency"
            }
    
            await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

            //add users in organization service
            const addUserInOrganizationServicePayload = {
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            };

            await service.addUserInOrganizationService(addUserInOrganizationServicePayload, context, trx);

            const inativeUserFromServiceOrganizationPayload = {
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            }

            const inativedUserFromServiceOrganization = await service.inativeUserFromServiceOrganization(inativeUserFromServiceOrganizationPayload, context, trx);

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
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                },{
                    id: otherSignUpCreated3.id,
                    email: otherSignUpCreated3.email
                }]
            }
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

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

            const vtexSecrets = {
                xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
                xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
                accountName: "beightoneagency"
            }
    
            await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

            //add users in organization service
            const addUserInOrganizationServicePayload = {
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            };

            await service.addUserInOrganizationService(addUserInOrganizationServicePayload, context, trx);

            const addUserInOrganizationServicePayload3 = {
                userId: otherSignUpCreated3.id,
                serviceName: Services.AFFILIATE 
            };

            await service.addUserInOrganizationService(addUserInOrganizationServicePayload3, context, trx);

            //handle roles in org service
            const userInServiceHandleRolePayload = {
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE,
                serviceRole: ServiceRoles.ADMIN
            };

            await service.userInServiceHandleRole(userInServiceHandleRolePayload, context, trx);

            const inativeUserFromServiceOrganizationPayload = {
                userId: otherSignUpCreated3.id,
                serviceName: Services.AFFILIATE 
            }

            const otherUserToken = {origin: "user", id: otherSignUpCreated.id};
            const otherContext = {client: otherUserToken, organizationId: organizationCreated.id};

            const inativedUserFromServiceOrganization = await service.inativeUserFromServiceOrganization(inativeUserFromServiceOrganizationPayload, otherContext, trx);

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
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                },{
                    id: otherSignUpCreated3.id,
                    email: otherSignUpCreated3.email
                }]
            }
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

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

            const vtexSecrets = {
                xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
                xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
                accountName: "beightoneagency"
            }
    
            await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

            //add users in organization service
            const addUserInOrganizationServicePayload = {
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            };

            await service.addUserInOrganizationService(addUserInOrganizationServicePayload, context, trx);

            const addUserInOrganizationServicePayload3 = {
                userId: otherSignUpCreated3.id,
                serviceName: Services.AFFILIATE 
            };

            await service.addUserInOrganizationService(addUserInOrganizationServicePayload3, context, trx);

            //handle roles in org service
            const userInServiceHandleRolePayload = {
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE,
                serviceRole: ServiceRoles.ADMIN
            };

            await service.userInServiceHandleRole(userInServiceHandleRolePayload, context, trx);

            const userInServiceHandleRolePayload3 = {
                userId: otherSignUpCreated3.id,
                serviceName: Services.AFFILIATE,
                serviceRole: ServiceRoles.ADMIN
            };

            await service.userInServiceHandleRole(userInServiceHandleRolePayload3, context, trx);

            //inative user
            const inativeUserFromServiceOrganizationPayload = {
                organizationId:organizationCreated.id,
                userId: otherSignUpCreated3.id,
                serviceName: Services.AFFILIATE 
            }

            try {
                const otherUserToken = {origin: "user", id: otherSignUpCreated.id};
                const otherContext = {client: otherUserToken, organizationId: organizationCreated.id};
                await service.inativeUserFromServiceOrganization(inativeUserFromServiceOrganizationPayload, otherContext, trx);
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
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                }]
            }
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

            //response org invites
            const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", otherSignUpCreated.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');

            const responseInvitePayload = {
                inviteHash: invitedUserToOrganization.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }
    
            await OrganizationService.responseInvite(responseInvitePayload, trx);

            const vtexSecrets = {
                xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
                xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
                accountName: "beightoneagency"
            }
    
            await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

            //add users in organization service
            const addUserInOrganizationServicePayload = {
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            };

            await service.addUserInOrganizationService(addUserInOrganizationServicePayload, context, trx);

            const inativeUserFromServiceOrganizationPayload = {
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            }

            await service.inativeUserFromServiceOrganization(inativeUserFromServiceOrganizationPayload, context, trx);

            //reinvite member

            const addUserInOrganizationServiceAgainPayload = {
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            };

            const MemberOnOrgazationServiceAddedAgain = await service.addUserInOrganizationService(addUserInOrganizationServiceAgainPayload, context, trx);

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

        test('getUserOrganizationServiceByServiceName - organization member should get your data', async done => {

            let otherSignUpPayload = {
                username: Faker.name.firstName(),
                email: Faker.internet.email(),
                password: "B8oneTeste123!"
            }

            let otherSignUpCreated = await UserService.signUp(otherSignUpPayload, trx);
            const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', otherSignUpCreated.id).select('verification_hash');
            await UserService.verifyEmail(userFromDb.verification_hash, trx);

            const vtexSecrets = {
                xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
                xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
                accountName: "beightoneagency"
            }
    
            await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

            const inviteUserToOrganizationPayload = {
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                }]
            }
    
            await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

            const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", otherSignUpCreated.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');

            const responseInvitePayload = {
                inviteHash: invitedUserToOrganization.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }
    
            await OrganizationService.responseInvite(responseInvitePayload, trx);

            const addUserInOrganizationServicePayload = {
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE 
            };

            const userInOrganizationServiceAdded = await service.addUserInOrganizationService(addUserInOrganizationServicePayload, context, trx);

            let getUserOrganizationServiceByServiceNamePayload = {
                serviceName: Services.AFFILIATE 
            }

            let affiliateUserToken = { origin: 'user', id: otherSignUpCreated.id };

            let affiliateContext = {client: affiliateUserToken, organizationId: organizationCreated.id, userServiceOrganizationRolesId: userInOrganizationServiceAdded.id};

            const usersInOrganizationService = await service.getUserOrganizationServiceByServiceName(getUserOrganizationServiceByServiceNamePayload, affiliateContext, trx);

            const [analystServiceRole] = await (trx || knexDatabase.knex)('service_roles').where('name', ServiceRoles.ANALYST).select('id');

            expect(usersInOrganizationService).toEqual(
                expect.objectContaining({
                    id: userInOrganizationServiceAdded.id,
                    serviceRolesId: analystServiceRole.id,
                    usersOrganizationId: invitedUserToOrganization.id,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date),
                    active: true,
                    bankDataId: null
                })
            )

            done();
        })

    })

        
});