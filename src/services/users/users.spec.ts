process.env.NODE_ENV = 'test';
import service from './service';
import Faker from 'faker';
import database from '../../knex-database';
import { Transaction } from 'knex';
import common from '../../common'
import { ISignUpAdapted } from './types';

describe('Users', () => {

    let trx : Transaction;

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
        await trx('organizations').del();
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

        const userOnDb = await (trx || database.knex)('users').select();

        expect(userOnDb).toHaveLength(1);
        expect(userOnDb[0]).toEqual(
            expect.objectContaining({
                username: signUpPayload.username,
                email: signUpPayload.email,
                encrypted_password: expect.any(String),
                verified: false,
                verification_hash: expect.any(String)
            })
        )
        expect(common.passwordIsCorrect(signUpPayload.password, userOnDb[0].encrypted_password)).toBeTruthy();

        done();
    })

    test("user not should create duplicate account", async done => {

        const signUpPayload = {
            username: Faker.name.firstName(),
            email: Faker.internet.email(),
            password: Faker.internet.password()
        }

        await service.signUp(signUpPayload, trx);

        try {
            await service.signUp(signUpPayload, trx);
        } catch(e){
            expect(e.message).toBe("user already registered.");
        }

        const userOnDb = await (trx || database.knex)('users').select();

        expect(userOnDb).toHaveLength(1);
        expect(userOnDb[0]).toEqual(
            expect.objectContaining({
                username: signUpPayload.username,
                email: signUpPayload.email,
                encrypted_password: expect.any(String),
                verified: false,
                verification_hash: expect.any(String)
            })
        )
        expect(common.passwordIsCorrect(signUpPayload.password, userOnDb[0].encrypted_password)).toBeTruthy();

        done();

    })

    describe("tets with user before created", () => {

        let signUpCreated: ISignUpAdapted;

        beforeEach(async () => {

            const signUpPayload = {
                username: Faker.name.firstName(),
                email: Faker.internet.email(),
                password: Faker.internet.password()
            }

            signUpCreated = await service.signUp(signUpPayload, trx);
        });

        test("user should verify your sign up", async done => {

            const [userFromDb] = await (trx || database.knex)('users').where('id', signUpCreated.id).select('verification_hash');

            const userVerified = await service.verifyEmail(userFromDb.verification_hash, trx);

            expect(userVerified).toBeTruthy();

            const userOnDb = await (trx || database.knex)('users').where('id', signUpCreated.id).select();

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

        test("user should recovery your password", async done => {

            const userPasswordRecoveredMailSent = await service.recoveryPassword(signUpCreated.email, trx);
            
            expect(userPasswordRecoveredMailSent).toBeTruthy();

            const userOnDb = await (trx || database.knex)('users').where('id', signUpCreated.id).select();

            expect(userOnDb).toHaveLength(1);
            expect(userOnDb[0]).toEqual(
                expect.objectContaining({
                    username: signUpCreated.username,
                    email: signUpCreated.email,
                    verification_hash: expect.any(String)
                })
            )
            
            done();
        })

        test("user should recovery and change your password", async done => {

            await service.recoveryPassword(signUpCreated.email, trx);

            const [userFound] = await (trx || database.knex)('users').where('id', signUpCreated.id).select();

            const newPassword = Faker.internet.password();

            const userPasswordChanged = await service.changePassword({hash: userFound.verification_hash, password: newPassword}, trx)
            
            expect(userPasswordChanged).toBeTruthy();

            const userOnDb = await (trx || database.knex)('users').where('id', signUpCreated.id).select();

            expect(userOnDb).toHaveLength(1);
            expect(userOnDb[0]).toEqual(
                expect.objectContaining({
                    username: signUpCreated.username,
                    email: signUpCreated.email,
                    verification_hash: null,
                    encrypted_password: expect.any(String)
                })
            )
            expect(common.passwordIsCorrect(newPassword, userOnDb[0].encrypted_password)).toBeTruthy();
            
            done();
        })
    })

        
});