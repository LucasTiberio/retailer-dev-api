process.env.NODE_ENV = 'test';
import service from './service';
import UserService from '../users/service';
import OrganizationService from '../organization/service';
import Faker from 'faker';
import database from '../../knex-database';
import { Transaction } from 'knex';
import { ISignUpAdapted } from '../users/types';
import { IUserToken } from '../authentication/types';
import { Services } from './types';
import { IOrganizationAdapted } from '../organization/types';
import knexDatabase from '../../knex-database';

describe('Services', () => {

    let trx : Transaction;

    let signUpCreated: ISignUpAdapted;

    
    let signUpPayload = {
        username: Faker.name.firstName(),
        email: Faker.internet.email(),
        password: Faker.internet.password()
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
        await trx('users_organization_roles').del();
        await trx('organization_services').del();
        await trx('organizations').del();
        await trx('users').del();
        signUpCreated = await UserService.signUp(signUpPayload, trx);
        userToken = { origin: 'user', id: signUpCreated.id };
        organizationCreated = await OrganizationService.createOrganization(createOrganizationPayload, userToken, trx);
    })

    test("user should create new service in organization", async done => {

        const [serviceFound] = await (trx || knexDatabase.knex)('services').where('name', Services.AFFILIATE).select('id');

        const serviceInOrganizationCreated = await service.createServiceInOrganization(serviceFound.id, organizationCreated.id, userToken, trx);

        expect(serviceInOrganizationCreated).toBeTruthy();

        const organizationService = await (trx || database.knex)('organization_services').select();
        
        expect(organizationService).toHaveLength(1);
        expect(organizationService[0]).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                service_id: serviceFound.id,
                organization_id: organizationCreated.id,
                updated_at: expect.any(Date),
                created_at: expect.any(Date)
            })
        )

        done();
    })
        
});