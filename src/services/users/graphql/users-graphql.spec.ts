import common from "../../../common";

process.env.NODE_ENV = 'test';
import database from '../../../knex-database';
import Faker from 'faker';
import { ISignUpAdapted } from "../types";
const app = require('../../../app');
const request = require('supertest').agent(app);
const cleanMyTestDB = require('../../../knex-database').cleanMyTestDB;

const SIGN_UP = `
    mutation signUp($input: SignUpInput!) {
        signUp(input: $input) {
            id
            email
            username
        }
    }
`

const USER_VERIFY_EMAIL = `
    mutation userVerifyEmail($input: UserVerifyEmailInput!) {
        userVerifyEmail(input: $input)
    }
`

const USER_RECOVERY_PASSWORD = `
    mutation userRecoveryPassword($input: UserRecoveryPasswordInput!) {
        userRecoveryPassword(input: $input)
    }
`

const USER_PASSWORD_CHANGE = `
    mutation userPasswordChange($input: UserPasswordChangeInput!) {
        userPasswordChange(input: $input)
    }
`

describe('users graphql', () => {

    afterAll(async () => {
        await cleanMyTestDB();
    });

    test("should create new user", async done => {

        const signUpPayload = {
            username: Faker.name.firstName(),
            email: Faker.internet.email(),
            password: "B8oneTeste123!"
        }

        const signUpResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .send({
        'query': SIGN_UP, 
        'variables': {
                input: signUpPayload
            }
        });

        expect(signUpResponse.statusCode).toBe(200);
        expect(signUpResponse.body.data.signUp).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                username: signUpPayload.username,
                email: signUpPayload.email
            })    
        );

        const userOnDb = await database.knexConfig('users').where("id", signUpResponse.body.data.signUp.id).select();

        expect(userOnDb).toHaveLength(1);
        expect(userOnDb[0]).toEqual(
            expect.objectContaining({
                id: signUpResponse.body.data.signUp.id,
                username: signUpResponse.body.data.signUp.username,
                email: signUpResponse.body.data.signUp.email,
                encrypted_password: expect.any(String),
                verified: false,
                verification_hash: expect.any(String)
            })
        )
        expect(common.passwordIsCorrect(signUpPayload.password, userOnDb[0].encrypted_password)).toBeTruthy();
        
        done();
    })

    describe("tets with user before created graphql", () => {

        let signUpCreated: ISignUpAdapted;

        beforeEach(async () => {

            const signUpPayload = {
                username: Faker.name.firstName(),
                email: Faker.internet.email(),
                password: "B8oneTeste123!"
            }

            const signUpResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .send({
            'query': SIGN_UP, 
            'variables': {
                    input: signUpPayload
                }
            });

            signUpCreated = signUpResponse.body.data.signUp
        });

        test("user should verify your sign up graphql", async done => {

            const [userFromDb] = await database.knexConfig('users').where('id', signUpCreated.id).select('verification_hash');

            const userVerifyEmailPayload = {
                verificationHash: userFromDb.verification_hash
            }

            const userVerifyEmailResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .send({
            'query': USER_VERIFY_EMAIL, 
            'variables': {
                    input: userVerifyEmailPayload
                }
            });

            expect(userVerifyEmailResponse.statusCode).toBe(200);
            expect(userVerifyEmailResponse.body.data.userVerifyEmail).toBeTruthy();

            const userOnDb = await database.knexConfig('users').where('id', signUpCreated.id).select();

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

            const userRecoveryPasswordPayload = {
                email: signUpCreated.email
            }

            const userRecoveryPasswordResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .send({
            'query': USER_RECOVERY_PASSWORD, 
            'variables': {
                    input: userRecoveryPasswordPayload
                }
            });
            
            expect(userRecoveryPasswordResponse.statusCode).toBe(200);
            expect(userRecoveryPasswordResponse.body.data.userRecoveryPassword).toBeTruthy();

            const userOnDb = await database.knexConfig('users').where('id', signUpCreated.id).select();

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

            const userRecoveryPasswordPayload = {
                email: signUpCreated.email
            }

            await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .send({
            'query': USER_RECOVERY_PASSWORD, 
            'variables': {
                    input: userRecoveryPasswordPayload
                }
            });

            const [userFound] = await database.knexConfig('users').where('id', signUpCreated.id).select();

            const newPassword = "B8oneTeste12345!"

            const userPasswordChangedPayload = {
                hash: userFound.verification_hash, 
                password: newPassword
            }

            const userPasswordChangedResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .send({
            'query': USER_PASSWORD_CHANGE, 
            'variables': {
                    input: userPasswordChangedPayload
                }
            });

            expect(userPasswordChangedResponse.statusCode).toBe(200);
            expect(userPasswordChangedResponse.body.data.userPasswordChange).toBeTruthy();

            const userOnDb = await database.knexConfig('users').where('id', signUpCreated.id).select();

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

    });
});