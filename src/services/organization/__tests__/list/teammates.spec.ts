import OrganizationRulesService from '../../../organization-rules/service';
jest.mock('../../../organization-rules/service')
import service from '../../service';
import UserService from '../../../users/service';
import { Transaction } from 'knex';
import knexDatabase from '../../../../knex-database';
import { createOrganizationPayload } from '../../../../__mocks__'
import { ISignUpAdapted } from '../../../users/types';
import { IUserToken } from '../../../authentication/types';
import Faker from 'faker';
import redisClient from '../../../../lib/Redis';
import { IUserOrganizationAdapted } from '../../types';
import { IContext } from '../../../../common/types';

describe("teste", () => {

    let trx : Transaction;

    let signUpCreated: ISignUpAdapted;

    let signUpPayload = {
        username: Faker.name.firstName(),
        email: Faker.internet.email(),
        password: "B8oneTeste123!"
    }
    
    let userToken : IUserToken;

    let invitedUserToOrganization: IUserOrganizationAdapted[];

    let context: IContext;

    beforeAll(async () => {
        trx = await knexDatabase.knex.transaction();
        const getAffiliateTeammateRulesSpy = jest.spyOn(OrganizationRulesService, 'getAffiliateTeammateRules')
        getAffiliateTeammateRulesSpy.mockImplementation(() => new Promise((resolve) => resolve({
            maxAnalysts: 5,
            maxSales: 5,
            maxTeammates: 5,
            maxTransactionTax: 5
        })))
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
        
        const organizationCreated = await service.createOrganization(createOrganizationPayload(), {client: userToken, redisClient}, trx);
        
        context = {client: userToken, organizationId: organizationCreated.id};

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        const inviteTeammatesInput = {
            emails: Array(5).fill(0).map(() => Faker.internet.email())
        }

        invitedUserToOrganization = await service.inviteTeammates(inviteTeammatesInput, context, trx);
    })

    afterAll(async () => {
        await trx.rollback();
        await trx.destroy();
        redisClient.end();
        return new Promise(resolve => {
            resolve();
        }); 
    });

    test('user organization admin should list teammates', async done => {

        const teammates = await service.listTeammates(context, trx);

        expect(teammates).toHaveLength(6);

        done();
    })

})