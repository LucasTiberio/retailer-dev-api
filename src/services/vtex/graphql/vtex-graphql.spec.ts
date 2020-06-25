process.env.NODE_ENV = 'test';
import knexDatabase from '../../../knex-database';
import Faker from 'faker';
import { IUserToken, ISignInAdapted } from "../../authentication/types";
import jwt from 'jsonwebtoken';
import { IOrganizationAdapted, IOrganizationFromDB, OrganizationInviteStatus } from '../../organization/types';
import redisClient from '../../../lib/Redis';
import { mockVtexDepartments } from '../__mocks__';
import { Services } from '../../services/types';
import moment from 'moment';
const app = require('../../../app');
const request = require('supertest').agent(app);

declare var process : {
	env: {
      NODE_ENV: "production" | "development" | "test"
      JWT_SECRET: string
      ORDERS_SERVICE_PASSWORD: string
	}
}

const ADD_USER_IN_ORGANIZATION_SERVICE = `
    mutation addUserInOrganizationService($input: AddUserInOrganizationServiceInput!) {
        addUserInOrganizationService(input: $input){
            id
        }
    }
`

const RESPONSE_INVITE = `
    mutation responseOrganizationInvite($input: ResponseOrganizationInviteInput!) {
        responseOrganizationInvite(input: $input){
            status
            email
        }
    }
`

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

const INVITE_USER_TO_ORGANIZATION = `
    mutation inviteUserToOrganization($input: InviteUserToOrganizationInput!) {
        inviteUserToOrganization(input: $input)
    }
`

const VTEX_AFFILIATE_COMMISSION = `
    query vtexAffiliateCommission($input: VtexAffiliateCommissionInput!) {
        vtexAffiliateCommission(input: $input){
            vtexDepartmentId
            percentage
            payDay
        }
    }
`

const HANDLE_TIME_TO_PAY_COMMISSION = `
    mutation handleTimeToPayCommission($input: HandleTimeToPayCommissionInput!) {
        handleTimeToPayCommission(input: $input){
            id
            days
            type
            updatedAt
            createdAt
        }
    }
`

const TIME_TO_PAY_COMMISSION = `
    query timeToPayCommission{
        timeToPayCommission{
            id
            days
            type
            updatedAt
            createdAt
        }
    }
`

const HANDLE_DEFAULT_COMMISSION = `
    mutation handleDefaultCommission($input: HandleDefaultCommissionInput!) {
        handleDefaultCommission(input: $input){
            id
            percentage
            updatedAt
            createdAt
        }
    }
`

