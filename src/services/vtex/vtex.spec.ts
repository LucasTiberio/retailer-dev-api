process.env.NODE_ENV = 'test';
import service from './service';
import UserService from '../users/service';
import OrganizationService from '../organization/service';
import Faker from 'faker';
import database from '../../knex-database';
import { Transaction } from 'knex';
import { ISignUpAdapted } from '../users/types';
import { IUserToken } from '../authentication/types';
import { IOrganizationAdapted } from '../organization/types';
import knexDatabase from '../../knex-database';

describe('Vtex', () => {

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

    beforeAll(async () => {
        trx = await database.knex.transaction(); 
    });

    afterAll(async () => {
        await trx.rollback();
        await trx.destroy();
        return new Promise(resolve => {
            resolve();
        }); 
    });

    beforeEach(async () => {
        await trx('organization_vtex_secrets').del();
        await trx('users_organization_roles').del();
        await trx('users_organizations').del();
        await trx('organizations').del();
        await trx('users').del();
        signUpCreated = await UserService.signUp(signUpPayload, trx);
        userToken = { origin: 'user', id: signUpCreated.id };
        const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', signUpCreated.id).select('verification_hash');
        await UserService.verifyEmail(userFromDb.verification_hash, trx);
        organizationCreated = await OrganizationService.createOrganization(createOrganizationPayload, userToken, trx);
    })

    test("organization admin should add vtex secrets", async done => {

        const vtexSecrets = {
            xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
            xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
            accountName: "beightoneagency",
            organizationId: organizationCreated.id
        }

        const verifyVtexOrderResource = await service.verifyAndAttachVtexSecrets(vtexSecrets,userToken, trx);
        
        expect(verifyVtexOrderResource).toBeTruthy();

        const vtexSecretsOnDb = await (trx || knexDatabase.knex)('organization_vtex_secrets').select();

        expect(vtexSecretsOnDb).toHaveLength(1);
        expect(vtexSecretsOnDb).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    organization_id: organizationCreated.id,
                    store_name: vtexSecrets.accountName,
                    vtex_key: vtexSecrets.xVtexApiAppKey,
                    vtex_token: vtexSecrets.xVtexApiAppToken
                })
            ])
        )

        done();
    });

    test("organization admin should add false vtex secrets", async done => {

        const vtexSecrets = {
            xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
            xVtexApiAppToken: "KDOAKOD",
            accountName: "beightoneagency",
            organizationId: organizationCreated.id
        }

        try {
            await service.verifyAndAttachVtexSecrets(vtexSecrets,userToken, trx);
        } catch(e){
            expect(e.message).toBe("Acesso não autorizado")
        }

        done();
    });

    test("organization admin should change vtex secrets", async done => {

        const vtexSecrets = {
            xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
            xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
            accountName: "beightoneagency",
            organizationId: organizationCreated.id
        }

        const verifyVtexOrderResource = await service.verifyAndAttachVtexSecrets(vtexSecrets,userToken, trx);
        
        expect(verifyVtexOrderResource).toBeTruthy();

        const newVtexSecrets = {
            xVtexApiAppKey: "vtexappkey-beightoneagency-IQMERK",
            xVtexApiAppToken: "KLWRMMNMNBADAMKNIZJCIPXDGFTWXOLAYWDQOOQKLFVQFUUFMLVKWHFVOTLHSQOZPZFEJUYTJYQCTHYLLOJMSBEQQHCVCJSVRWBFPPWSNBAXRCCGUZVEGCGNVPNBRCRA",
            accountName: "beightoneagency",
            organizationId: organizationCreated.id
        }

        const verifyVtexOrderResourceChange = await service.verifyAndAttachVtexSecrets(newVtexSecrets,userToken, trx);

        expect(verifyVtexOrderResourceChange).toBeTruthy();

        const vtexSecretsOnDb = await (trx || knexDatabase.knex)('organization_vtex_secrets').select();

        expect(vtexSecretsOnDb).toHaveLength(1);
        expect(vtexSecretsOnDb).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    organization_id: organizationCreated.id,
                    store_name: newVtexSecrets.accountName,
                    vtex_key: newVtexSecrets.xVtexApiAppKey,
                    vtex_token: newVtexSecrets.xVtexApiAppToken
                })
            ])
        )

        done();
    });

        
});