process.env.NODE_ENV = 'test';
import service from './service';
import UserService from '../users/service';
import OrganizationService from '../organization/service';
import Faker from 'faker';
import database from '../../knex-database';
import { Transaction } from 'knex';
import { ISignUpAdapted } from '../users/types';
import { IUserToken } from '../authentication/types';
import { Services, IServiceAdaptedFromDB, IServiceAdapted, ServiceRoles } from './types';
import { IOrganizationAdapted, OrganizationInviteStatus, IUserOrganizationAdapted } from '../organization/types';
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
    let serviceFound: IServiceAdaptedFromDB;

    beforeAll(async () => {
        trx = await database.knex.transaction(); 

        const [serviceFoundDB] = await (trx || knexDatabase.knex)('services').where('name', Services.AFFILIATE).select('id');
        serviceFound = serviceFoundDB
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
        await trx('users_organizations').del();
        await trx('organization_services').del();
        await trx('organizations').del();
        await trx('users').del();
        signUpCreated = await UserService.signUp(signUpPayload, trx);
        userToken = { origin: 'user', id: signUpCreated.id };
        organizationCreated = await OrganizationService.createOrganization(createOrganizationPayload, userToken, trx);
        const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', signUpCreated.id).select('verification_hash');
        await UserService.verifyEmail(userFromDb.verification_hash, trx);
    })

    test("user should create new service in organization", async done => {

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

    test("organization admin should list services", async done => {

        const servicesFound = await (trx || knexDatabase.knex)('services').select('id', 'name');

        const listServices = await service.listUsedServices(organizationCreated.id ,userToken, trx);

        expect(listServices).toEqual(
            expect.arrayContaining(
                servicesFound.map(service => 
                    expect.objectContaining({
                        id: service.id,
                        name: service.name,
                        active: true,
                        updatedAt: expect.any(Date),
                        createdAt: expect.any(Date)
                    })
                )
            )
        )

        done();
    });

    describe('services with service organization attached', () => {

        let serviceFound : IServiceAdaptedFromDB;

        beforeEach(async () => {
            const [serviceFoundDB] = await (trx || knexDatabase.knex)('services').where('name', Services.AFFILIATE).select('id');
            serviceFound = serviceFoundDB
            await service.createServiceInOrganization(serviceFound.id, organizationCreated.id, userToken, trx);
        })

        test('organization admin should added member on service', async done => {

            let otherSignUpPayload = {
                username: Faker.name.firstName(),
                email: Faker.internet.email(),
                password: Faker.internet.password()
            }

            let otherSignUpCreated = await UserService.signUp(otherSignUpPayload, trx);
            const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', otherSignUpCreated.id).select('verification_hash');
            await UserService.verifyEmail(userFromDb.verification_hash, trx);

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

            const newMemberOnOrgazationService = await service.addUserInOrganizationService(addUserInOrganizationServicePayload, userToken, trx);

            const [serviceRoles] = await (trx || knexDatabase)('service_roles').where('name', ServiceRoles.ANALYST).select('id');

            expect(newMemberOnOrgazationService).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    serviceRolesId:serviceRoles.id,
                    usersOrganizationId: invitedUserToOrganization.id,
                    serviceId: serviceFound.id,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date),
                })
            )
    
            done();
        })

    })

        
});