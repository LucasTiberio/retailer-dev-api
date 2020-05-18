process.env.NODE_ENV = 'test';
import database from '../../../knex-database';
import Faker from 'faker';
import { ISignUpAdapted } from "../../users/types";
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

const SIGN_IN = `
    mutation signIn($input: SignInInput!) {
        signIn(input: $input) {
            token
            user{
                id
                username
                email
            }
        }
    }
`

const USER_VERIFY_EMAIL = `
    mutation userVerifyEmail($input: UserVerifyEmailInput!) {
        userVerifyEmail(input: $input)
    }
`

describe('authentication graphql', () => {

    afterAll(async () => {
        await cleanMyTestDB();
    });

    describe("tets with user before created graphql", () => {

        let signUpCreated: ISignUpAdapted;

        const signUpPayload = {
            username: Faker.name.firstName(),
            email: Faker.internet.email(),
            password: "B8oneTeste123!"
        }

        beforeEach(async () => {

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

        test("user should sign in graphql", async done => {

            const [userFromDb] = await database.knex('users').where('id', signUpCreated.id).select('verification_hash');

            const userVerifyEmailPayload = {
                verificationHash: userFromDb.verification_hash
            }

            await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .send({
            'query': USER_VERIFY_EMAIL, 
            'variables': {
                    input: userVerifyEmailPayload
                }
            });

            const signInPayload = {
                password: "B8oneTeste123!",
                email: signUpPayload.email
            }

            const signInResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .send({
            'query': SIGN_IN, 
            'variables': {
                    input: signInPayload
                }
            });

            expect(signInResponse.statusCode).toBe(200);
            expect(signInResponse.body.data.signIn).toEqual(
                expect.objectContaining({
                    token: expect.any(String),
                    user: expect.objectContaining({
                        id: expect.any(String),
                        username: signUpCreated.username,
                        email: signUpCreated.email
                    })
                })
            );

            const userOnDb = await database.knex('users').where('id', signUpCreated.id).select();

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

    });
});