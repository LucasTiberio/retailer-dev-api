process.env.NODE_ENV = 'test';
import knexDatabase from '../../../knex-database';
import Faker from 'faker';
import { IUserToken, ISignInAdapted } from "../../authentication/types";
import jwt from 'jsonwebtoken';
import { IOrganizationAdapted, IOrganizationFromDB } from '../../organization/types';
import redisClient from '../../../lib/Redis';
import { mockVtexDepartments } from '../__mocks__';
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

const VERIFY_AND_ATTACH_VTEX_SECRETS_RESPONSE = `
    mutation verifyAndAttachVtexSecrets($input: VerifyAndAttachVtexSecretsInput!) {
        verifyAndAttachVtexSecrets(input: $input)
    }
`

const SET_CURRENT_ORGANIZATION = `
    mutation setCurrentOrganization($input: SetCurrentOrganizationInput!) {
        setCurrentOrganization(input: $input)
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

const VTEX_DEPARTMENTS_COMMISSIONS = `
    query vtexDepartmentsCommissions{
        vtexDepartmentsCommissions{
            id
            name
            url
            active
            percentage
        }
    }
`

const HANDLE_ORGANIZATION_VTEX_COMMISSION = `
    mutation handleOrganizationVtexCommission($input: HandleOrganizationVtexCommissionInput!) {
        handleOrganizationVtexCommission(input: $input){
            id
            organizationId
            vtexDepartmentId
            active
            vtexCommissionPercentage
            updatedAt
            createdAt
        }
    }
