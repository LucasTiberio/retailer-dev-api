process.env.NODE_ENV = 'test';
import service from './service';

import UserService from '../users/service';
import VtexService from '../vtex/service';
import Faker from 'faker';
import { ISignUpAdapted } from '../users/types';
import { IUserToken } from '../authentication/types';
import { OrganizationRoles, OrganizationInviteStatus, IOrganizationSimple, IOrganizationPayload } from './types';
import { Transaction } from 'knex';
import knexDatabase from '../../knex-database';
var imgGen = require('js-image-generator');
import redisClient from '../../lib/Redis';
import { MESSAGE_ERROR_USER_NOT_IN_ORGANIZATION, MESSAGE_ERROR_USER_USED_FREE_TRIAL_TIME } from '../../common/consts';
import { IContext } from '../../common/types';
import { Services, ServiceRoles } from '../services/types';

describe('Organizations', () => {

    let createOrganizationPayload: IOrganizationPayload

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
        redisClient.end();
        return new Promise(resolve => {
            resolve();
        }); 
    });

    beforeEach(async () => {
        await trx('organization_vtex_secrets').del();
        await trx('users_organization_service_roles').del();
        await trx('organization_services').del();
        await trx('users_organization_roles').del();
        await trx('users_organizations').del();
        await trx('organizations').del();
        await trx('organization_additional_infos').del();
        await trx('users').del();
        createOrganizationPayload = {
            organization: {
              name: "Gabsss5",
              contactEmail: "gabriel-tamura@b8one.com",
              phone: "551123213123123"
            },
            additionalInfos: {
                segment: "Beleza e Cosméticos",
                resellersEstimate: 500,
                reason: "Ter mais uma opção de canal de vendas",
                plataform: "vtex"
            }
        }
        await redisClient.flushall('ASYNC');
        signUpCreated = await UserService.signUp(signUpPayload, trx);
        userToken = { origin: 'user', id: signUpCreated.id };
    })

    // test("user only create 1 free trial organization", async done => {

    //     await service.createOrganization(createOrganizationPayload, {client: userToken, redisClient}, trx);

    //     let otherCreateOrganizationPayload = {
    //         organization: {
    //           name: "Gabsss6",
    //           contactEmail: "gabriel-tamura@b8one.com",
    //           phone: "551123213123123"
    //         },
    //         additionalInfos: {
    //             segment: "Beleza e Cosméticos",
    //             resellersEstimate: 500,
    //             reason: "Ter mais uma opção de canal de vendas",
    //             plataform: "vtex"
    //         }
    //     }

    //     try{
    //         await service.createOrganization(otherCreateOrganizationPayload, {client: userToken, redisClient}, trx);

    //     }catch(e){
    //         expect(e.message).toBe(MESSAGE_ERROR_USER_USED_FREE_TRIAL_TIME)
    //         done();
    //     }


    // })

    test("user should send a current organization to redis", async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload, {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        const currentOrganizationAdded = await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        expect(currentOrganizationAdded).toBeTruthy();
        redisClient.get(userToken.id, (_, data) => {
            expect(data).toBe(organizationCreated.id)
            redisClient.keys('*', function (_, keys) {
                expect(keys).toHaveLength(1);
                done();  
              }); 
        });

    })

    test("user should send a current organization null and delete to redis", async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload, {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        const currentOrganizationNullablePayload = {
            organizationId: null
        }

        const currentOrganizationRemoved = await service.setCurrentOrganization(currentOrganizationNullablePayload, {client: userToken, redisClient}, trx);

        expect(currentOrganizationRemoved).toBeTruthy();
        redisClient.get(userToken.id, (_, data) => {
            expect(data).toBeNull();
            redisClient.keys('*', function (_, keys) {
                expect(keys).toHaveLength(0);
                done();  
              }); 
        });

    })

    test("users should send a current organization to redis", async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload, {client: userToken, redisClient}, trx);
        
        let context : IContext = {client: userToken, organizationId: organizationCreated.id};

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        let otherSignUpPayload = {
            username: Faker.name.firstName(),
            email: Faker.internet.email(),
            password: "B8oneTeste123!"
        }

        const otherSignUpCreated = await UserService.signUp(otherSignUpPayload, trx);

        const currentOrganizationAdded = await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        const inviteUserToOrganizationPayload = {
            users: [{
                email: otherSignUpCreated.email
            }]
        }

        await service.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

        const otherCurrentOrganizationAdded = await service.setCurrentOrganization(currentOrganizationPayload, { client : { origin: "user", id: otherSignUpCreated.id}, redisClient }, trx);

        expect(currentOrganizationAdded).toBeTruthy();
        expect(otherCurrentOrganizationAdded).toBeTruthy();
        redisClient.mget([userToken.id, otherSignUpCreated.id], (_, values) => {
            values.map(item => {
                expect(item).toBe(organizationCreated.id)
            })
            redisClient.keys('*', function (_, keys) {
                expect(keys).toHaveLength(2);
                done();  
              }); 
        });

    })

    test("users without organization not should send a current organization to redis", async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload, {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        let otherSignUpPayload = {
            username: Faker.name.firstName(),
            email: Faker.internet.email(),
            password: "B8oneTeste123!"
        }

        const otherSignUpCreated = await UserService.signUp(otherSignUpPayload, trx);

        try {
            await service.setCurrentOrganization(currentOrganizationPayload, { client : { origin: "user", id: otherSignUpCreated.id}, redisClient }, trx);
        } catch(e){
            expect(e.message).toBe(MESSAGE_ERROR_USER_NOT_IN_ORGANIZATION);
            done();
        }

    })

    test("user should create new organization and grant admin role", async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload, {client: userToken, redisClient}, trx);

        expect(organizationCreated).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                name: createOrganizationPayload.organization.name,
                contactEmail: createOrganizationPayload.organization.contactEmail,
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
                name: createOrganizationPayload.organization.name,
                free_trial: true,
                free_trial_expires: expect.any(Date),
                contact_email: createOrganizationPayload.organization.contactEmail,
                phone: createOrganizationPayload.organization.phone,
                user_id: userToken.id,
                active: true,
                updated_at: expect.any(Date),
                created_at: expect.any(Date),
                organization_additional_infos_id: expect.any(String)
            })
        )

        const [organizationAdditionalInfosOnDb] = await (trx || knexDatabase.knex)('organization_additional_infos').select();

        expect(organizationAdditionalInfosOnDb).toEqual(
            expect.objectContaining({
                segment: createOrganizationPayload.additionalInfos.segment,
                resellers_estimate: createOrganizationPayload.additionalInfos.resellersEstimate,
                reason: createOrganizationPayload.additionalInfos.reason,
                plataform: createOrganizationPayload.additionalInfos.plataform
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

        await service.createOrganization(createOrganizationPayload, {client: userToken, redisClient}, trx);

        const verifiedOrganizationName = await service.verifyOrganizationName(createOrganizationPayload.organization.name, trx);

        expect(verifiedOrganizationName).toBeTruthy();

        done();

    })

    test("user should list your organizations", async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload, {client: userToken, redisClient}, trx);

        const organizations = await service.listMyOrganizations(userToken, trx);

        expect(organizations).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: organizationCreated.id,
                    name: createOrganizationPayload.organization.name,
                    contactEmail: createOrganizationPayload.organization.contactEmail,
                    userId: userToken.id,
                    active: true,
                    updatedAt: expect.any(Date),
                    createdAt: expect.any(Date)
                })
            ])
        )

        done();

    })

    test("user should list your organization details", async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload, {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        let context = {client: userToken, organizationId: organizationCreated.id};

        const organizations = await service.organizationDetails(context, trx);

        expect(organizations).toEqual(
                expect.objectContaining({
                    id: organizationCreated.id,
                    name: createOrganizationPayload.organization.name,
                    contactEmail: createOrganizationPayload.organization.contactEmail,
                    userId: userToken.id,
                    active: true,
                    updatedAt: expect.any(Date),
                    createdAt: expect.any(Date)
                })
        )

        done();

    })

    test('user organization admin should invite existent members', async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload, {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        let context = {client: userToken, organizationId: organizationCreated.id};

        let signUpOtherMemberPayload = {
            username: Faker.name.firstName(),
            email: Faker.internet.email(),
            password: "B8oneTeste123!"
        };

        const signUpOtherMemberCreated = await UserService.signUp(signUpOtherMemberPayload, trx);

        const vtexSecrets = {
            xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
            xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
            accountName: "beightoneagency"
        }

        await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

        const inviteUserToOrganizationPayload = {
            users: [{
                email: signUpOtherMemberCreated.email,
                services: [{
                    name: Services.AFFILIATE,
                    role: ServiceRoles.ANALYST
                }]
            }]
        }

        const invitedUserToOrganization = await service.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

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
                    organization_role_id: adminRole[0].id,
                    users_organization_id: userOrganizationsFounder.id,
                    updated_at: expect.any(Date),
                    created_at: expect.any(Date)
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    organization_role_id: memberRole[0].id,
                    users_organization_id: userOtherUserOrganizations.id,
                    updated_at: expect.any(Date),
                    created_at: expect.any(Date)
                })
            ]),
        )

        const userOrganizationServiceRoles = await (trx || knexDatabase.knex)('users_organization_service_roles').select();

        const [serviceAnalystRole] = await (trx || knexDatabase.knex)('service_roles').where('name', ServiceRoles.ANALYST).select('id');
        const [affiliateService] = await (trx || knexDatabase.knex)('services').where('name', Services.AFFILIATE).select('id');
        const [affiliateOrganizationService] = await (trx || knexDatabase.knex)('organization_services').where('organization_id', organizationCreated.id).andWhere('service_id', affiliateService.id).select('id');

        expect(userOrganizationServiceRoles).toHaveLength(1);
        expect(userOrganizationServiceRoles).toStrictEqual([
            expect.objectContaining({
                id: expect.any(String),
                service_roles_id: serviceAnalystRole.id,
                users_organization_id: userOtherUserOrganizations.id,
                organization_services_id: affiliateOrganizationService.id,
                created_at: expect.any(Date),
                updated_at: expect.any(Date),
                active: true,
                bank_data_id: null
            })
        ])

        done();
    })

    test('user organization admin should invite new members', async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload, {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        let context = {client: userToken, organizationId: organizationCreated.id};

        const vtexSecrets = {
            xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
            xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
            accountName: "beightoneagency"
        }

        await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

        let signUpOtherMemberPayload = {
            email: Faker.internet.email(),
        };

        const inviteUserToOrganizationPayload = {
            users: [{
                email: signUpOtherMemberPayload.email,
                services: [{
                    name: Services.AFFILIATE,
                    role: ServiceRoles.ANALYST
                }]
            }]
        }

        const invitedUserToOrganization = await service.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

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
                    organization_role_id: adminRole[0].id,
                    users_organization_id: userCreatedFoundDB.id,
                    updated_at: expect.any(Date),
                    created_at: expect.any(Date)
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    organization_role_id: memberRole[0].id,
                    users_organization_id: otherUserCreatedFoundDB.id,
                    updated_at: expect.any(Date),
                    created_at: expect.any(Date)
                })
            ]),
        )

        const userOrganizationServiceRoles = await (trx || knexDatabase.knex)('users_organization_service_roles').select();

        const [serviceAnalystRole] = await (trx || knexDatabase.knex)('service_roles').where('name', ServiceRoles.ANALYST).select('id');
        const [affiliateService] = await (trx || knexDatabase.knex)('services').where('name', Services.AFFILIATE).select('id');
        const [affiliateOrganizationService] = await (trx || knexDatabase.knex)('organization_services').where('organization_id', organizationCreated.id).andWhere('service_id', affiliateService.id).select('id');
        const [otherUser] = await (trx || knexDatabase.knex)('users').where('email', signUpOtherMemberPayload.email).select('id');
        const [userOtherUserOrganizations] = await (trx || knexDatabase.knex)('users_organizations').where('user_id', otherUser.id).andWhere('organization_id', organizationCreated.id).select('id');

        expect(userOrganizationServiceRoles).toHaveLength(1);
        expect(userOrganizationServiceRoles).toStrictEqual([
            expect.objectContaining({
                id: expect.any(String),
                service_roles_id: serviceAnalystRole.id,
                users_organization_id: userOtherUserOrganizations.id,
                organization_services_id: affiliateOrganizationService.id,
                created_at: expect.any(Date),
                updated_at: expect.any(Date),
                active: true,
                bank_data_id: null
            })
        ])

        done();
    })

    test('existent user should accept invite', async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload, {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        let context = {client: userToken, organizationId: organizationCreated.id};

        const vtexSecrets = {
            xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
            xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
            accountName: "beightoneagency"
        }

        await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

        let signUpOtherMemberPayload = {
            username: Faker.name.firstName(),
            email: Faker.internet.email(),
            password: "B8oneTeste123!"
        };

        const signUpOtherMemberCreated = await UserService.signUp(signUpOtherMemberPayload, trx);

        const inviteUserToOrganizationPayload = {
            users: [{
                id: signUpOtherMemberCreated.id,
                email: signUpOtherMemberCreated.email,
                services: [{
                    name: Services.AFFILIATE,
                    role: ServiceRoles.ANALYST
                }]
            }]
        }

        await service.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

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

        const userOrganizationServiceRoles = await (trx || knexDatabase.knex)('users_organization_service_roles').select();

        const [serviceAnalystRole] = await (trx || knexDatabase.knex)('service_roles').where('name', ServiceRoles.ANALYST).select('id');
        const [affiliateService] = await (trx || knexDatabase.knex)('services').where('name', Services.AFFILIATE).select('id');
        const [affiliateOrganizationService] = await (trx || knexDatabase.knex)('organization_services').where('organization_id', organizationCreated.id).andWhere('service_id', affiliateService.id).select('id');
        const [otherUser] = await (trx || knexDatabase.knex)('users').where('email', signUpOtherMemberPayload.email).select('id');
        const [userOtherUserOrganizations] = await (trx || knexDatabase.knex)('users_organizations').where('user_id', otherUser.id).andWhere('organization_id', organizationCreated.id).select('id');

        expect(userOrganizationServiceRoles).toHaveLength(1);
        expect(userOrganizationServiceRoles).toStrictEqual([
            expect.objectContaining({
                id: expect.any(String),
                service_roles_id: serviceAnalystRole.id,
                users_organization_id: userOtherUserOrganizations.id,
                organization_services_id: affiliateOrganizationService.id,
                created_at: expect.any(Date),
                updated_at: expect.any(Date),
                active: true,
                bank_data_id: null
            })
        ])

        done();

    })

    test('existent user should refuse invite', async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload, {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        let context = {client: userToken, organizationId: organizationCreated.id};

        const vtexSecrets = {
            xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
            xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
            accountName: "beightoneagency"
        }

        await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

        let signUpOtherMemberPayload = {
            username: Faker.name.firstName(),
            email: Faker.internet.email(),
            password: "B8oneTeste123!"
        };

        const signUpOtherMemberCreated = await UserService.signUp(signUpOtherMemberPayload, trx);

        const inviteUserToOrganizationPayload = {
            users: [{
                id: signUpOtherMemberCreated.id,
                email: signUpOtherMemberCreated.email,
                services: [{
                    name: Services.AFFILIATE,
                    role: ServiceRoles.ANALYST
                }]
            }]
        }

        await service.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

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

        const userOrganizationServiceRoles = await (trx || knexDatabase.knex)('users_organization_service_roles').select();

        const [serviceAnalystRole] = await (trx || knexDatabase.knex)('service_roles').where('name', ServiceRoles.ANALYST).select('id');
        const [affiliateService] = await (trx || knexDatabase.knex)('services').where('name', Services.AFFILIATE).select('id');
        const [affiliateOrganizationService] = await (trx || knexDatabase.knex)('organization_services').where('organization_id', organizationCreated.id).andWhere('service_id', affiliateService.id).select('id');
        const [otherUser] = await (trx || knexDatabase.knex)('users').where('email', signUpOtherMemberPayload.email).select('id');
        const [userOtherUserOrganizations] = await (trx || knexDatabase.knex)('users_organizations').where('user_id', otherUser.id).andWhere('organization_id', organizationCreated.id).select('id');

        expect(userOrganizationServiceRoles).toHaveLength(1);
        expect(userOrganizationServiceRoles).toStrictEqual([
            expect.objectContaining({
                id: expect.any(String),
                service_roles_id: serviceAnalystRole.id,
                users_organization_id: userOtherUserOrganizations.id,
                organization_services_id: affiliateOrganizationService.id,
                created_at: expect.any(Date),
                updated_at: expect.any(Date),
                active: false,
                bank_data_id: null
            })
        ])

        done();

    })

    test('no existent user should accept invite', async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload, {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        let context = {client: userToken, organizationId: organizationCreated.id};

        const vtexSecrets = {
            xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
            xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
            accountName: "beightoneagency"
        }

        await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

        let signUpOtherMemberPayload = {
            email: Faker.internet.email(),
        };

        const inviteUserToOrganizationPayload = {
            users: [{
                email: signUpOtherMemberPayload.email,
                services: [{
                    name: Services.AFFILIATE,
                    role: ServiceRoles.ANALYST
                }]
            }]
        }

        await service.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

        const [userFound] = await (trx || knexDatabase.knex)('users').where('email', signUpOtherMemberPayload.email).select('id')

        const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", userFound.id).select('invite_hash');

        const responseInvitePayload = {
            inviteHash: invitedUserToOrganization.invite_hash,
            response: OrganizationInviteStatus.ACCEPT
        }

        const invitedAccept = await service.responseInvite(responseInvitePayload, trx);

        expect(invitedAccept.status).toBeFalsy();

        const [invitedUserToOrganizationAfter] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", userFound.id).select('*');

        expect(invitedUserToOrganizationAfter).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                user_id: userFound.id,
                organization_id: organizationCreated.id,
                invite_status: OrganizationInviteStatus.ACCEPT,
                updated_at: expect.any(Date),
                created_at: expect.any(Date)
            })
        )

        const userOrganizationServiceRoles = await (trx || knexDatabase.knex)('users_organization_service_roles').select();

        const [serviceAnalystRole] = await (trx || knexDatabase.knex)('service_roles').where('name', ServiceRoles.ANALYST).select('id');
        const [affiliateService] = await (trx || knexDatabase.knex)('services').where('name', Services.AFFILIATE).select('id');
        const [affiliateOrganizationService] = await (trx || knexDatabase.knex)('organization_services').where('organization_id', organizationCreated.id).andWhere('service_id', affiliateService.id).select('id');
        const [otherUser] = await (trx || knexDatabase.knex)('users').where('email', signUpOtherMemberPayload.email).select('id');
        const [userOtherUserOrganizations] = await (trx || knexDatabase.knex)('users_organizations').where('user_id', otherUser.id).andWhere('organization_id', organizationCreated.id).select('id');

        expect(userOrganizationServiceRoles).toHaveLength(1);
        expect(userOrganizationServiceRoles).toStrictEqual([
            expect.objectContaining({
                id: expect.any(String),
                service_roles_id: serviceAnalystRole.id,
                users_organization_id: userOtherUserOrganizations.id,
                organization_services_id: affiliateOrganizationService.id,
                created_at: expect.any(Date),
                updated_at: expect.any(Date),
                active: true,
                bank_data_id: null
            })
        ])

        done();

    })

    test("user should search other members", async done => {

        const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', signUpCreated.id).select('verification_hash');

        await UserService.verifyEmail(userFromDb.verification_hash, trx);

        const organizationCreated = await service.createOrganization(createOrganizationPayload, {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        let context = {client: userToken, organizationId: organizationCreated.id};

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

        const userFound = await service.findUsersToOrganization(findUsersPayload, context, trx);

        expect(userFound).toHaveLength(2);
        expect(userFound).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    user: expect.objectContaining({
                        username: signUpPayload2.username,
                        email: signUpPayload2.email,
                    }),
                    inviteStatus: null,
                }),
                expect.objectContaining({
                    user: expect.objectContaining({
                        username: signUpPayload3.username,
                        email: signUpPayload3.email,
                    }),
                    inviteStatus: null,
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

        const organizationCreated = await service.createOrganization(createOrganizationPayload, {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        let context = {client: userToken, organizationId: organizationCreated.id};

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
            users: [{
                id: signUpCreated2.id,
                email: signUpCreated2.email
            }]
        }

        await service.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

        const findUsersPayload = {
            name: "user",
            organizationId: organizationCreated.id
        }

        const userFound = await service.findUsersToOrganization(findUsersPayload, context, trx);

        expect(userFound).toHaveLength(2);
        expect(userFound).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    user: expect.objectContaining({
                        username: signUpPayload2.username,
                        email: signUpPayload2.email,
                    }),
                    inviteStatus: OrganizationInviteStatus.PENDENT,
                }),
                expect.objectContaining({
                    user: expect.objectContaining({
                        username: signUpPayload3.username,
                        email: signUpPayload3.email,
                    }),
                    inviteStatus: null
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

    test("admin user should inative user member from organization", async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload, {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        let context = {client: userToken, organizationId: organizationCreated.id};

        const vtexSecrets = {
            xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
            xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
            accountName: "beightoneagency"
        }
        
        await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

        let signUpOtherMemberPayload = {
            username: Faker.name.firstName(),
            email: Faker.internet.email(),
            password: "B8oneTeste123!"
        };

        const signUpOtherMemberCreated = await UserService.signUp(signUpOtherMemberPayload, trx);

        const inviteUserToOrganizationPayload = {
            users: [{
                email: signUpOtherMemberCreated.email,
                services: [{
                    name: Services.AFFILIATE,
                    role: ServiceRoles.ANALYST
                }]
            }]
        }

        await service.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

        const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", signUpOtherMemberCreated.id).select('invite_hash', 'id');

        const responseInvitePayload = {
            inviteHash: invitedUserToOrganization.invite_hash,
            response: OrganizationInviteStatus.ACCEPT
        }

        await service.responseInvite(responseInvitePayload, trx);

        const inativeUsersInOrganizationPayload = {
            usersId: [signUpOtherMemberCreated.id],
        }

        const inativedUser = await service.inativeUsersInOrganization(inativeUsersInOrganizationPayload, context, trx);

        expect(inativedUser).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    userOrganization: expect.objectContaining({
                        id: invitedUserToOrganization.id,
                        userId: signUpOtherMemberCreated.id,
                        organizationId: organizationCreated.id,
                        inviteStatus: OrganizationInviteStatus.ACCEPT,
                        inviteHash: null,
                        createdAt: expect.any(Date),
                        updatedAt: expect.any(Date)
                    })
                })
            ])
        )

        const userOrganizationServiceRoles = await (trx || knexDatabase.knex)('users_organization_service_roles').select();

        const [serviceAnalystRole] = await (trx || knexDatabase.knex)('service_roles').where('name', ServiceRoles.ANALYST).select('id');
        const [affiliateService] = await (trx || knexDatabase.knex)('services').where('name', Services.AFFILIATE).select('id');
        const [affiliateOrganizationService] = await (trx || knexDatabase.knex)('organization_services').where('organization_id', organizationCreated.id).andWhere('service_id', affiliateService.id).select('id');
        const [otherUser] = await (trx || knexDatabase.knex)('users').where('email', signUpOtherMemberPayload.email).select('id');
        const [userOtherUserOrganizations] = await (trx || knexDatabase.knex)('users_organizations').where('user_id', otherUser.id).andWhere('organization_id', organizationCreated.id).select('id');

        expect(userOrganizationServiceRoles).toHaveLength(1);
        expect(userOrganizationServiceRoles).toStrictEqual([
            expect.objectContaining({
                id: expect.any(String),
                service_roles_id: serviceAnalystRole.id,
                users_organization_id: userOtherUserOrganizations.id,
                organization_services_id: affiliateOrganizationService.id,
                created_at: expect.any(Date),
                updated_at: expect.any(Date),
                active: false,
                bank_data_id: null
            })
        ])

        done();
    })

    test("organization admin not should inative other organization admin", async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload, {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        let context = {client: userToken, organizationId: organizationCreated.id};

        const vtexSecrets = {
            xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
            xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
            accountName: "beightoneagency"
        }
        
        await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

        let signUpOtherMemberPayload = {
            username: Faker.name.firstName(),
            email: Faker.internet.email(),
            password: "B8oneTeste123!"
        };

        const signUpOtherMemberCreated = await UserService.signUp(signUpOtherMemberPayload, trx);

        const inviteUserToOrganizationPayload = {
            users: [{
                id: signUpOtherMemberCreated.id,
                email: signUpOtherMemberCreated.email,
                services: [{
                    name: Services.AFFILIATE,
                    role: ServiceRoles.ANALYST
                }]
            }]
        }

        await service.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

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

        const inativeUsersInOrganizationPayload = {
            usersId: [signUpCreated.id],
        }

        let otherUserToken = { origin: 'user', id: signUpOtherMemberCreated.id };
        let otherUserContext = {client: otherUserToken, organizationId: organizationCreated.id};

        const inativedUsers = await service.inativeUsersInOrganization(inativeUsersInOrganizationPayload, otherUserContext, trx);

        expect(inativedUsers).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    userError: expect.objectContaining({
                        message: 'Not possible inative other admins',
                        userId: signUpCreated.id
                    })
                })
            ])
        )

        done();
    })

    test("founder should inative admin from organization", async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload, {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        let context = {client: userToken, organizationId: organizationCreated.id};

        const vtexSecrets = {
            xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
            xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
            accountName: "beightoneagency"
        }
        
        await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

        let signUpOtherMemberPayload = {
            username: Faker.name.firstName(),
            email: Faker.internet.email(),
            password: "B8oneTeste123!"
        };

        const signUpOtherMemberCreated = await UserService.signUp(signUpOtherMemberPayload, trx);

        const inviteUserToOrganizationPayload = {
            users: [{
                id: signUpOtherMemberCreated.id,
                email: signUpOtherMemberCreated.email,
                services: [{
                    name: Services.AFFILIATE,
                    role: ServiceRoles.ANALYST
                }]
            }]
        }

        await service.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

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

        const inativeUsersInOrganizationPayload = {
            usersId: [signUpOtherMemberCreated.id]
        }

        const inativedUser = await service.inativeUsersInOrganization(inativeUsersInOrganizationPayload, context, trx);

        expect(inativedUser).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    userOrganization: expect.objectContaining({
                        id: invitedUserToOrganization.id,
                        userId: signUpOtherMemberCreated.id,
                        organizationId: organizationCreated.id,
                        inviteStatus: OrganizationInviteStatus.ACCEPT,
                        inviteHash: null,
                        createdAt: expect.any(Date),
                        updatedAt: expect.any(Date)
                    })
                })
            ])
        );

        const organizationMemberRole = await service.getOrganizationRoleId(OrganizationRoles.MEMBER, trx);

        const [userOrganizationRoleFound] = await (trx || knexDatabase.knex)('users_organization_roles')
        .where('users_organization_id', invitedUserToOrganization.id)
        .select('organization_role_id');

        expect(userOrganizationRoleFound.organization_role_id).toBe(organizationMemberRole.id);

        done();
    })

    test("member/admin should list users from organization", async done => {

        let signUpPayload = {
            username: "userteste",
            email: "userteste@b8one.com",
            password: "B8oneTeste123!"
        }

        let signUpCreated = await UserService.signUp(signUpPayload, trx);
        let userToken = { origin: 'user', id: signUpCreated.id };

        const organizationCreated = await service.createOrganization(createOrganizationPayload, {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        let context = {client: userToken, organizationId: organizationCreated.id};

        const vtexSecrets = {
            xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
            xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
            accountName: "beightoneagency"
        }
        
        await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

        let signUpOtherMemberPayload = {
            username: `aaaaaaaaaa`,
            email: `aaaaaaaaaa@b8one.com`,
            password: "B8oneTeste123!"
        };

        const signUpOtherMemberCreated = await UserService.signUp(signUpOtherMemberPayload, trx);

        const inviteUserToOrganizationPayload = {
            users: [{
                id: signUpOtherMemberCreated.id,
                email: signUpOtherMemberCreated.email,
                services: [{
                    name: Services.AFFILIATE,
                    role: ServiceRoles.ANALYST
                }]
            }]
        }

        await service.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

        const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", signUpOtherMemberCreated.id).select('invite_hash', 'id');

        const responseInvitePayload = {
            inviteHash: invitedUserToOrganization.invite_hash,
            response: OrganizationInviteStatus.ACCEPT
        }

        await service.responseInvite(responseInvitePayload, trx);

        const organizationusers = await service.listUsersInOrganization({}, context, trx);

        const memberRole = await service.getOrganizationRoleId(OrganizationRoles.MEMBER, trx);

        expect(organizationusers).toEqual(
            expect.objectContaining({
                count: "1",
                usersOrganizations: expect.arrayContaining([
                    expect.objectContaining({
                        id: invitedUserToOrganization.id,
                        userId: signUpOtherMemberCreated.id,
                        organizationId: organizationCreated.id,
                        inviteStatus: OrganizationInviteStatus.ACCEPT,
                        inviteHash: null,
                        createdAt: expect.any(Date),
                        updatedAt: expect.any(Date),
                        active: true,
                        organizationRoleId: memberRole.id
                    })
                ])
            })
        )

        done();
    })

    test("member/admin should list users from organization by name", async done => {

        let signUpPayload3 = {
            username: "userteste",
            email: "userteste@b8one.com",
            password: "B8oneTeste123!"
        }

        let signUpCreated3 = await UserService.signUp(signUpPayload3, trx);

        const organizationCreated = await service.createOrganization(createOrganizationPayload, {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        let context = {client: userToken, organizationId: organizationCreated.id};

        const vtexSecrets = {
            xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
            xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
            accountName: "beightoneagency"
        }
        
        await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

        let signUpOtherMemberPayload = {
            username: `aaaaaaaaaa`,
            email: `aaaaaaaaaa@b8one.com`,
            password: "B8oneTeste123!"
        };

        const signUpOtherMemberCreated = await UserService.signUp(signUpOtherMemberPayload, trx);

        const inviteUserToOrganizationPayload = {
            users: [{
                id: signUpOtherMemberCreated.id,
                email: signUpOtherMemberCreated.email,
                services: [{
                    name: Services.AFFILIATE,
                    role: ServiceRoles.ANALYST
                }]
            },{
                id: signUpCreated3.id,
                email: signUpCreated3.email,
                services: [{
                    name: Services.AFFILIATE,
                    role: ServiceRoles.ANALYST
                }]
            }]
        }

        await service.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

        const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", signUpOtherMemberCreated.id).select('invite_hash', 'id');

        const responseInvitePayload = {
            inviteHash: invitedUserToOrganization.invite_hash,
            response: OrganizationInviteStatus.ACCEPT
        }

        await service.responseInvite(responseInvitePayload, trx);

        const [invitedUserToOrganization3] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", signUpCreated3.id).select('invite_hash', 'id');

        const responseInvitePayload3 = {
            inviteHash: invitedUserToOrganization3.invite_hash,
            response: OrganizationInviteStatus.ACCEPT
        }

        await service.responseInvite(responseInvitePayload3, trx);

        const listUsersInOrganizationPayload = {
            name: "user"
        }

        const organizationusers = await service.listUsersInOrganization(listUsersInOrganizationPayload, context, trx);

        const memberRole = await service.getOrganizationRoleId(OrganizationRoles.MEMBER, trx);

        expect(organizationusers).toEqual(
            expect.objectContaining({
                count: "1",
                usersOrganizations: expect.arrayContaining([
                    expect.objectContaining({
                        id: invitedUserToOrganization3.id,
                        userId: signUpCreated3.id,
                        organizationId: organizationCreated.id,
                        inviteStatus: OrganizationInviteStatus.ACCEPT,
                        inviteHash: null,
                        createdAt: expect.any(Date),
                        updatedAt: expect.any(Date),
                        active: true,
                        organizationRoleId: memberRole.id
                    })
                ])
            })
        )

        done();
    })

    test("organization admin should handle member permissions to admin", async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload, {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        let context = {client: userToken, organizationId: organizationCreated.id};

        const vtexSecrets = {
            xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
            xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
            accountName: "beightoneagency"
        }
        
        await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

        let signUpOtherMemberPayload = {
            username: Faker.internet.userName(),
            email: Faker.internet.email(),
            password: "B8oneTeste123!"
        };

        const signUpOtherMemberCreated = await UserService.signUp(signUpOtherMemberPayload, trx);

        const inviteUserToOrganizationPayload = {
            users: [{
                id: signUpOtherMemberCreated.id,
                email: signUpOtherMemberCreated.email,
                services: [{
                    name: Services.AFFILIATE,
                    role: ServiceRoles.ANALYST
                }]
            }]
        }

        await service.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

        const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", signUpOtherMemberCreated.id).select('invite_hash', 'id');

        const responseInvitePayload = {
            inviteHash: invitedUserToOrganization.invite_hash,
            response: OrganizationInviteStatus.ACCEPT
        }

        await service.responseInvite(responseInvitePayload, trx);

        const handleUserPermissionInOrganizationPayload = {
            userId: signUpOtherMemberCreated.id,
            permission: OrganizationRoles.ADMIN
        };

        const userPermissionChanged = await service.handleUserPermissionInOrganization(handleUserPermissionInOrganizationPayload, context, trx);

        const userOrganizationRoleFound = await service.getUserOrganizationRoleById(invitedUserToOrganization.id, trx);

        const adminOrganizationRole = await service.getOrganizationRoleId(OrganizationRoles.ADMIN, trx);

        expect(userPermissionChanged).toEqual(
            expect.objectContaining({
                id: userOrganizationRoleFound.id,
                userOrganizationId: invitedUserToOrganization.id,
                organizationRoleId: adminOrganizationRole.id,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date)
            })
        )

        const userOrganizationServiceRoles = await (trx || knexDatabase.knex)('users_organization_service_roles').select();

        const [serviceAnalystRole] = await (trx || knexDatabase.knex)('service_roles').where('name', ServiceRoles.ANALYST).select('id');
        const [affiliateService] = await (trx || knexDatabase.knex)('services').where('name', Services.AFFILIATE).select('id');
        const [affiliateOrganizationService] = await (trx || knexDatabase.knex)('organization_services').where('organization_id', organizationCreated.id).andWhere('service_id', affiliateService.id).select('id');

        expect(userOrganizationServiceRoles).toHaveLength(1);
        expect(userOrganizationServiceRoles).toStrictEqual([
            expect.objectContaining({
                id: expect.any(String),
                service_roles_id: serviceAnalystRole.id,
                users_organization_id: invitedUserToOrganization.id,
                organization_services_id: affiliateOrganizationService.id,
                created_at: expect.any(Date),
                updated_at: expect.any(Date),
                active: false,
                bank_data_id: null
            })
        ])

        done();
    })

    test("organization admin should not be able to remove other admin acces", async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload, {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        let context = {client: userToken, organizationId: organizationCreated.id};

        const vtexSecrets = {
            xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
            xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
            accountName: "beightoneagency"
        }
        
        await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

        let signUpOtherMemberPayload = {
            username: Faker.internet.userName(),
            email: Faker.internet.email(),
            password: "B8oneTeste123!"
        };

        const signUpOtherMemberCreated = await UserService.signUp(signUpOtherMemberPayload, trx);

        const inviteUserToOrganizationPayload = {
            users: [{
                id: signUpOtherMemberCreated.id,
                email: signUpOtherMemberCreated.email,
                services: [{
                    name: Services.AFFILIATE,
                    role: ServiceRoles.ANALYST
                }]
            }]
        }

        await service.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

        const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", signUpOtherMemberCreated.id).select('invite_hash', 'id');

        const responseInvitePayload = {
            inviteHash: invitedUserToOrganization.invite_hash,
            response: OrganizationInviteStatus.ACCEPT
        }

        await service.responseInvite(responseInvitePayload, trx);

        let handleUserPermissionInOrganizationPayload = {
            userId: signUpOtherMemberCreated.id,
            permission: OrganizationRoles.ADMIN
        };

        await service.handleUserPermissionInOrganization(handleUserPermissionInOrganizationPayload, context, trx);

        handleUserPermissionInOrganizationPayload.permission = OrganizationRoles.MEMBER;
        handleUserPermissionInOrganizationPayload.userId = userToken.id;

        try {
            let otherUserToken = {id: signUpOtherMemberCreated.id, origin: 'user'};
            let otherContext = {client: otherUserToken, organizationId: organizationCreated.id};
            await service.handleUserPermissionInOrganization(handleUserPermissionInOrganizationPayload, otherContext, trx);
        } catch(e) {
            expect(e.message).toBe("Only founder can remove admin permission from organization.");
        }

        done();

    })

    test("founder should be able to remove other admin acces", async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload, {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        let context = {client: userToken, organizationId: organizationCreated.id};

        let signUpOtherMemberPayload = {
            username: Faker.internet.userName(),
            email: Faker.internet.email(),
            password: "B8oneTeste123!"
        };

        const signUpOtherMemberCreated = await UserService.signUp(signUpOtherMemberPayload, trx);

        const inviteUserToOrganizationPayload = {
            users: [{
                id: signUpOtherMemberCreated.id,
                email: signUpOtherMemberCreated.email
            }]
        }

        await service.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

        const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", signUpOtherMemberCreated.id).select('invite_hash', 'id');

        const responseInvitePayload = {
            inviteHash: invitedUserToOrganization.invite_hash,
            response: OrganizationInviteStatus.ACCEPT
        }

        await service.responseInvite(responseInvitePayload, trx);

        let handleUserPermissionInOrganizationPayload = {
            userId: signUpOtherMemberCreated.id,
            permission: OrganizationRoles.ADMIN
        };

        await service.handleUserPermissionInOrganization(handleUserPermissionInOrganizationPayload, context, trx);

        handleUserPermissionInOrganizationPayload.permission = OrganizationRoles.MEMBER;

        const userPermissionChanged = await service.handleUserPermissionInOrganization(handleUserPermissionInOrganizationPayload, context, trx);

        const userOrganizationRoleFound = await service.getUserOrganizationRoleById(invitedUserToOrganization.id, trx);

        const adminOrganizationRole = await service.getOrganizationRoleId(OrganizationRoles.MEMBER, trx);

        expect(userPermissionChanged).toEqual(
            expect.objectContaining({
                id: userOrganizationRoleFound.id,
                userOrganizationId: invitedUserToOrganization.id,
                organizationRoleId: adminOrganizationRole.id,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date)
            })
        )

        done();

    })

    test("admin user should inative user member from organization and reinvite this member", async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload, {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        let context = {client: userToken, organizationId: organizationCreated.id};

        const vtexSecrets = {
            xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
            xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
            accountName: "beightoneagency"
        }
        
        await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

        let signUpOtherMemberPayload = {
            username: Faker.name.firstName(),
            email: Faker.internet.email(),
            password: "B8oneTeste123!"
        };

        const signUpOtherMemberCreated = await UserService.signUp(signUpOtherMemberPayload, trx);

        const inviteUserToOrganizationPayload = {
            users: [{
                id: signUpOtherMemberCreated.id,
                email: signUpOtherMemberCreated.email,
                services: [{
                    name: Services.AFFILIATE,
                    role: ServiceRoles.ANALYST
                }]
            }]
        }

        await service.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

        const [invitedUserToOrganization] = await (trx || knexDatabase.knex)('users_organizations').where("user_id", signUpOtherMemberCreated.id).select('invite_hash', 'id');

        const responseInvitePayload = {
            inviteHash: invitedUserToOrganization.invite_hash,
            response: OrganizationInviteStatus.ACCEPT
        }

        await service.responseInvite(responseInvitePayload, trx);

        const inativeUsersInOrganizationPayload = {
            usersId: [signUpOtherMemberCreated.id],
        }

        await service.inativeUsersInOrganization(inativeUsersInOrganizationPayload, context, trx);

        const inviteUserToOrganizationPayloadAgain = {
            users: [{
                id: signUpOtherMemberCreated.id,
                email: signUpOtherMemberCreated.email
            }]
        }

        const invitedMember = await service.inviteUserToOrganization(inviteUserToOrganizationPayloadAgain, context, trx);

        expect(invitedMember).toBeTruthy();

        const [userOrganizationFound] = await (trx || knexDatabase.knex)('users_organizations').where('id', invitedUserToOrganization.id).select();

        expect(userOrganizationFound).toEqual(
            expect.objectContaining({
                id: invitedUserToOrganization.id,
                user_id: signUpOtherMemberCreated.id,
                organization_id: organizationCreated.id,
                invite_status: OrganizationInviteStatus.PENDENT,
                active: true,
                invite_hash: expect.any(String),
                updated_at: expect.any(Date),
                created_at: expect.any(Date)
            })
        )

        const userOrganizationServiceRoles = await (trx || knexDatabase.knex)('users_organization_service_roles').select();

        const [serviceAnalystRole] = await (trx || knexDatabase.knex)('service_roles').where('name', ServiceRoles.ANALYST).select('id');
        const [affiliateService] = await (trx || knexDatabase.knex)('services').where('name', Services.AFFILIATE).select('id');
        const [affiliateOrganizationService] = await (trx || knexDatabase.knex)('organization_services').where('organization_id', organizationCreated.id).andWhere('service_id', affiliateService.id).select('id');
        const [otherUser] = await (trx || knexDatabase.knex)('users').where('email', signUpOtherMemberPayload.email).select('id');
        const [userOtherUserOrganizations] = await (trx || knexDatabase.knex)('users_organizations').where('user_id', otherUser.id).andWhere('organization_id', organizationCreated.id).select('id');

        expect(userOrganizationServiceRoles).toHaveLength(1);
        expect(userOrganizationServiceRoles).toStrictEqual([
            expect.objectContaining({
                id: expect.any(String),
                service_roles_id: serviceAnalystRole.id,
                users_organization_id: userOtherUserOrganizations.id,
                organization_services_id: affiliateOrganizationService.id,
                created_at: expect.any(Date),
                updated_at: expect.any(Date),
                active: false,
                bank_data_id: null
            })
        ])

        done();
    })

    test("admin should upload organization image", async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload, {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        let context = {client: userToken, organizationId: organizationCreated.id};

        imgGen.generateImage(1, 1, 80, async function(err: Error, image : any) {

            const organizationUploadImagePayload = {
                imageName: "teste-organization-upload2",
                mimetype: "image/jpeg",
                data: image.data
            }

            const organizationImageUploaded = await service.organizationUploadImage(organizationUploadImagePayload, context, trx);

            expect(organizationImageUploaded).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    name: organizationCreated.name,
                    contactEmail: organizationCreated.contactEmail,
                    userId: userToken.id,
                    active: true,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date),
                    userOrganizationId: undefined,
                    logo: expect.any(String)
                })
            )
            done();
        });
        
    })

    test("admin should invite member with role pre selected", async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload, {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        let context = {client: userToken, organizationId: organizationCreated.id};

        let signUpOtherMemberPayload = {
            username: Faker.name.firstName(),
            email: Faker.internet.email(),
            password: "B8oneTeste123!"
        };

        const signUpOtherMemberCreated = await UserService.signUp(signUpOtherMemberPayload, trx);

        const inviteUserToOrganizationPayload = {
            users: [{
                id: signUpOtherMemberCreated.id,
                email: signUpOtherMemberCreated.email,
                role: OrganizationRoles.ADMIN
            }]
        }

        const invitedUserToOrganization = await service.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

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

        const [userOtherUserOrganizations] = await (trx || knexDatabase.knex)('users_organizations').where('user_id', signUpOtherMemberCreated.id).select();
        const [userOrganizationsFounder] = await (trx || knexDatabase.knex)('users_organizations').whereNot('user_id', signUpOtherMemberCreated.id).select();

        expect(userOrganizationRoles).toHaveLength(2);
        expect(userOrganizationRoles).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    organization_role_id: adminRole[0].id,
                    users_organization_id: userOrganizationsFounder.id,
                    updated_at: expect.any(Date),
                    created_at: expect.any(Date)
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    organization_role_id: adminRole[0].id,
                    users_organization_id: userOtherUserOrganizations.id,
                    updated_at: expect.any(Date),
                    created_at: expect.any(Date)
                })
            ]),
        )

        done();

    })
        
});