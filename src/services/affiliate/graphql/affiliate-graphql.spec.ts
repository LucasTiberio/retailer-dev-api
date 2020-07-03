process.env.NODE_ENV = 'test';
import knexDatabase from '../../../knex-database';
import Faker from 'faker';
import { IUserToken, ISignInAdapted } from "../../authentication/types";
import jwt from 'jsonwebtoken';
import { IOrganizationAdapted, OrganizationInviteStatus } from '../../organization/types';
import { Services, IServiceAdaptedFromDB, ServiceRoles } from '../../services/types';
import redisClient from '../../../lib/Redis';
import { PaymentMethod } from '../../payments/types';
const app = require('../../../app');
const request = require('supertest').agent(app);

const backendRedirectUrl = process.env.REDIRECT_URL_STAGING;

declare var process : {
	env: {
      NODE_ENV: "production" | "development" | "test"
      JWT_SECRET: string
      REDIRECT_URL_STAGING: string
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

const CREATE_SERVICE_IN_ORGANIZATION = `
    mutation createServiceInOrganization($input: CreateServiceInOrganizationInput!) {
        createServiceInOrganization(input: $input)
    }
`

const INVITE_USER_TO_ORGANIZATION = `
    mutation inviteUserToOrganization($input: InviteUserToOrganizationInput!) {
        inviteUserToOrganization(input: $input)
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

const GENERATE_SALES_JWT = `
    mutation generateSalesJwt($input: GenerateSalesJwtInput!) {
        generateSalesJwt(input: $input){
            salesId
            vtexSalePixelJwt
        }
    }
`

const VERIFY_AND_ATTACH_VTEX_SECRETS_RESPONSE = `
    mutation verifyAndAttachVtexSecrets($input: VerifyAndAttachVtexSecretsInput!) {
        verifyAndAttachVtexSecrets(input: $input)
    }
`

const AFFILIATE_GENERATE_SHORTENER_URL = `
    mutation affiliateGenerateShortenerUrl($input: AffiliateGenerateShortenerUrlInput!) {
        affiliateGenerateShortenerUrl(input: $input){
            id
            createdAt
            updatedAt
            shortenerUrl{
                id
                originalUrl
                shortUrl
                urlCode
                createdAt
                updatedAt
            }
            userOrganizationService{
                id
            }
        }
    }
`

const LIST_AFFILIATE_SHORTER_URL = `
    query listAffiliateShorterUrl($input: ListAffiliateShorterUrlInput!) {
        listAffiliateShorterUrl(input: $input){
            id
            createdAt
            updatedAt
            shortenerUrl{
                id
                originalUrl
                shortUrl
                urlCode
                createdAt
                updatedAt
            }
            userOrganizationService{
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

const CREATE_AFFILIATE_BANK_VALUES = `
    mutation createAffiliateBankValues($input: CreateAffiliateBankValuesInput!) {
        createAffiliateBankValues(input: $input){
            id
            createdAt
            updatedAt
            active
            serviceRoles{
                id
            }
            userOrganization{
                id
            }
            bankData{
                id
                brazilBank{
                    id
                }
            }
        }
    }
`

const GENERATE_SALES_SHORTEN = `
    mutation generateSalesShorten($input: GenerateSalesShortenInput!) {
        generateSalesShorten(input: $input){
            id
            originalUrl
            shortUrl
            urlCode
            createdAt
            updatedAt
        }
    }
`

const USER_IN_SERVICE_HANDLE_ROLE = `
    mutation userInServiceHandleRole($input: UserInServiceHandleRoleInput!) {
        userInServiceHandleRole(input: $input){
            id
            createdAt
            updatedAt
        }
    }
`

describe('services graphql', () => {

    let signUpCreated: ISignInAdapted;

    let userClient: IUserToken;

    let userToken: string;

    let organizationCreated: IOrganizationAdapted;

    let serviceFound : IServiceAdaptedFromDB;

    beforeEach(async () => {

        
        await knexDatabase.knex('users_organization_service_roles_url_shortener').del();
        await knexDatabase.knex('users_organization_service_roles').del();

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
            organization: {
              name: Faker.internet.domainName(),
              contactEmail: "gabriel-tamura@b8one.com"
            },
            payment: {
                plan: "488346",
                paymentMethod: PaymentMethod.credit_card,
                billing: {
                name: "Gabriel Tamura",
                address:{
                    street: "Rua avare",
                    complementary: "12",
                    state: "São Paulo",
                    streetNumber: "24",
                    neighborhood: "Baeta Neves",
                    city: "São Bernardo do Campo",
                    zipcode: "09751060",
                    country: "Brazil"
                }
                },
                customer: {
                documentNumber: "37859614804"
                },
                creditCard: {
                number: "4111111111111111",
                cvv: "123",
                expirationDate: "0922",
                holderName: "Morpheus Fishburne"
                }
            }
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

        const [serviceFoundDB] = await knexDatabase.knex('services').where('name', Services.AFFILIATE).select('id', 'name', 'active');
        serviceFound = serviceFoundDB

        await knexDatabase.knex('organization_vtex_secrets').del();

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
    });

    afterAll(async () => {
        await knexDatabase.cleanMyTestDB();
        await redisClient.end();
    })

    test('organization admin should added member on service graphql', async done => {

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
                email: otherSignUpCreated.email,
                services: [{
                    name: Services.AFFILIATE,
                    role: ServiceRoles.ANALYST
                }]
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

        const affiliateGenerateShortenerUrlPayload = {
            originalUrl: Faker.internet.url(),
            serviceName: Services.AFFILIATE
        }

        const affiliateClient = { origin: 'user', id: otherSignUpCreated.id };

        const affiliateToken = await jwt.sign(affiliateClient, process.env.JWT_SECRET);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', affiliateToken)
        .send({
        'query': SET_CURRENT_ORGANIZATION, 
        'variables': {
                input: currentOrganizationPayload
            }
        });

        const affiliateGenerateShortenerUrlResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', affiliateToken)
        .send({
        'query': AFFILIATE_GENERATE_SHORTENER_URL, 
        'variables': {
                input: affiliateGenerateShortenerUrlPayload
            }
        });

        expect(affiliateGenerateShortenerUrlResponse.statusCode).toBe(200);

        const shortUrlBefore = `${backendRedirectUrl}/${affiliateGenerateShortenerUrlResponse.body.data.affiliateGenerateShortenerUrl.shortenerUrl.urlCode}`;

        const [userInOrganizationService] = await knexDatabase.knex('users_organization_service_roles').select();

        expect(affiliateGenerateShortenerUrlResponse.body.data.affiliateGenerateShortenerUrl).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                shortenerUrl: expect.objectContaining({
                    originalUrl: `${affiliateGenerateShortenerUrlPayload.originalUrl}?utm_source=plugone_affiliate&utm_campaign=${userInOrganizationService.id}_${organizationCreated.id}`,
                    shortUrl: shortUrlBefore,
                    urlCode: expect.any(String),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String)
                }),
                userOrganizationService: expect.objectContaining({
                    id: userInOrganizationService.id
                }),
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
            })
        )

        done();
    })

    test('get my short codes graphql', async done => {

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
                email: otherSignUpCreated.email,
                services: [{
                    name: Services.AFFILIATE,
                    role: ServiceRoles.ANALYST
                }]
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

        const affiliateGenerateShortenerUrlPayload = {
            originalUrl: Faker.internet.url(),
            serviceName: Services.AFFILIATE
        }

        const affiliateClient = { origin: 'user', id: otherSignUpCreated.id };

        const affiliateToken = await jwt.sign(affiliateClient, process.env.JWT_SECRET);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', affiliateToken)
        .send({
        'query': SET_CURRENT_ORGANIZATION, 
        'variables': {
                input: currentOrganizationPayload
            }
        });

        const affiliateGenerateShortenerUrlResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', affiliateToken)
        .send({
        'query': AFFILIATE_GENERATE_SHORTENER_URL, 
        'variables': {
                input: affiliateGenerateShortenerUrlPayload
            }
        });

        expect(affiliateGenerateShortenerUrlResponse.statusCode).toBe(200);

        const shortUrlBefore = `${backendRedirectUrl}/${affiliateGenerateShortenerUrlResponse.body.data.affiliateGenerateShortenerUrl.shortenerUrl.urlCode}`;

        const [userInOrganizationService] = await knexDatabase.knex('users_organization_service_roles').select();

        const affiliateId = userInOrganizationService.id;

        const userOrganizationServicePayload = {
            userOrganizationServiceId: affiliateId,
            serviceName: Services.AFFILIATE
        }

        const listAffiliateShorterUrlResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', affiliateToken)
        .send({
        'query': LIST_AFFILIATE_SHORTER_URL, 
        'variables': {
                input: userOrganizationServicePayload
            }
        });

        expect(listAffiliateShorterUrlResponse.statusCode).toBe(200);

        const [organizationService] = await knexDatabase.knex('organization_services')
        .where('organization_id', organizationCreated.id)
        .select('id');

        expect(listAffiliateShorterUrlResponse.body.data.listAffiliateShorterUrl).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    shortenerUrl: expect.objectContaining({
                        originalUrl: `${affiliateGenerateShortenerUrlPayload.originalUrl}?utm_source=plugone_affiliate&utm_campaign=${affiliateId}_${organizationCreated.id}`,
                        shortUrl: shortUrlBefore,
                        urlCode: expect.any(String),
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String)
                    }),
                    userOrganizationService: expect.objectContaining({
                        id: affiliateId
                    }),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String)
                })
            ])
        )

        done();
    })

    test('affiliate should update bank values', async done => {

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
                email: otherSignUpCreated.email,
                services: [{
                    name: Services.AFFILIATE,
                    role: ServiceRoles.ANALYST
                }]
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

        const affiliateClient = { origin: 'user', id: otherSignUpCreated.id };

        const affiliateToken = await jwt.sign(affiliateClient, process.env.JWT_SECRET);

        const currentOrganizationPayload = {
            organizationId: organizationCreated.id
        }

        await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', affiliateToken)
        .send({
        'query': SET_CURRENT_ORGANIZATION, 
        'variables': {
                input: currentOrganizationPayload
            }
        });

        const brazilBanks = await knexDatabase.knex('brazil_banks').limit(1).select();

        const createUserBankValuesPayload = {
            name: Faker.name.firstName(),
            agency: "1111",
            account: "11111",
            accountDigit: "1",
            document: "11111111",
            brazilBankId: brazilBanks[0].id,
            serviceName: Services.AFFILIATE
        }

        const createAffiliateBankValuesResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', affiliateToken)
        .send({
        'query': CREATE_AFFILIATE_BANK_VALUES, 
        'variables': {
                input: createUserBankValuesPayload
            }
        });

        const [userInOrganizationService] = await knexDatabase.knex('users_organization_service_roles').select();

        expect(createAffiliateBankValuesResponse.statusCode).toBe(200);
        expect(createAffiliateBankValuesResponse.body.data.createAffiliateBankValues).toEqual(
            expect.objectContaining({
                id: userInOrganizationService.id,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                active: true
            })
        )

        done();
    })

    test('affiliate sale should get redis jwt tolen', async done => {


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

        const [userFromDb] = await knexDatabase.knex('users').where('id', otherSignUpCreated.id).select('verification_hash', 'id');

        const userVerifyEmailPayload = {
            verificationHash: userFromDb.verification_hash,
            response: OrganizationInviteStatus.ACCEPT
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
                email: otherSignUpCreated.email,
                services: [{
                    name: Services.AFFILIATE,
                    role: ServiceRoles.ANALYST
                }]
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

        const [invitedUserToOrganization] = await knexDatabase.knex('users_organizations').where("user_id", otherSignUpCreated.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');

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

        const userInServiceHandleRolePayload = {
            userId: otherSignUpCreated.id,
            serviceName: Services.AFFILIATE,
            serviceRole: ServiceRoles.SALE
        };

        const userInServiceHandleRoleResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
        'query': USER_IN_SERVICE_HANDLE_ROLE, 
        'variables': {
                input: userInServiceHandleRolePayload
            }
        });

        const generateSalesJWTPayload = {
            email: otherSignUpCreated.email,
            organizationId: organizationCreated.id,
            serviceName: Services.AFFILIATE
        }

        const generateSalesJWTResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .send({
        'query': GENERATE_SALES_JWT,
        'variables': {
                input: generateSalesJWTPayload
            }
        });

        expect(generateSalesJWTResponse.statusCode).toBe(200)
        expect(generateSalesJWTResponse.body.data.generateSalesJwt).toBeDefined();

        done();
    })

    test('affiliate sale should get redis jwt tolen', async done => {


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

        const [userFromDb] = await knexDatabase.knex('users').where('id', otherSignUpCreated.id).select('verification_hash', 'id');

        const userVerifyEmailPayload = {
            verificationHash: userFromDb.verification_hash,
            response: OrganizationInviteStatus.ACCEPT
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
                email: otherSignUpCreated.email,
                services: [{
                    name: Services.AFFILIATE,
                    role: ServiceRoles.ANALYST
                }]
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

        const [invitedUserToOrganization] = await knexDatabase.knex('users_organizations').where("user_id", otherSignUpCreated.id).andWhere('organization_id', organizationCreated.id).select('invite_hash', 'id');

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

        const userInServiceHandleRolePayload = {
            userId: otherSignUpCreated.id,
            serviceName: Services.AFFILIATE,
            serviceRole: ServiceRoles.SALE
        };

        const userInServiceHandleRoleResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
        'query': USER_IN_SERVICE_HANDLE_ROLE, 
        'variables': {
                input: userInServiceHandleRolePayload
            }
        });

        const generateSalesJWTPayload = {
            email: otherSignUpCreated.email,
            organizationId: organizationCreated.id,
            serviceName: Services.AFFILIATE
        }

        const generateSalesJWTResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .send({
        'query': GENERATE_SALES_JWT,
        'variables': {
                input: generateSalesJWTPayload
            }
        });

        let generateSalesShortenPayload = {
            url: "https://www.teste.com.br/checkout/?orderFormId=768a71136a1245e795a28ff81de99406#/cart#"
        };

        const generateSalesShortenResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('sales-token', generateSalesJWTResponse.body.data.generateSalesJwt.vtexSalePixelJwt)
        .send({
        'query': GENERATE_SALES_SHORTEN,
        'variables': {
                input: generateSalesShortenPayload
            }
        });

        expect(generateSalesShortenResponse.statusCode).toBe(200)
        expect(generateSalesShortenResponse.body.data.generateSalesShorten).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                originalUrl: generateSalesShortenPayload.url,
                shortUrl: expect.any(String),
                urlCode: expect.any(String),
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            })
        )

        done();
    })

});