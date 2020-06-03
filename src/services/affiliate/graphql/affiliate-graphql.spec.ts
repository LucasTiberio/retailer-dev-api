process.env.NODE_ENV = 'test';
import knexDatabase from '../../../knex-database';
import Faker from 'faker';
import { IUserToken, ISignInAdapted } from "../../authentication/types";
import jwt from 'jsonwebtoken';
import { IOrganizationAdapted, OrganizationInviteStatus } from '../../organization/types';
import { Services, IServiceAdaptedFromDB } from '../../services/types';
const app = require('../../../app');
const request = require('supertest').agent(app);

const frontUrl = process.env.FRONT_URL_STAGING;

declare var process : {
	env: {
      NODE_ENV: "production" | "development" | "test"
      JWT_SECRET: string
      FRONT_URL_STAGING: string
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

const ADD_USER_IN_ORGANIZATION_SERVICE = `
    mutation addUserInOrganizationService($input: AddUserInOrganizationServiceInput!) {
        addUserInOrganizationService(input: $input){
            id
            createdAt
            updatedAt
            service{
                id
                name
                active
                createdAt
                updatedAt
            }
            serviceRoles{
                id
                name
            }
            userOrganization{
                id
                user{
                    id
                    username
                    email
                }
                organization{
                    id
                    name
                    contactEmail
                }
            }
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
            originalUrl
            shortUrl
            urlCode
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

        const [serviceFoundDB] = await knexDatabase.knex('services').where('name', Services.AFFILIATE).select('id', 'name', 'active');
                serviceFound = serviceFoundDB
                
        const createServiceInOrganizationPayload = {
            organizationId: organizationCreated.id,
            serviceId: serviceFound.id,
        }

        await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
        'query': CREATE_SERVICE_IN_ORGANIZATION, 
        'variables': {
                input: createServiceInOrganizationPayload
            }
        });

        await knexDatabase.knex('organization_vtex_secrets').del();

        const vtexSecrets = {
            xVtexApiAppKey: "vtexappkey-beightoneagency-NQFTPH",
            xVtexApiAppToken: "UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO",
            accountName: "beightoneagency",
            organizationId: organizationCreated.id
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
            organizationId: organizationCreated.id,
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

        const addUserInOrganizationPayload = {
            userId: otherSignUpCreated.id,
            organizationId: organizationCreated.id,
            serviceName: Services.AFFILIATE
        }

        const addUserInOrganizationResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
        'query': ADD_USER_IN_ORGANIZATION_SERVICE, 
        'variables': {
                input: addUserInOrganizationPayload
            }
        });

        const affiliateGenerateShortenerUrlPayload = {
            originalUrl: Faker.internet.url(),
            organizationId:organizationCreated.id,
            serviceName: Services.AFFILIATE
        }

        const affiliateClient = { origin: 'user', id: otherSignUpCreated.id };

        const affiliateToken = await jwt.sign(affiliateClient, process.env.JWT_SECRET);

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

        const shortUrlBefore = `${frontUrl}/${affiliateGenerateShortenerUrlResponse.body.data.affiliateGenerateShortenerUrl.urlCode}`;

        const affiliateId = addUserInOrganizationResponse.body.data.addUserInOrganizationService.id;

        expect(affiliateGenerateShortenerUrlResponse.body.data.affiliateGenerateShortenerUrl).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                originalUrl: `${affiliateGenerateShortenerUrlPayload.originalUrl}?utm_source=plugone&utm_campaign=${affiliateId}`,
                shortUrl: shortUrlBefore,
                urlCode: expect.any(String),
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
            })
        )

        done();
    })

});