process.env.NODE_ENV = 'test';
import service from './service';
import Faker from 'faker';
import knex from '../../knex-database';
import { Transaction } from 'knex';
import common from '../../common'

describe('Authentication', () => {

    let trx : Transaction;

    beforeAll(async () => {
        trx = await knex.knexTest.transaction(); 
    });

    afterAll(async () => {
        await trx.rollback();
        await trx.destroy();
        return new Promise(resolve => {
            resolve();
        }); 
    });


    beforeEach(async () => {
        await trx('users').del();
    })

    test("should create new user", async done => {

        const signUpPayload = {
            username: Faker.name.firstName(),
            email: Faker.internet.email(),
            password: Faker.internet.password()
        }

        const signUpCreated = await service.signUp(signUpPayload, trx);

        expect(signUpCreated).toEqual(
            expect.objectContaining({
                username: signUpPayload.username,
                email: signUpPayload.email
            })    
        );

        const userOnDb = await (trx || knex)('users').select();

        expect(userOnDb).toHaveLength(1);
        expect(userOnDb[0]).toEqual(
            expect.objectContaining({
                username: signUpPayload.username,
                email: signUpPayload.email,
                encrypted_password: expect.any(String)
            })
        )
        expect(common.passwordIsCorrect(signUpPayload.password, userOnDb[0].encrypted_password)).toBeTruthy();

        done();
    })
        
});