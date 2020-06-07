process.env.NODE_ENV = 'test';
import UserService from '../users/service';
import OrganizationService from '../organization/service';
import Faker from 'faker';
import database from '../../knex-database';
import { Transaction } from 'knex';
import { ISignUpAdapted } from '../users/types';
import { IUserToken } from '../authentication/types';
import { IOrganizationAdapted } from '../organization/types';
import knexDatabase from '../../knex-database';
import service from './service';
import { mockVtexDepartments } from './__mocks__';

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
        await trx('organization_vtex_comission').del();
        await trx('organization_vtex_secrets').del();
        await trx('organization_services').del();
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

    test("organization admin should add vtex secrets and hook attached", async done => {

        const vtexSecrets = {
            xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
            xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
            accountName: "beightoneagency"
        }

        const organizationId = organizationCreated.id;

        const context = {client: userToken, organizationId};

        const verifyVtexOrderResource = await service.verifyAndAttachVtexSecrets(vtexSecrets, context, trx);
        
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
            accountName: "beightoneagency"
        }

        const organizationId = organizationCreated.id;

        const context = {client: userToken, organizationId};

        try {
            await service.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);
        } catch(e){
            expect(e.message).toBe("Acesso não autorizado")
        }

        done();
    });

    test("organization admin should change vtex secrets", async done => {

        const vtexSecrets = {
            xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
            xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
            accountName: "beightoneagency"
        }

        const organizationId = organizationCreated.id;

        const context = {client: userToken, organizationId};

        const verifyVtexOrderResource = await service.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);
        
        expect(verifyVtexOrderResource).toBeTruthy();

        const newVtexSecrets = {
            xVtexApiAppKey: "vtexappkey-beightoneagency-IQMERK",
            xVtexApiAppToken: "KLWRMMNMNBADAMKNIZJCIPXDGFTWXOLAYWDQOOQKLFVQFUUFMLVKWHFVOTLHSQOZPZFEJUYTJYQCTHYLLOJMSBEQQHCVCJSVRWBFPPWSNBAXRCCGUZVEGCGNVPNBRCRA",
            accountName: "beightoneagency"
        }

        const verifyVtexOrderResourceChange = await service.verifyAndAttachVtexSecrets(newVtexSecrets,context, trx);

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

    test("user should get vtex integration departments", async done => {

        const vtexSecrets = {
            xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
            xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
            accountName: "beightoneagency",
            organizationId: organizationCreated.id
        }

        await service.verifyAndAttachVtexSecrets(vtexSecrets,userToken, trx);

        const getVtexDepartmentsPayload = {
            organizationId: organizationCreated.id
        }

        const vtexDepartments = await service.getVtexDepartments(getVtexDepartmentsPayload, userToken, trx);

        expect(vtexDepartments).toBeDefined();

        done()

    })

    test("user should list vtex comission actived or inactived", async done => {

        const vtexSecrets = {
            xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
            xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
            accountName: "beightoneagency",
            organizationId: organizationCreated.id
        }

        await service.verifyAndAttachVtexSecrets(vtexSecrets,userToken, trx);

        await (trx || knexDatabase.knex)('organization_vtex_comission').insert({
            organization_id: organizationCreated.id,
            vtex_department_id: 1,
            vtex_commission_percentage: 15
        })

        const vtexDepartmentsCommissionsPayload = {
            organizationId: organizationCreated.id
        }

        const vtexCommissions = await service.getVtexDepartmentsCommissions(vtexDepartmentsCommissionsPayload, userToken, trx);

        expect(vtexCommissions).toEqual(
            expect.objectContaining(
                mockVtexDepartments.map(item => expect.objectContaining({
                    id: item.id,
                    name: item.name,
                    url: item.url,
                    active: item.id === 1,
                    percentage: item.id === 1 ? 15 : null
                }))
            )
        )

        done();

    })

    test("org admin should handle vtex comission and active", async done => {

        const vtexSecrets = {
            xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
            xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
            accountName: "beightoneagency",
            organizationId: organizationCreated.id
        }

        await service.verifyAndAttachVtexSecrets(vtexSecrets,userToken, trx);

        const handleOrganizationVtexComissionPayload = {
            organizationId: organizationCreated.id,
            vtexDepartmentId: "1",
            vtexCommissionPercentage: 15,
            active: true
        }

        const organizationVtexComissionAdded = await service.handleOrganizationVtexComission(handleOrganizationVtexComissionPayload, userToken, trx);

        expect(organizationVtexComissionAdded).toEqual(
            expect.objectContaining({
              id: expect.any(String),
              organizationId: organizationCreated.id,  
              vtexDepartmentId: handleOrganizationVtexComissionPayload.vtexDepartmentId,
              vtexCommissionPercentage: handleOrganizationVtexComissionPayload.vtexCommissionPercentage,
              active: handleOrganizationVtexComissionPayload.active,
              updatedAt: expect.any(Date),
              createdAt: expect.any(Date)
            })
        )

        const vtexDepartmentsCommissionsPayload = {
            organizationId: organizationCreated.id
        }

        const vtexCommissions = await service.getVtexDepartmentsCommissions(vtexDepartmentsCommissionsPayload, userToken, trx);

        expect(vtexCommissions).toEqual(
            expect.objectContaining(
                mockVtexDepartments.map(item => expect.objectContaining({
                    id: item.id,
                    name: item.name,
                    url: item.url,
                    active: item.id === 1,
                    percentage: item.id === 1 ? 15 : null
                }))
            )
        )

        done();

    })

    test("org admin should handle vtex comission to inactive", async done => {

        const vtexSecrets = {
            xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
            xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
            accountName: "beightoneagency",
            organizationId: organizationCreated.id
        }

        await service.verifyAndAttachVtexSecrets(vtexSecrets,userToken, trx);

        const handleOrganizationVtexComissionPayload = {
            organizationId: organizationCreated.id,
            vtexDepartmentId: "1",
            vtexCommissionPercentage: 15,
            active: true
        }

        await service.handleOrganizationVtexComission(handleOrganizationVtexComissionPayload, userToken, trx);

        const handleOrganizationVtexComissionDesactivePayload = {
            organizationId: organizationCreated.id,
            vtexDepartmentId: "1",
            vtexCommissionPercentage: 15,
            active: false
        }

        const organizationVtexComissionDesactived = await service.handleOrganizationVtexComission(handleOrganizationVtexComissionDesactivePayload, userToken, trx);

        expect(organizationVtexComissionDesactived).toEqual(
            expect.objectContaining({
              id: expect.any(String),
              organizationId: organizationCreated.id,  
              vtexDepartmentId: handleOrganizationVtexComissionPayload.vtexDepartmentId,
              vtexCommissionPercentage: handleOrganizationVtexComissionPayload.vtexCommissionPercentage,
              active: handleOrganizationVtexComissionDesactivePayload.active,
              updatedAt: expect.any(Date),
              createdAt: expect.any(Date)
            })
        )

        const vtexDepartmentsCommissionsPayload = {
            organizationId: organizationCreated.id
        }

        const vtexCommissions = await service.getVtexDepartmentsCommissions(vtexDepartmentsCommissionsPayload, userToken, trx);

        expect(vtexCommissions).toEqual(
            expect.objectContaining(
                mockVtexDepartments.map(item => expect.objectContaining({
                    id: item.id,
                    name: item.name,
                    url: item.url,
                    active: false,
                    percentage: item.id === 1 ? 15 : null
                }))
            )
        )

        done();

    })
  
});