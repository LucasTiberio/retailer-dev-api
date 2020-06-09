process.env.NODE_ENV = 'test';
import Faker from 'faker';
import { IUserToken, ISignInAdapted } from "../../authentication/types";
import jwt from 'jsonwebtoken';
import knexDatabase from '../../../knex-database';
import { brazilBanksMock } from '../helpers';
const app = require('../../../app');
const request = require('supertest').agent(app);

declare var process : {
	env: {
      NODE_ENV: "production" | "development" | "test"
      JWT_SECRET: string
	}
}

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

const GET_BRAZIL_BANKS = `
    query getBrazilBanks($input: GetBrazilBanksInput) {
        getBrazilBanks(input: $input){
            id
            name
            code
            createdAt
            updatedAt
        }
    }
`

describe('organizations graphql', () => {

    let signUpCreated: ISignInAdapted;

    let userClient: IUserToken;

    let userToken: string;

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

        const [userFromDb] = await knexDatabase.knex('users').where('id', signUpCreated.id).select('verification_hash');

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
        
        userClient = { origin: 'user', id: signUpCreated.id };

        userToken = await jwt.sign(userClient, process.env.JWT_SECRET);

    });

    afterAll(async () => {
        await knexDatabase.cleanMyTestDB();
    })

    test("user should create new organization", async done => {
        
        const getBrazilBanksResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
        'query': GET_BRAZIL_BANKS
        });

        expect(getBrazilBanksResponse.statusCode).toBe(200);
        expect(getBrazilBanksResponse.body.data.getBrazilBanks).toEqual(
            expect.arrayContaining(
                brazilBanksMock.map(item => expect.objectContaining({
                    id: expect.any(String),
                    ...item,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String)
                }))
            )
        )

        done();
    })

});