process.env.NODE_ENV = 'test';
import Faker from 'faker';
import { IUserToken, ISignInAdapted } from "../../authentication/types";
import jwt from 'jsonwebtoken';
import knexDatabase from '../../../knex-database';
import { PermissionGrant, PermissionName } from '../types';
import common from '../../../common';
import redisClient from '../../../lib/Redis';
import { IOrganizationAdapted, OrganizationRoles } from '../../organization/types';
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

const SET_CURRENT_ORGANIZATION = `
    mutation setCurrentOrganization($input: SetCurrentOrganizationInput!) {
        setCurrentOrganization(input: $input)
    }
`

const USER_ORGANIZATION_PERMISSIONS = `
    query userOrganizationPermissions($input: UserOrganizationPermissionsInput){
        userOrganizationPermissions(input: $input){
            id
            permissionName
            organizationRoleName
            grant
        }
    }
`

describe('organizations graphql', () => {

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

        const createOrganizationPayload = {
            name: Faker.internet.userName(),
            contactEmail: Faker.internet.email()
        }

        const createOrganizationResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
        'query': CREATE_ORGANIZATION, 
        'variables': {
                input: createOrganizationPayload
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

    test('user organization should get your permissions', async done => {

        const userOrganizationPermissionsResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
            'query': USER_ORGANIZATION_PERMISSIONS, 
        });

        let permissions = [
            "settings",
            "members" ,
            "integrations" ,
            "affiliate"
        ];

        expect(userOrganizationPermissionsResponse.statusCode).toBe(200);
        expect(userOrganizationPermissionsResponse.body.data.userOrganizationPermissions).toEqual(
            expect.arrayContaining(
                permissions.map((item) => expect.objectContaining({
                    permissionName: item,
                    organizationRoleName: OrganizationRoles.ADMIN,
                    grant: PermissionGrant.write
                }))
            )
        );

        done();
    });

    test('user organization should get your permissions by name', async done => {

        const userOrganizationPermissionsPayload = {
            name: PermissionName.integrations
        }

        const userOrganizationPermissionsResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
            'query': USER_ORGANIZATION_PERMISSIONS, 
            'variables': {
                input: userOrganizationPermissionsPayload
            }
        });

        expect(userOrganizationPermissionsResponse.statusCode).toBe(200);
        expect(userOrganizationPermissionsResponse.body.data.userOrganizationPermissions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    permissionName: userOrganizationPermissionsPayload.name,
                    organizationRoleName: OrganizationRoles.ADMIN,
                    grant: PermissionGrant.write
                })
            ])
        );

        done();
    });

});