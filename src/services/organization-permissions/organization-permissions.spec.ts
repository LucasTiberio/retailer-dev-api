process.env.NODE_ENV = 'test';
import service from './service';
import UserService from '../users/service';
import VtexService from '../vtex/service';
import OrganizationService from '../organization/service';
import Faker from 'faker';
import { Transaction } from 'knex';
import { ISignUpAdapted } from '../users/types';
import { IUserToken } from '../authentication/types';
import knexDatabase from '../../knex-database';
import redisClient from '../../lib/Redis';
import { IContext } from '../../common/types';
import { OrganizationRoles, IOrganizationAdapted } from '../organization/types';
import { PermissionGrant, PermissionName } from './types';
import { PaymentMethod } from '../payments/types';
import { createOrganizationPayload } from '../../__mocks__';
import { Services, ServiceRoles } from '../services/types';

describe('Organization Permissions', () => {

    let trx : Transaction;

    let signUpCreated: ISignUpAdapted;

    let signUpPayload = {
        username: Faker.name.firstName(),
        email: Faker.internet.email(),
        password: "B8oneTeste123!"
    }
    
    let userToken : IUserToken;

    let context : IContext;

    let organizationCreated: IOrganizationAdapted

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
        await trx('organization_services').del();
        await trx('users_organization_roles').del();
        await trx('users_organizations').del();
        await trx('organizations').del();
        await trx('users').del();
        await redisClient.flushall('ASYNC');
        signUpCreated = await UserService.signUp(signUpPayload, trx);
        userToken = { origin: 'user', id: signUpCreated.id };

        organizationCreated = await OrganizationService.createOrganization(createOrganizationPayload(), {client: userToken, redisClient}, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await OrganizationService.setCurrentOrganization(currentOrganizationPayload, {client: userToken, redisClient}, trx);

        context = {client: userToken, organizationId: organizationCreated.id}
    })

    test('user organization admin should get your permissions', async done => {

        const userOrganizationPermission = await service.userOrganizationPermissions({},context, trx);

        let permissions = [
            "settings",
            "members" ,
            "integrations" ,
            "affiliate"
        ];

        expect(userOrganizationPermission).toEqual(
            expect.arrayContaining(
                permissions.map((item) => expect.objectContaining({
                    id: expect.any(String),
                    permissionName: item,
                    organizationRoleName: OrganizationRoles.ADMIN,
                    grant: PermissionGrant.write
                }))
            )
        );

        done();
    })

    test('user organization admin should get your permissions by name', async done => {

        const userOrganizationPermissionsPayload = {
            name: PermissionName.integrations
        }

        const userOrganizationPermission = await service.userOrganizationPermissions(userOrganizationPermissionsPayload,context, trx);

        expect(userOrganizationPermission).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    permissionName: userOrganizationPermissionsPayload.name,
                    organizationRoleName: OrganizationRoles.ADMIN,
                    grant: PermissionGrant.write
                })
            ])
        );

        done();
    })

    test('user organization member should get your permissions', async done => {

        let permissions = [
            "settings",
            "members" ,
            "integrations" ,
            "affiliate"
        ];

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
            users: [{
                email: otherSignUpCreated.email,
                services: [{
                    name: Services.AFFILIATE,
                    role: ServiceRoles.ANALYST
                }]
            }]
        }

        await OrganizationService.inviteUserToOrganization(inviteUserToOrganizationPayload, context, trx);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        let otherUserToken = { origin: 'user', id: otherSignUpCreated.id };

        await OrganizationService.setCurrentOrganization(currentOrganizationPayload, {client: otherUserToken, redisClient}, trx);

        let otherContext = {client: otherUserToken, organizationId: organizationCreated.id}

        const userOrganizationPermission = await service.userOrganizationPermissions({}, otherContext, trx);

        expect(userOrganizationPermission).toEqual(
            expect.arrayContaining(
                permissions.map((item) => expect.objectContaining({
                    id: expect.any(String),
                    permissionName: item,
                    organizationRoleName: OrganizationRoles.MEMBER,
                    grant: PermissionGrant.hide
                }))
            )
        );

        done();
    })

});