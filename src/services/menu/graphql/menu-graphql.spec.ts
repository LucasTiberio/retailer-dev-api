process.env.NODE_ENV = 'test';
import knexDatabase from '../../../knex-database';
import Faker from 'faker';
import { IUserToken, ISignInAdapted } from "../../authentication/types";
import jwt from 'jsonwebtoken';
import { IOrganizationAdapted } from '../../organization/types';
const app = require('../../../app');
const request = require('supertest').agent(app);
import redisClient from '../../../lib/Redis';
import { createOrganizationPayload } from '../../../__mocks__';

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

const CREATE_ORGANIZATION = `
    mutation createOrganization($input: CreateOrganizationInput!) {
        createOrganization(input: $input){
            id
            contactEmail
            name
            active
            updatedAt
            createdAt
            user{
                id
            }
        }
    }
`

const MENU_TREE = `
    query menuTree{
        menuTree{
            group
            items{
                name
                slug
                children{
                    name
                    slug
                    children{
                        name
                        slug
                    }
                }
            }
        }
    }
`

const SET_CURRENT_ORGANIZATION = `
    mutation setCurrentOrganization($input: SetCurrentOrganizationInput!) {
        setCurrentOrganization(input: $input)
    }
`

describe('services graphql', () => {

    let signUpCreated: ISignInAdapted;

    let userClient: IUserToken;

    let userToken: string;

    let organizationCreated: IOrganizationAdapted;

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

        userClient = { origin: 'user', id: signUpCreated.id };

        userToken = await jwt.sign(userClient, process.env.JWT_SECRET);

        const [userFromDb] = await knexDatabase.knexConfig('users').where('id', signUpCreated.id).select('verification_hash');

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

        const createOrganizationResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
        'query': CREATE_ORGANIZATION, 
        'variables': {
                input: createOrganizationPayload()
            }
        });

        organizationCreated = createOrganizationResponse.body.data.createOrganization;

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await redisClient.flushall('ASYNC');
        await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
        'query': SET_CURRENT_ORGANIZATION, 
        'variables': {
                input: currentOrganizationPayload
            }
        });
    });

    afterAll(async () => {
        await knexDatabase.cleanMyTestDB();
        await redisClient.end();
    })

    test("user should get menu three", async done => {

        const menuTreeResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
        'query': MENU_TREE
        });

        expect(menuTreeResponse.statusCode).toBe(200);
        expect(menuTreeResponse.body.data.menuTree).toEqual(expect.arrayContaining([
            {
                group: 'menu-items',
                items: [
                    {
                        name: 'overview',
                        slug: '/overview',
                        children: null
                    },{
                        name: 'settings',
                        slug: '/settings',
                        children: null
                    },
                    {
                        name: 'integrations',
                        slug: '/integrations',
                        children: null
                    }
                ]
            },
            {
                group: 'services',
                items: [
                    {
                        name: 'affiliate',
                        slug: null,
                        children: [
                            {
                                name: 'orders',
                                children: null,
                                slug: '/affiliate/orders',
                            },
                            {
                                name: 'commission',
                                children: null,
                                slug: '/affiliate/commission',
                            }, 
                            {
                                name: 'members',
                                children: null,
                                slug: '/affiliate/members',
                            },
                            {
                                name: 'payments',
                                children: null,
                                slug: '/affiliate/payments',
                            }
                        ]
                    }
                ]
            }
        ]))

        done();

    })
});