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
        trx = await knexDatabase.knexConfig.transaction(); 
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
            "integrations",
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

});