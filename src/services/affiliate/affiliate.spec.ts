process.env.NODE_ENV = 'test';
import service from './service';
import ServicesService from '../services/service';
import UserService from '../users/service';
import OrganizationService from '../organization/service';
import BankDataService from '../bank-data/service';
import VtexService from '../vtex/service';
import Faker from 'faker';
import database from '../../knex-database';
import { Transaction } from 'knex';
import { ISignUpAdapted } from '../users/types';
import { MESSAGE_ERROR_USER_DOES_NOT_HAVE_SALE_ROLE, SALE_VTEX_PIXEL_NAMESPACE } from '../../common/consts';
import { IUserToken } from '../authentication/types';
import { IOrganizationAdapted, OrganizationInviteStatus } from '../organization/types';
import knexDatabase from '../../knex-database';
import { IServiceAdaptedFromDB, Services, ServiceRoles } from '../services/types';
import { IContext } from '../../common/types';
import redisClient from '../../lib/Redis';

describe('Affiliate', () => {

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

        await redisClient.flushall('ASYNC');

        const [serviceFoundDB] = await (trx || knexDatabase.knex)('services').where('name', Services.AFFILIATE).select('id');
        serviceFound = serviceFoundDB

        signUpCreated = await UserService.signUp(signUpPayload, trx);
        userToken = { origin: 'user', id: signUpCreated.id };
        organizationCreated = await OrganizationService.createOrganization(createOrganizationPayload, userToken, trx);
        const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', signUpCreated.id).select('verification_hash');
        await UserService.verifyEmail(userFromDb.verification_hash, trx);
        context = {client: userToken, organizationId: organizationCreated.id};

    });

    afterAll(async () => {
        await trx.rollback();
        await trx.destroy();
        await redisClient.end;
        return new Promise(resolve => {
            resolve();
        }); 
    });

    afterEach(async () => {
        await trx('users_organization_service_roles_url_shortener').del();
        await trx('url_shorten').del();
        await trx('users_organization_service_roles').del();
        await trx('banks_data').del();
    })

    test('generate shortcode', async done => {   

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
            organizationId: organizationCreated.id,
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

        const userInOrganizationService = await ServicesService.addUserInOrganizationService(addUserInOrganizationServicePayload, context, trx);   

        const affiliateGenerateShortenerUrlPayload = {
            originalUrl: Faker.internet.url(),
            serviceName: Services.AFFILIATE
        }

        const affiliateToken = { origin: 'user', id: otherSignUpCreated.id };
        const affiliateContext = {client: affiliateToken, organizationId: organizationCreated.id};

        const affiliateGenerateShortenerUrl = await service.generateShortenerUrl(affiliateGenerateShortenerUrlPayload, affiliateContext, trx);

        const affiliateId = userInOrganizationService.id;

        expect(affiliateGenerateShortenerUrl).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                usersOrganizationServiceRolesId: affiliateId,
                urlShortenId: expect.any(String),
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date)
            })
        )

        done();
    })

    test('get my short codes', async done => {   

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
            accountName: "beightoneagency",
        }

        await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

        const inviteUserToOrganizationPayload = {
            organizationId: organizationCreated.id,
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

        const userInOrganizationService = await ServicesService.addUserInOrganizationService(addUserInOrganizationServicePayload, context, trx);   

        const affiliateGenerateShortenerUrlPayload = {
            originalUrl: Faker.internet.url(),
            organizationId:organizationCreated.id,
            serviceName: Services.AFFILIATE
        }

        const affiliateToken = { origin: 'user', id: otherSignUpCreated.id };
        const affiliateContext = {client: affiliateToken, organizationId: organizationCreated.id};

        await service.generateShortenerUrl(affiliateGenerateShortenerUrlPayload, affiliateContext, trx);

        const affiliateId = userInOrganizationService.id;

        const userOrganizationServicePayload = {
            userOrganizationServiceId: affiliateId
        }

        const shorterUrlByUserOrganizationServiceId = await service.getShorterUrlByUserOrganizationServiceId(userOrganizationServicePayload, affiliateToken, trx);

        expect(shorterUrlByUserOrganizationServiceId).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    usersOrganizationServiceRolesId: affiliateId,
                    urlShortenId: expect.any(String),
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date)
                })
            ])
        )

        done();
    })

    test('affiliate should create bank values', async done => {   

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
            accountName: "beightoneagency",
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

        const userInOrganizationService = await ServicesService.addUserInOrganizationService(addUserInOrganizationServicePayload, context, trx);   

        const affiliateToken = { origin: 'user', id: otherSignUpCreated.id };
        const affiliateContext = {client: affiliateToken, organizationId: organizationCreated.id, userServiceOrganizationRolesId: userInOrganizationService.id};

        const getBrazilBanksPayload = {
            name: "260"
        }

        const brazilBanks = await BankDataService.getBrazilBanks(getBrazilBanksPayload, affiliateContext, trx);

        const createUserBankValuesPayload = {
            name: Faker.name.firstName(),
            agency: "0000",
            account: "00000",
            accountDigit: "0",
            document: "000000000000",
            brazilBankId: brazilBanks[0].id
        }

        const affiliateBankValuesCreated = await service.createAffiliateBankValues(createUserBankValuesPayload, affiliateContext, trx);

        expect(affiliateBankValuesCreated).toEqual(
            expect.objectContaining({
                id: userInOrganizationService.id,
                serviceRolesId: expect.any(String),
                usersOrganizationId: expect.any(String),
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
                active: true,
                bankDataId: expect.any(String)
            })
        )

        done();
    })

    test('affiliate should update bank values', async done => {   

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
            accountName: "beightoneagency",
        }

        await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

        const inviteUserToOrganizationPayload = {
            organizationId: organizationCreated.id,
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

        const userInOrganizationService = await ServicesService.addUserInOrganizationService(addUserInOrganizationServicePayload, context, trx);   

        const affiliateToken = { origin: 'user', id: otherSignUpCreated.id };
        const affiliateContext = {client: affiliateToken, organizationId: organizationCreated.id, userServiceOrganizationRolesId: userInOrganizationService.id};

        const getBrazilBanksPayload = {
            name: "260"
        }

        const brazilBanks = await BankDataService.getBrazilBanks(getBrazilBanksPayload, affiliateContext, trx);

        const createUserBankValuesPayload = {
            name: Faker.name.firstName(),
            agency: "0000",
            account: "00000",
            accountDigit: "0",
            document: "000000000000",
            brazilBankId: brazilBanks[0].id
        }

        
        await service.createAffiliateBankValues(createUserBankValuesPayload, affiliateContext, trx);

        const updateUserBankValuesPayload = {
            name: Faker.name.firstName(),
            agency: "1111",
            account: "11111",
            accountDigit: "1",
            document: "11111111",
            brazilBankId: brazilBanks[0].id
        }

        const affiliateBankValuesCreated = await service.createAffiliateBankValues(updateUserBankValuesPayload, affiliateContext, trx);

        expect(affiliateBankValuesCreated).toEqual(
            expect.objectContaining({
                id: userInOrganizationService.id,
                serviceRolesId: expect.any(String),
                usersOrganizationId: expect.any(String),
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
                active: true,
                bankDataId: expect.any(String)
            })
        )

        const dataBankFound = await (trx || knexDatabase)('banks_data').select();

        expect(dataBankFound).toHaveLength(1);
        expect(dataBankFound).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    agency: updateUserBankValuesPayload.agency,
                    account: updateUserBankValuesPayload.account,
                    account_digit: updateUserBankValuesPayload.accountDigit,
                    document: updateUserBankValuesPayload.document,
                    brazil_bank_id: expect.any(String),
                    created_at: expect.any(Date),
                    updated_at: expect.any(Date)
                })
            ])
        )

        done();
    })

    test('users admin should not consult sale email', async done => {   

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
            accountName: "beightoneagency",
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

        const userInOrganizationService = await ServicesService.addUserInOrganizationService(addUserInOrganizationServicePayload, context, trx);   

        const generateSalesJWTPayload = {
            email: signUpCreated.email,
            organizationId: organizationCreated.id,
            serviceName: Services.AFFILIATE
        }

        try {        
            await service.generateSalesJWT(generateSalesJWTPayload, { redisClient }, trx);
        } catch (error) {
            expect(error.message).toBe(MESSAGE_ERROR_USER_DOES_NOT_HAVE_SALE_ROLE);
            done();
        }

        
    })

    test('users not sale should not consult sale email', async done => {   

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
            accountName: "beightoneagency",
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

        await ServicesService.addUserInOrganizationService(addUserInOrganizationServicePayload, context, trx);   

        const generateSalesJWTPayload = {
            email: otherSignUpCreated.email,
            organizationId: organizationCreated.id,
            serviceName: Services.AFFILIATE
        }

        try {        
            await service.generateSalesJWT(generateSalesJWTPayload, {redisClient}, trx);
        } catch (error) {
            expect(error.message).toBe(MESSAGE_ERROR_USER_DOES_NOT_HAVE_SALE_ROLE);
            done();
        }

        
    })

    test('users sale should consult sale email and get jwt expire token', async done => {   

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
            accountName: "beightoneagency",
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

        const userInOrganizationService = await ServicesService.addUserInOrganizationService(addUserInOrganizationServicePayload, context, trx);

        const userInServiceHandleRoleRemoveAdminPayload = {
            userId: otherSignUpCreated.id,
            serviceName: Services.AFFILIATE,
            serviceRole: ServiceRoles.SALE
        };

        await ServicesService.userInServiceHandleRole(userInServiceHandleRoleRemoveAdminPayload, context, trx);

        const generateSalesJWTPayload = {
            email: otherSignUpCreated.email,
            organizationId: organizationCreated.id,
            serviceName: Services.AFFILIATE
        }

        const saleServiceUserChecked = await service.generateSalesJWT(generateSalesJWTPayload, {redisClient} ,trx);

        expect(saleServiceUserChecked).toBeDefined();

        redisClient.get(`${SALE_VTEX_PIXEL_NAMESPACE}_${saleServiceUserChecked}`, (_, data) => {
            expect(data).toBe(userInOrganizationService.id)
            redisClient.keys('*', function (_, keys) {
                expect(keys).toHaveLength(1);
                done();  
              }); 
        });

        done();

        
    })

        
});