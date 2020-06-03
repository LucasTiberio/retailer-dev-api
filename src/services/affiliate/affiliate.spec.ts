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
import { IServiceAdaptedFromDB, Services, ServiceRoles } from '../services/types';

const frontUrl = process.env.FRONT_URL_STAGING;

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

    beforeAll(async () => {

        trx = await database.knex.transaction(); 

        const [serviceFoundDB] = await (trx || knexDatabase.knex)('services').where('name', Services.AFFILIATE).select('id');
        serviceFound = serviceFoundDB

        signUpCreated = await UserService.signUp(signUpPayload, trx);
        userToken = { origin: 'user', id: signUpCreated.id };
        organizationCreated = await OrganizationService.createOrganization(createOrganizationPayload, userToken, trx);
        const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', signUpCreated.id).select('verification_hash');
        await UserService.verifyEmail(userFromDb.verification_hash, trx);

        await ServicesService.createServiceInOrganization(serviceFound.id, organizationCreated.id, userToken, trx);
        
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
            accountName: "beightoneagency",
            organizationId: organizationCreated.id
        }

        await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,userToken, trx);

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

        const userInOrganizationService = await ServicesService.addUserInOrganizationService(addUserInOrganizationServicePayload, userToken, trx);   

        const affiliateGenerateShortenerUrlPayload = {
            originalUrl: Faker.internet.url(),
            organizationId:organizationCreated.id,
            serviceName: Services.AFFILIATE
        }

        const affiliateToken = { origin: 'user', id: otherSignUpCreated.id };

        const affiliateGenerateShortenerUrl = await service.generateShortenerUrl(affiliateGenerateShortenerUrlPayload, affiliateToken, trx);

        const shortUrlBefore = `${frontUrl}/${affiliateGenerateShortenerUrl.urlCode}`;

        const affiliateId = userInOrganizationService.id;

        expect(affiliateGenerateShortenerUrl).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                originalUrl: `${affiliateGenerateShortenerUrlPayload.originalUrl}?utm_source=plugone&utm_campaign=${affiliateId}`,
                shortUrl: shortUrlBefore,
                urlCode: expect.any(String),
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date)
            })
        )

        done();
    })

        
});