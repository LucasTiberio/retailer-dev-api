process.env.NODE_ENV = 'test';
import service from './service';
import UserService from '../users/service';
import Faker from 'faker';
import { Transaction } from 'knex';
import { ISignUpAdapted } from '../users/types';
import { IUserToken } from '../authentication/types';
import knexDatabase from '../../knex-database';
import { IOrganizationAdapted } from '../organization/types';
import OrganizationService from '../organization/service';
import {brazilBanksMock} from './helpers';
import { IServiceAdaptedFromDB, Services } from '../services/types';
import { IContext } from '../../common/types';
import redisClient from '../../lib/Redis';
import { createOrganizationPayload } from '../../__mocks__';

describe('Bank Data', () => {

    let trx : Transaction;

    let signUpCreated: ISignUpAdapted;

    
    let signUpPayload = {
        username: Faker.name.firstName(),
        email: Faker.internet.email(),
        password: "B8oneTeste123!"
    }
    
    let userToken : IUserToken;
    let organizationCreated: IOrganizationAdapted;
    let serviceFound: IServiceAdaptedFromDB;
    let context: IContext;

    beforeAll(async () => {
        trx = await knexDatabase.knex.transaction(); 

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
        await trx('affiliate_vtex_campaign').del();
        await trx('organization_vtex_secrets').del();
        await trx('users_organization_service_roles').del();
        await trx('users_organization_roles').del();
        await trx('users_organizations').del();
        await trx('organization_services').del();
        await trx('organizations').del();
        await trx('users').del();
        signUpCreated = await UserService.signUp(signUpPayload, trx);
        userToken = { origin: 'user', id: signUpCreated.id };
        organizationCreated = await OrganizationService.createOrganization(createOrganizationPayload(), {client: userToken, redisClient}, trx);
        const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', signUpCreated.id).select('verification_hash');
        await UserService.verifyEmail(userFromDb.verification_hash, trx);
        context = {client: userToken, organizationId: organizationCreated.id};
    })

    test("get brazil bank values", async done => {

        const brazilBanks = await service.getBrazilBanks({}, context, trx);

        expect(brazilBanks).toEqual(
            expect.arrayContaining(
                brazilBanksMock.map(item => expect.objectContaining({
                    id: expect.any(String),
                    ...item,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date)
                }))
            )
        )

        done();
    });

    test("get brazil bank values by name", async done => {

        const getBrazilBanksPayload = {
            name: "Nu Pagamentos"
        }

        const brazilBanks = await service.getBrazilBanks(getBrazilBanksPayload, context, trx);

        const nuObject = {
            "code": "260",
            "name": "Nu Pagamentos S.A."
        }

        expect(brazilBanks).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    ...nuObject,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date)
                })
            ])
        )

        done();
    });

    test("get brazil bank values by code", async done => {

        const getBrazilBanksPayload = {
            name: "260"
        }

        const brazilBanks = await service.getBrazilBanks(getBrazilBanksPayload, context, trx);

        const nuObject = {
            "code": "260",
            "name": "Nu Pagamentos S.A."
        }

        expect(brazilBanks).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    ...nuObject,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date)
                })
            ])
        )

        done();
    });

    test("user should create bank values", async done => {

        const getBrazilBanksPayload = {
            name: "260"
        }

        const brazilBanks = await service.getBrazilBanks(getBrazilBanksPayload, context, trx);

        const createUserBankValuesPayload = {
            name: Faker.name.firstName(),
            agency: "0000",
            account: "00000",
            accountDigit: "0",
            document: "000000000000",
            brazilBankId: brazilBanks[0].id
        }

        const userBankValuesCreated = await service.createBankValues(createUserBankValuesPayload, context, trx);

        expect(userBankValuesCreated).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                name: createUserBankValuesPayload.name,
                agency: createUserBankValuesPayload.agency,
                account: createUserBankValuesPayload.account,
                accountDigit: createUserBankValuesPayload.accountDigit,
                document: createUserBankValuesPayload.document,
                brazilBankId: expect.any(String),
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date)
            })
        )

        done();
    });

    test("user should update bank values", async done => {

        const getBrazilBanksPayload = {
            name: "479"
        }

        const brazilBanks = await service.getBrazilBanks(getBrazilBanksPayload, context, trx);

        const createUserBankValuesPayload = {
            name: Faker.name.firstName(),
            agency: "0000",
            account: "00000",
            accountDigit: "0",
            document: "000000000000",
            brazilBankId: brazilBanks[0].id
        }

        const createdBankValues = await service.createBankValues(createUserBankValuesPayload, context, trx);

        const updateUserBankValuesPayload = {
            bankDataId: createdBankValues.id,
            name: createUserBankValuesPayload.name,
            agency: "1111",
            account: "11111",
            accountDigit: "1",
            document: "11111111111",
            brazilBankId: brazilBanks[0].id
        }

        const userBankValuesUpdated = await service.updateBankValues(updateUserBankValuesPayload, context, trx);

        expect(userBankValuesUpdated).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                name: updateUserBankValuesPayload.name,
                agency: updateUserBankValuesPayload.agency,
                account: updateUserBankValuesPayload.account,
                accountDigit: updateUserBankValuesPayload.accountDigit,
                document: updateUserBankValuesPayload.document,
                brazilBankId: expect.any(String),
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date)
            })
        )

        done();
    });

});