import OrganizationRulesService from '../../../organization-rules/service';
jest.mock('../../../organization-rules/service')
import service from '../../service';
import VtexService from '../../../vtex/service';
import UserService from '../../../users/service';
import { Transaction } from 'knex';
import knexDatabase from '../../../../knex-database';
import { createOrganizationPayload } from '../../../../__mocks__'
import { ISignUpAdapted } from '../../../users/types';
import { IUserToken } from '../../../authentication/types';
import Faker from 'faker';
import redisClient from '../../../../lib/Redis';
import { MESSAGE_ERROR_UPGRADE_PLAN } from '../../../../common/consts';
import { ServiceRoles } from '../../../services/types';

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

    test('user organization admin should invite teammates below plan limit', async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload(), {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        let context = {client: userToken, organizationId: organizationCreated.id};

        const inviteTeammatesInput = {
            emails: Array(5).fill(0).map(() => Faker.internet.email())
        }

        const getAffiliateTeammateRulesSpy = jest.spyOn(OrganizationRulesService, 'getAffiliateTeammateRules')
        getAffiliateTeammateRulesSpy.mockImplementation(() => new Promise((resolve) => resolve({affiliateRules:{
            maxAnalysts: 5,
            maxSales: 5,
            maxTeammates: 5,
            maxTransactionTax: 5
        }})))

        const invitedUserToOrganization = await service.inviteTeammates(inviteTeammatesInput, context, trx);

        expect(invitedUserToOrganization).toBeTruthy();

        const usersOrganization = await (trx || knexDatabase.knex)('users_organizations').select();

        expect(usersOrganization).toHaveLength(6);

        done();
    })

    test('user organization admin not should invite teammates above plan limit', async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload(), {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        let context = {client: userToken, organizationId: organizationCreated.id};

        const inviteTeammatesInput = {
            emails: Array(6).fill(0).map(() => Faker.internet.email())
        }

        const getAffiliateTeammateRulesSpy = jest.spyOn(OrganizationRulesService, 'getAffiliateTeammateRules')
        getAffiliateTeammateRulesSpy.mockImplementation(() => new Promise((resolve) => resolve({affiliateRules:{
            maxAnalysts: 5,
            maxSales: 5,
            maxTeammates: 5,
            maxTransactionTax: 5
        }})))
       
        try{
            await service.inviteTeammates(inviteTeammatesInput, context, trx);
        } catch(e){
            expect(e.message).toBe(MESSAGE_ERROR_UPGRADE_PLAN)
            const usersOrganization = await (trx || knexDatabase.knex)('users_organizations').select();
            expect(usersOrganization).toHaveLength(1);
            done();
        }

    })

    test('user organization admin should re-invite teammates', async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload(), {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        let context = {client: userToken, organizationId: organizationCreated.id};

        const inviteTeammatesInput = {
            emails: Array(5).fill(0).map(() => Faker.internet.email())
        }

        const reinviteTeammatesInput = {
            emails: [inviteTeammatesInput.emails[0]]
        }

        const getAffiliateTeammateRulesSpy = jest.spyOn(OrganizationRulesService, 'getAffiliateTeammateRules')
        getAffiliateTeammateRulesSpy.mockImplementation(() => new Promise((resolve) => resolve({affiliateRules:{
            maxAnalysts: 5,
            maxSales: 5,
            maxTeammates: 5,
            maxTransactionTax: 5
        }})))

        await service.inviteTeammates(inviteTeammatesInput, context, trx);

        const reinvitedUserToOrganization = await service.inviteTeammates(reinviteTeammatesInput, context, trx);

        expect(reinvitedUserToOrganization).toBeTruthy();

        const usersOrganization = await (trx || knexDatabase.knex)('users_organizations').select();

        expect(usersOrganization).toHaveLength(6);

        done();

    })

    test('user organization admin should re-invite teammates but not exced plan limit', async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload(), {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        let context = {client: userToken, organizationId: organizationCreated.id};

        const inviteTeammatesInput = {
            emails: Array(5).fill(0).map(() => Faker.internet.email())
        }

        const reinviteTeammatesInput = {
            emails: [inviteTeammatesInput.emails[0], Faker.internet.email()]
        }

        const getAffiliateTeammateRulesSpy = jest.spyOn(OrganizationRulesService, 'getAffiliateTeammateRules')
        getAffiliateTeammateRulesSpy.mockImplementation(() => new Promise((resolve) => resolve({affiliateRules:{
            maxAnalysts: 5,
            maxSales: 5,
            maxTeammates: 5,
            maxTransactionTax: 5
        }})))

        await service.inviteTeammates(inviteTeammatesInput, context, trx);

        try{
            await service.inviteTeammates(reinviteTeammatesInput, context, trx);
        } catch(e){
            expect(e.message).toBe(MESSAGE_ERROR_UPGRADE_PLAN)
            const usersOrganization = await (trx || knexDatabase.knex)('users_organizations').select();
            expect(usersOrganization).toHaveLength(6);
            done();
        }

    })

    test('user organization admin should invite old service members to teammates but not exced plan limit', async done => {

        const organizationCreated = await service.createOrganization(createOrganizationPayload(), {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        let context = {client: userToken, organizationId: organizationCreated.id};

        const getAffiliateTeammateRulesSpy = jest.spyOn(OrganizationRulesService, 'getAffiliateTeammateRules')
        getAffiliateTeammateRulesSpy.mockImplementation(() => new Promise((resolve) => resolve({affiliateRules:{
            maxAnalysts: 5,
            maxSales: 5,
            maxTeammates: 5,
            maxTransactionTax: 5
        }})))

        const vtexSecrets = {
            xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
            xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
            accountName: "beightoneagency"
        }

        await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

        const inviteAffiliatesInput = {
            users: Array(1).fill(0).map(() => ({
                email: Faker.internet.email(),
                role: ServiceRoles.ANALYST
            }))
        }

        await service.inviteAffiliateServiceMembers(inviteAffiliatesInput, context, trx);

        const inviteTeammatesInput = {
            emails: [inviteAffiliatesInput.users[0].email]
        }

        await service.inviteTeammates(inviteTeammatesInput, context, trx);

        const usersOrganization = await (trx || knexDatabase.knex)('users_organizations').select();

        expect(usersOrganization).toHaveLength(2);

        const usersOrganizationService = await (trx || knexDatabase.knex)('users_organization_service_roles').where('active', true).select();
        
        expect(usersOrganizationService).toHaveLength(0);

        done();

    })


})