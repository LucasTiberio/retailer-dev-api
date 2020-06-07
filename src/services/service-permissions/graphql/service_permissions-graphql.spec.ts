process.env.NODE_ENV = 'test';
import Faker from 'faker';
import { IUserToken, ISignInAdapted } from "../../authentication/types";
import jwt from 'jsonwebtoken';
import knexDatabase from '../../../knex-database';
import { PermissionGrant, ServicePermissionName } from '../types';
import common from '../../../common';
import redisClient from '../../../lib/Redis';
import { IOrganizationAdapted, OrganizationRoles } from '../../organization/types';
import { Services, ServiceRoles } from '../../services/types';
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

const USER_SERVICE_PERMISSIONS = `
    query userServicePermissions($input: UserServicePermissionsInput!){
        userServicePermissions(input: $input){
            id
            permissionName
            serviceRoleName
            grant
            service{
                id
                name
            }
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

    test('user organization should get your service permissions', async done => {

        const userServicePermissionsPayload = { serviceName: Services.AFFILIATE }

        const userServicePermissionsResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
            'query': USER_SERVICE_PERMISSIONS,
            'variables': {
                input: userServicePermissionsPayload
            }
        });

        const [serviceByName] = await knexDatabase.knex('services').where('name', Services.AFFILIATE).select('id', 'name');

        let permissions = [
            "commission",
            "orders" ,
            "generateLink"
        ];

        expect(userServicePermissionsResponse.statusCode).toBe(200);
        expect(userServicePermissionsResponse.body.data.userServicePermissions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    permissionName: permissions[0],
                    serviceRoleName: ServiceRoles.ADMIN,
                    grant: PermissionGrant.write,
                    service: expect.objectContaining({
                        id: serviceByName.id,
                        name: serviceByName.name
                    })
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    permissionName: permissions[1],
                    serviceRoleName: ServiceRoles.ADMIN,
                    grant: PermissionGrant.read,
                    service: expect.objectContaining({
                        id: serviceByName.id,
                        name: serviceByName.name
                    })
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    permissionName: permissions[2],
                    serviceRoleName: ServiceRoles.ADMIN,
                    grant: PermissionGrant.hide,
                    service: expect.objectContaining({
                        id: serviceByName.id,
                        name: serviceByName.name
                    })
                })
                ]
            )
        );

        done();
    });

});