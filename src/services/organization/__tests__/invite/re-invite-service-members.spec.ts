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
import { ServiceRoles } from '../../../services/types';
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

    let invitedServiceMembers: IUserOrganizationAdapted[];

    let context: IContext;

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

        const organizationCreated = await service.createOrganization(createOrganizationPayload(), {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await service.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        context = {client: userToken, organizationId: organizationCreated.id};

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

        const getAffiliateTeammateRulesSpy = jest.spyOn(OrganizationRulesService, 'getAffiliateTeammateRules')
        getAffiliateTeammateRulesSpy.mockImplementation(() => new Promise((resolve) => resolve({
            maxAnalysts: 5,
            maxSales: 5,
            maxTeammates: 5,
            maxTransactionTax: 5
        })))

        invitedServiceMembers = await service.inviteAffiliateServiceMembers(inviteAffiliatesInput, context, trx);
    })

    afterAll(async () => {
        await trx.rollback();
        await trx.destroy();
        redisClient.end();
        return new Promise(resolve => {
            resolve();
        }); 
    });

    test('user organization admin should re-invite service members', async done => {

        const reinviteServiceMemberInput = {
            userOrganizationId: invitedServiceMembers[0].id
        }

        const reinvitedServiceMember = await service.reinviteServiceMember(reinviteServiceMemberInput, context, trx);

        expect(reinvitedServiceMember).toBeTruthy();

        const usersOrganization = await (trx || knexDatabase.knex)('users_organizations').whereNotNull('invite_hash').select();

        expect(usersOrganization).toHaveLength(1);

        done();
    })

})