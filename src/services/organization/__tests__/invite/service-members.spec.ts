import OrganizationRulesService from '../../../organization-rules/service';
jest.mock('../../../organization-rules/service')
import service from '../../service';
import UserService from '../../../users/service';
import VtexService from '../../../vtex/service';
import { Transaction } from 'knex';
import knexDatabase from '../../../../knex-database';
import { createOrganizationPayload } from '../../../../__mocks__'
import { ISignUpAdapted } from '../../../users/types';
import { IUserToken } from '../../../authentication/types';
import Faker from 'faker';
import redisClient from '../../../../lib/Redis';
import { MESSAGE_ERROR_UPGRADE_PLAN } from '../../../../common/consts';
import { Services, ServiceRoles } from '../../../services/types';
import { OrganizationRoles } from '../../types';

describe("teste", () => {

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

    beforeEach(async () => {
        await trx('organization_vtex_secrets').del();
        await trx('users_organization_service_roles').del();
        await trx('organization_services').del();
        await trx('users_organization_roles').del();
        await trx('users_organizations').del();
        await trx('organizations').del();
        await trx('organization_additional_infos').del();
        await trx('users').del();
        signUpCreated = await UserService.signUp(signUpPayload, trx);
        userToken = { origin: 'user', id: signUpCreated.id };
    })

    afterAll(async () => {
        await trx.rollback();
        await trx.destroy();
        redisClient.end();
        return new Promise(resolve => {
            resolve();
        }); 
    });

    test('user organization admin should invite service members below plan limit', async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload(), {client: userToken, redisClient}, trx);

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

        const inviteAffiliatesInput = {
            users: Array(5).fill(0).map(() => ({
                email: Faker.internet.email(),
                role: ServiceRoles.ANALYST
            }))
        }

        const getAffiliateTeammateRulesSpy = jest.spyOn(OrganizationRulesService, 'getAffiliateTeammateRules')
        getAffiliateTeammateRulesSpy.mockImplementation(() => new Promise((resolve) => resolve({affiliateRules:{
            maxAnalysts: 5,
            maxSales: 5,
            maxTeammates: 5,
            maxTransactionTax: 5
        }})))

        const invitedServiceMembers = await service.inviteAffiliateServiceMembers(inviteAffiliatesInput, context, trx);

        expect(invitedServiceMembers).toBeTruthy();

        const usersOrganization = await (trx || knexDatabase.knex)('users_organizations').select();
        
        expect(usersOrganization).toHaveLength(6);
        
        const usersOrganizationService = await (trx || knexDatabase.knex)('users_organization_service_roles').select();

        expect(usersOrganizationService).toHaveLength(5);

        done();
    })

    test('user organization admin should invite service members below plan limit and re add member', async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload(), {client: userToken, redisClient}, trx);

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

        const inviteAffiliatesInput = {
            users: Array(5).fill(0).map(() => ({
                email: Faker.internet.email(),
                role: ServiceRoles.ANALYST
            }))
        }

        const getAffiliateTeammateRulesSpy = jest.spyOn(OrganizationRulesService, 'getAffiliateTeammateRules')
        getAffiliateTeammateRulesSpy.mockImplementation(() => new Promise((resolve) => resolve({affiliateRules:{
            maxAnalysts: 5,
            maxSales: 5,
            maxTeammates: 5,
            maxTransactionTax: 5
        }})))

        await service.inviteAffiliateServiceMembers(inviteAffiliatesInput, context, trx);

        const reInviteAffiliatesInput = {
            users: [{
                email: inviteAffiliatesInput.users[0].email,
                role: ServiceRoles.ANALYST
            }]
        }

        const invitedServiceMembers = await service.inviteAffiliateServiceMembers(reInviteAffiliatesInput, context, trx);

        expect(invitedServiceMembers).toBeTruthy();

        const usersOrganization = await (trx || knexDatabase.knex)('users_organizations').select();
        
        expect(usersOrganization).toHaveLength(6);
        
        const usersOrganizationService = await (trx || knexDatabase.knex)('users_organization_service_roles').select();

        expect(usersOrganizationService).toHaveLength(5);

        done();
    })

    test('user organization admin should invite service members below plan limit and re add member in other role', async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload(), {client: userToken, redisClient}, trx);

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

        const inviteAffiliatesInput = {
            users: Array(5).fill(0).map(() => ({
                email: Faker.internet.email(),
                role: ServiceRoles.ANALYST
            }))
        }

        const getAffiliateTeammateRulesSpy = jest.spyOn(OrganizationRulesService, 'getAffiliateTeammateRules')
        getAffiliateTeammateRulesSpy.mockImplementation(() => new Promise((resolve) => resolve({affiliateRules:{
            maxAnalysts: 5,
            maxSales: 5,
            maxTeammates: 5,
            maxTransactionTax: 5
        }})))

        await service.inviteAffiliateServiceMembers(inviteAffiliatesInput, context, trx);

        const reInviteAffiliatesInput = {
            users: [{
                email: inviteAffiliatesInput.users[0].email,
                role: ServiceRoles.SALE
            }]
        }

        const invitedServiceMembers = await service.inviteAffiliateServiceMembers(reInviteAffiliatesInput, context, trx);

        expect(invitedServiceMembers).toBeTruthy();

        const usersOrganization = await (trx || knexDatabase.knex)('users_organizations').select();
        
        expect(usersOrganization).toHaveLength(6);
        
        const usersOrganizationService = await (trx || knexDatabase.knex)('users_organization_service_roles').select();

        expect(usersOrganizationService).toHaveLength(5);

        const [saleRole] = await (trx || knexDatabase.knex)('service_roles').where('name', ServiceRoles.SALE).select('id');

        const usersOrganizationServiceSale = await (trx || knexDatabase.knex)('users_organization_service_roles').where('service_roles_id', saleRole.id).select();

        expect(usersOrganizationServiceSale).toHaveLength(1);

        const [analystRole] = await (trx || knexDatabase.knex)('service_roles').where('name', ServiceRoles.ANALYST).select('id');

        const usersOrganizationServiceAnalyst = await (trx || knexDatabase.knex)('users_organization_service_roles').where('service_roles_id', analystRole.id).select();

        expect(usersOrganizationServiceAnalyst).toHaveLength(4);

        done();
    })
    
    test('user organization admin not should invite service members above plan limit', async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload(), {client: userToken, redisClient}, trx);

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

        const inviteAffiliatesInput = {
            users: Array(6).fill(0).map(() => ({
                email: Faker.internet.email(),
                role: ServiceRoles.ANALYST
            }))
        }

        const getAffiliateTeammateRulesSpy = jest.spyOn(OrganizationRulesService, 'getAffiliateTeammateRules')
        getAffiliateTeammateRulesSpy.mockImplementation(() => new Promise((resolve) => resolve({affiliateRules:{
            maxAnalysts: 5,
            maxSales: 5,
            maxTeammates: 5,
            maxTransactionTax: 5
        }})))

        try{
            await service.inviteAffiliateServiceMembers(inviteAffiliatesInput, context, trx);
        } catch(e){
            expect(e.message).toBe(MESSAGE_ERROR_UPGRADE_PLAN)
            const usersOrganization = await (trx || knexDatabase.knex)('users_organizations').select();
            expect(usersOrganization).toHaveLength(1);
            const usersOrganizationService = await (trx || knexDatabase.knex)('users_organization_service_roles').select();
            expect(usersOrganizationService).toHaveLength(0);
            done();
        }

    })
    
    test('user organization admin not should invite service members above plan limit with two roles', async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload(), {client: userToken, redisClient}, trx);

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

        const inviteAffiliatesInput = {
            users: Array(5).fill(0).map(() => ({
                email: Faker.internet.email(),
                role: ServiceRoles.ANALYST
            })).concat(
                Array(6).fill(0).map(() => ({
                    email: Faker.internet.email(),
                    role: ServiceRoles.SALE
                }))  
            )
        }

        const getAffiliateTeammateRulesSpy = jest.spyOn(OrganizationRulesService, 'getAffiliateTeammateRules')
        getAffiliateTeammateRulesSpy.mockImplementation(() => new Promise((resolve) => resolve({affiliateRules:{
            maxAnalysts: 5,
            maxSales: 5,
            maxTeammates: 5,
            maxTransactionTax: 5
        }})))

        try{
            await service.inviteAffiliateServiceMembers(inviteAffiliatesInput, context, trx);
        } catch(e){
            expect(e.message).toBe(MESSAGE_ERROR_UPGRADE_PLAN)
            const usersOrganization = await (trx || knexDatabase.knex)('users_organizations').select();
            expect(usersOrganization).toHaveLength(1);
            const usersOrganizationService = await (trx || knexDatabase.knex)('users_organization_service_roles').select();
            expect(usersOrganizationService).toHaveLength(0);
            done();
        }

    })
    
    test('user organization admin not should invite service members above plan limit with members added', async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload(), {client: userToken, redisClient}, trx);

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

        const inviteAffiliatesInput = {
            users: Array(5).fill(0).map(() => ({
                email: Faker.internet.email(),
                role: ServiceRoles.ANALYST
            }))
        }

        const getAffiliateTeammateRulesSpy = jest.spyOn(OrganizationRulesService, 'getAffiliateTeammateRules')
        getAffiliateTeammateRulesSpy.mockImplementation(() => new Promise((resolve) => resolve({affiliateRules:{
            maxAnalysts: 5,
            maxSales: 5,
            maxTeammates: 5,
            maxTransactionTax: 5
        }})))
        
        await service.inviteAffiliateServiceMembers(inviteAffiliatesInput, context, trx);

        const inviteMoreAffiliatesInput = {
            users: Array(1).fill(0).map(() => ({
                email: Faker.internet.email(),
                role: ServiceRoles.ANALYST
            }))
        }

        try{
            await service.inviteAffiliateServiceMembers(inviteMoreAffiliatesInput, context, trx);
        } catch(e){
            expect(e.message).toBe(MESSAGE_ERROR_UPGRADE_PLAN)
            const usersOrganization = await (trx || knexDatabase.knex)('users_organizations').select();
            expect(usersOrganization).toHaveLength(6);
            const usersOrganizationService = await (trx || knexDatabase.knex)('users_organization_service_roles').select();
            expect(usersOrganizationService).toHaveLength(5);
            done();
        }

    })
    
    test('user organization admin should invite old teammates to service members', async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload(), {client: userToken, redisClient}, trx);

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

        const getAffiliateTeammateRulesSpy = jest.spyOn(OrganizationRulesService, 'getAffiliateTeammateRules')
        getAffiliateTeammateRulesSpy.mockImplementation(() => new Promise((resolve) => resolve({affiliateRules:{
            maxAnalysts: 5,
            maxSales: 5,
            maxTeammates: 5,
            maxTransactionTax: 5
        }})))

        const inviteTeammatesInput = {
            emails: Array(1).fill(0).map(() => Faker.internet.email())
        }

        await service.inviteTeammates(inviteTeammatesInput, context, trx);

        const inviteAffiliatesInput = {
            users: [{
                email: inviteTeammatesInput.emails[0],
                role: ServiceRoles.ANALYST
            }]
        }
        
        await service.inviteAffiliateServiceMembers(inviteAffiliatesInput, context, trx);

        const [organizationAdminRole] = await (trx || knexDatabase.knex)('organization_roles').where('name', OrganizationRoles.ADMIN).select('id');

        const userOrganizationAdmin = await (trx || knexDatabase.knex)('users_organization_roles').where('organization_role_id', organizationAdminRole.id).select('id');

        expect(userOrganizationAdmin).toHaveLength(1);

        const [organizationMemberRole] = await (trx || knexDatabase.knex)('organization_roles').where('name', OrganizationRoles.MEMBER).select('id');

        const userOrganizationMember = await (trx || knexDatabase.knex)('users_organization_roles').where('organization_role_id', organizationMemberRole.id).select('id');

        expect(userOrganizationMember).toHaveLength(1);

        const usersOrganizationServiceSale = await (trx || knexDatabase.knex)('users_organization_service_roles').select();

        expect(usersOrganizationServiceSale).toHaveLength(1);

        done();

    })

})