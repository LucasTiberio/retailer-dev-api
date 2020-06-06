process.env.NODE_ENV = 'test';
import service from './service';
import ServicesService from '../services/service';
import UserService from '../users/service';
import OrganizationService from '../organization/service';
import VtexService from '../vtex/service';
import Faker from 'faker';
import database from '../../knex-database';
import { Transaction } from 'knex';
import { ISignUpAdapted } from '../users/types';
import { IUserToken } from '../authentication/types';
import { IOrganizationAdapted, OrganizationInviteStatus } from '../organization/types';
import knexDatabase from '../../knex-database';
import { IServiceAdaptedFromDB, Services } from '../services/types';
import { IContext } from '../../common/types';

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
        return new Promise(resolve => {
            resolve();
        }); 
    });

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

        
});