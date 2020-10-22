process.env.NODE_ENV = 'test';
import UserService from '../users/service';
import service from './service';
import Faker from 'faker';
import database from '../../knex-database';
import { Transaction } from 'knex';
import common from '../../common'
import { ISignUpAdapted } from '../users/types';

describe('Authentication', () => {

    let trx : Transaction;

    beforeAll(async () => {
        trx = await database.knexConfig.transaction(); 
    });

    afterAll(async () => {
        await trx.rollback();
        await trx.destroy();
        return new Promise(resolve => {
            resolve();
        }); 
    });

    afterEach(async () => {
        await trx('users').del();
    })

    describe("authentication tets with user before created", () => {

        let signUpCreated: ISignUpAdapted;
        
        let signUpPayload = {
            username: Faker.name.firstName(),
            email: Faker.internet.email(),
            password: "B8oneTeste123!"
        }

        beforeEach(async () => {

            signUpCreated = await UserService.signUp(signUpPayload, trx);
        });

        test("user should verify your sign up", async done => {

            const [userFromDb] = await (trx || database.knexConfig)('users').where('id', signUpCreated.id).select('verification_hash');

            await UserService.verifyEmail(userFromDb.verification_hash, trx);

            const signInPayload = {
                email: signUpPayload.email,
                password: "B8oneTeste123!"
            }

            const signIn = await service.signIn(signInPayload, trx);

            expect(signIn).toEqual(
                expect.objectContaining({
                    token: expect.any(String),
                    user: expect.objectContaining({
                        id: expect.any(String),
                        username: signUpPayload.username,
                        email: signUpPayload.email
                    })
                })
            )

            const userOnDb = await (trx || database.knexConfig)('users').where('id', signUpCreated.id).select();

            expect(userOnDb).toHaveLength(1);
            expect(userOnDb[0]).toEqual(
                expect.objectContaining({
                    username: signUpCreated.username,
                    email: signUpCreated.email,
                    verified: true,
                    verification_hash: null
                })
            )
            
            done();
        })

    })

        
});