const DEFAULT_COMMISSION = `
    query defaultCommission{
        defaultCommission{
            id
            percentage
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
        await knexDatabase.knex('organization_vtex_secrets').del();

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

        test("get comission/(vtex department id) (id do afiliado) graphql", async done => {

            const otherSignUpPayload = {
                username: Faker.name.firstName(),
                email: Faker.internet.email(),
                password: "B8oneTeste123!"
            }
    
            const otherSignUpResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .send({
            'query': SIGN_UP, 
            'variables': {
                    input: otherSignUpPayload
                }
            });
    
            let otherSignUpCreated = otherSignUpResponse.body.data.signUp

            const [userFromDb] = await knexDatabase.knex('users').where('id', otherSignUpCreated.id).select('verification_hash');

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

            const inviteUserToOrganizationPayload = {
                users: [{
                    id: otherSignUpCreated.id,
                    email: otherSignUpCreated.email
                }]
            }

            await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': INVITE_USER_TO_ORGANIZATION, 
            'variables': {
                    input: inviteUserToOrganizationPayload
                }
            });

            const [invitedUserToOrganization] = await knexDatabase.knex('users_organizations').where("user_id", otherSignUpCreated.id).select('invite_hash', 'id');

            const responseOrganizationInvitePayload = {
                inviteHash: invitedUserToOrganization.invite_hash,
                response: OrganizationInviteStatus.ACCEPT
            }

            await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': RESPONSE_INVITE, 
            'variables': {
                    input: responseOrganizationInvitePayload
                }
            });

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

            const addUserInOrganizationPayload = {
                userId: otherSignUpCreated.id,
                serviceName: Services.AFFILIATE
            }

            const addUserInOrganizationServiceResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': ADD_USER_IN_ORGANIZATION_SERVICE, 
            'variables': {
                    input: addUserInOrganizationPayload
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

            const organizationVtexComissionAdded = handleOrganizationVtexCommissionResponse.body.data.handleOrganizationVtexCommission;

            const vtexComissionsByAffiliateIdAndDepartmentIdPayload = {
                vtexDepartmentsIds: ["1"],
                affiliateId: addUserInOrganizationServiceResponse.body.data.addUserInOrganizationService.id
            }

            const getVtexCommissionByAffiliateIdAndDepartmentIdResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('token', process.env.ORDERS_SERVICE_PASSWORD)
            .send({
            'query': VTEX_AFFILIATE_COMMISSION,
            'variables': {
                    input: vtexComissionsByAffiliateIdAndDepartmentIdPayload
                }
            });

            expect(getVtexCommissionByAffiliateIdAndDepartmentIdResponse.statusCode).toBe(200);
            expect(getVtexCommissionByAffiliateIdAndDepartmentIdResponse.body.data.vtexAffiliateCommission).toStrictEqual(expect.arrayContaining([
                expect.objectContaining({
                    percentage: organizationVtexComissionAdded.vtexCommissionPercentage,
                    payDay: null,
                    vtexDepartmentId: "1"
                })
            ]))

            done();
        })

        test('service admin should be add time to pay comission in service graphql', async done => {

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
    
            const handleTimeToPayCommissionPayload = {
                days: 30
            };

            const handleTimeToPayCommissionResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': HANDLE_TIME_TO_PAY_COMMISSION,
            'variables': {
                    input: handleTimeToPayCommissionPayload
                }
            });

            expect(handleTimeToPayCommissionResponse.statusCode).toBe(200);
    
            expect(handleTimeToPayCommissionResponse.body.data.handleTimeToPayCommission).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    days: String(handleTimeToPayCommissionPayload.days),
                    type: 'commission',
                    updatedAt: expect.any(String),
                    createdAt: expect.any(String)
                })
            )
    
            done();
        })
        
        test('service admin should be get time to pay comission in service graphql', async done => {

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
    
            const handleTimeToPayCommissionPayload = {
                days: 30
            };

            await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': HANDLE_TIME_TO_PAY_COMMISSION,
            'variables': {
                    input: handleTimeToPayCommissionPayload
                }
            });

            const timeToPayCommissionResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': TIME_TO_PAY_COMMISSION,
            });

            expect(timeToPayCommissionResponse.statusCode).toBe(200);
    
            expect(timeToPayCommissionResponse.body.data.timeToPayCommission).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    days: String(handleTimeToPayCommissionPayload.days),
                    type: 'commission',
                    updatedAt: expect.any(String),
                    createdAt: expect.any(String)
                })
            )
    
            done();
        })

        test('service admin should be add default comission in service graphql', async done => {

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
    
            const handleDefaultCommission = {
                percentage: 10
            };

            const handleDefaultCommissionResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': HANDLE_DEFAULT_COMMISSION,
            'variables': {
                    input: handleDefaultCommission
                }
            });

            expect(handleDefaultCommissionResponse.statusCode).toBe(200);
    
            expect(handleDefaultCommissionResponse.body.data.handleDefaultCommission).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    percentage: handleDefaultCommission.percentage,
                    updatedAt: expect.any(String),
                    createdAt: expect.any(String)
                })
            )
    
            done();
        })

        test('service admin should be get default comission in service graphql', async done => {

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
    
            const handleDefaultCommission = {
                percentage: 10
            };

            await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': HANDLE_DEFAULT_COMMISSION,
            'variables': {
                    input: handleDefaultCommission
                }
            });

            const defaultCommissionResponse = await request
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('x-api-token', userToken)
            .send({
            'query': DEFAULT_COMMISSION,
            });

            expect(defaultCommissionResponse.statusCode).toBe(200);
    
            expect(defaultCommissionResponse.body.data.defaultCommission).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    percentage: handleDefaultCommission.percentage,
                    updatedAt: expect.any(String),
                    createdAt: expect.any(String)
                })
            )
    
            done();
        })

    })

});