`

describe('services graphql', () => {

    let signUpCreated: ISignInAdapted;

    let userClient: IUserToken;

    let userToken: string;

    let organizationCreated : IOrganizationAdapted;

    beforeEach(async () => {

        await knexDatabase.knex('organization_vtex_comission').del();

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

    describe("vtex secrets graphql", () => {

        test("organization admin should add vtex secrets", async done => {

            const vtexSecrets = {
                xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
                xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
                accountName: "beightoneagency"
            }

            const verifyAndAttachVtexSecretsResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': VERIFY_AND_ATTACH_VTEX_SECRETS_RESPONSE,
            'variables': {
                    input: vtexSecrets
                }
            });

            expect(verifyAndAttachVtexSecretsResponse.statusCode).toBe(200);
            expect(verifyAndAttachVtexSecretsResponse.body.data.verifyAndAttachVtexSecrets).toBeTruthy();
    
            done();
        })

        test("user should get vtex integration departments", async done => {

            const vtexSecrets = {
                xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
                xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
                accountName: "beightoneagency"
            }
    
            await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': VERIFY_AND_ATTACH_VTEX_SECRETS_RESPONSE,
            'variables': {
                    input: vtexSecrets
                }
            });
    
            await knexDatabase.knex('organization_vtex_comission').insert({
                organization_id: organizationCreated.id,
                vtex_department_id: 1,
                vtex_commission_percentage: 15
            })

            const vtexDepartmentsCommissionsResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': VTEX_DEPARTMENTS_COMMISSIONS,
            });
    
            expect(vtexDepartmentsCommissionsResponse.statusCode).toBe(200)
            expect(vtexDepartmentsCommissionsResponse.body.data.vtexDepartmentsCommissions).toEqual(
                expect.arrayContaining(
                    mockVtexDepartments.map(item => expect.objectContaining({
                        id: String(item.id),
                        name: item.name,
                        url: item.url,
                        active: item.id === 1,
                        percentage: item.id === 1 ? 15 : null
                    }))
                )
            )
    
            done()
    
        })

        test("org/service admin should handle vtex comission and active", async done => {

            const vtexSecrets = {
                xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
                xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
                accountName: "beightoneagency"
            }
    
            await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': VERIFY_AND_ATTACH_VTEX_SECRETS_RESPONSE,
            'variables': {
                    input: vtexSecrets
                }
            });
    
            const handleOrganizationVtexCommissionPayload = {
                vtexDepartmentId: "1",
                vtexCommissionPercentage: 15,
                active: true
            }

            const handleOrganizationVtexCommissionResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': HANDLE_ORGANIZATION_VTEX_COMMISSION,
            'variables': {
                    input: handleOrganizationVtexCommissionPayload
                }
            });

            expect(handleOrganizationVtexCommissionResponse.statusCode).toBe(200);
            expect(handleOrganizationVtexCommissionResponse.body.data.handleOrganizationVtexCommission).toEqual(
                expect.objectContaining({
                  id: expect.any(String),
                  organizationId: organizationCreated.id,  
                  vtexDepartmentId: handleOrganizationVtexCommissionPayload.vtexDepartmentId,
                  vtexCommissionPercentage: handleOrganizationVtexCommissionPayload.vtexCommissionPercentage,
                  active: handleOrganizationVtexCommissionPayload.active,
                  updatedAt: expect.any(String),
                  createdAt: expect.any(String)
                })
            )
    
            const vtexDepartmentsCommissionsPayload = {
                organizationId: organizationCreated.id
            }
    
            const vtexDepartmentsCommissionsResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': VTEX_DEPARTMENTS_COMMISSIONS,
            'variables': {
                    input: vtexDepartmentsCommissionsPayload
                }
            });
    
            expect(vtexDepartmentsCommissionsResponse.body.data.vtexDepartmentsCommissions).toEqual(
                expect.arrayContaining(
                    mockVtexDepartments.map(item => expect.objectContaining({
                        id: String(item.id),
                        name: item.name,
                        url: item.url,
                        active: item.id === 1,
                        percentage: item.id === 1 ? 15 : null
                    }))
                )
            )
    
            done();
    
        })

        test("org/service admin should handle vtex comission to inactive", async done => {

            const vtexSecrets = {
                xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
                xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
                accountName: "beightoneagency"
            }
    
            await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': VERIFY_AND_ATTACH_VTEX_SECRETS_RESPONSE,
            'variables': {
                    input: vtexSecrets
                }
            });
    
            const handleOrganizationVtexCommissionPayload = {
                vtexDepartmentId: "1",
                vtexCommissionPercentage: 15,
                active: true
            }

            await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': HANDLE_ORGANIZATION_VTEX_COMMISSION,
            'variables': {
                    input: handleOrganizationVtexCommissionPayload
                }
            });
    
            const handleOrganizationVtexComissionDesactivePayload = {
                vtexDepartmentId: "1",
                vtexCommissionPercentage: 15,
                active: false
            }
    

            const handleOrganizationVtexCommissionResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': HANDLE_ORGANIZATION_VTEX_COMMISSION,
            'variables': {
                    input: handleOrganizationVtexComissionDesactivePayload
                }
            });

            expect(handleOrganizationVtexCommissionResponse.statusCode).toBe(200);
            expect(handleOrganizationVtexCommissionResponse.body.data.handleOrganizationVtexCommission).toEqual(
                expect.objectContaining({
                  id: expect.any(String),
                  organizationId: organizationCreated.id,  
                  vtexDepartmentId: handleOrganizationVtexCommissionPayload.vtexDepartmentId,
                  vtexCommissionPercentage: handleOrganizationVtexCommissionPayload.vtexCommissionPercentage,
                  active: handleOrganizationVtexComissionDesactivePayload.active,
                  updatedAt: expect.any(String),
                  createdAt: expect.any(String)
                })
            )
    
            const vtexDepartmentsCommissionsResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': VTEX_DEPARTMENTS_COMMISSIONS,
            });
    
            expect(vtexDepartmentsCommissionsResponse.body.data.vtexDepartmentsCommissions).toEqual(
                expect.arrayContaining(
                    mockVtexDepartments.map(item => expect.objectContaining({
                        id: String(item.id),
                        name: item.name,
                        url: item.url,
                        active: false,
                        percentage: item.id === 1 ? 15 : null
                    }))
                )
            )
    
            done();
    
        })

    })

});