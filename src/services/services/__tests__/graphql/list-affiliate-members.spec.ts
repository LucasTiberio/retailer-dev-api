process.env.NODE_ENV = 'test';
import OrganizationRulesService from '../../../organization-rules/service';
jest.mock('../../../organization-rules/service')
import Faker from 'faker';
import { IUserToken, ISignInAdapted } from '../../../authentication/types';
import jwt from 'jsonwebtoken';
import knexDatabase from '../../../../knex-database';
import { IOrganizationAdapted, IUserOrganizationAdapted } from '../../../organization/types';
import redisClient from '../../../../lib/Redis';
import { ServiceRoles, Services } from '../../../services/types';
const app = require('../../../../app');
const request = require('supertest').agent(app);

declare var process : {
	env: {
      NODE_ENV: "production" | "development" | "test"
      JWT_SECRET: string
	}
}

const VERIFY_AND_ATTACH_VTEX_SECRETS_RESPONSE = `
    mutation verifyAndAttachVtexSecrets($input: VerifyAndAttachVtexSecretsInput!) {
        verifyAndAttachVtexSecrets(input: $input)
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

const CREATE_ORGANIZATION = `
    mutation createOrganization($input: CreateOrganizationInput!) {
        createOrganization(input: $input){
            id
            contactEmail
            slug
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

const INVITE_AFFILIATE = `
    mutation inviteAffiliate($input: InviteAffiliateInput!) {
        inviteAffiliate(input: $input){
            id
        }
    }
`

const LIST_AFFILIATES_MEMBERS = `
    query listAffiliatesMembers($input: ListAffiliatesMembersInput) {
        listAffiliatesMembers(input: $input){
            affiliates{
                id
                showFirstSteps
                serviceRoles{
                    id
                    name
                }
                active
                userOrganization{
                    id
                    user{
                        id
                        username
                    }
                    organization{
                        id
                        name
                    }
                }
                createdAt
                updatedAt
            }
            count
            offset
            limit
        }
    }
`

describe('invite service members graphql', () => {

    let signUpCreated: ISignInAdapted;

    let userClient: IUserToken;

    let userToken: string;

    let organizationCreated : IOrganizationAdapted

    const inviteAffiliatesInput = {
        users: Array(5).fill(0).map(() => ({
            email: Faker.internet.email(),
            role: ServiceRoles.ANALYST
        }))
    }

    beforeAll(async () => {
        const getAffiliateTeammateRulesSpy = jest.spyOn(OrganizationRulesService, 'getAffiliateTeammateRules')
        getAffiliateTeammateRulesSpy.mockImplementation(() => new Promise((resolve) => resolve({
            maxAnalysts: 5,
            maxSales: 5,
            maxTeammates: 5,
            maxTransactionTax: 5
        })))
    })

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

        await redisClient.flushall('ASYNC');
        
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

        await knexDatabase.knexConfig('organization_vtex_secrets').del();

        let createOrganizationPayload = {
            organization: {
                name: Faker.name.firstName(),
                contactEmail: "gabriel-tamura@b8one.com",
                phone: "551123213123123"
            },
            additionalInfos: {
                segment: "Beleza e Cosméticos",
                resellersEstimate: 500,
                reason: "Ter mais uma opção de canal de vendas",
                plataform: "vtex"
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

        await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
        'query': INVITE_AFFILIATE, 
        'variables': {
                input: inviteAffiliatesInput
            }
        });

    });

    afterAll(async () => {
        await knexDatabase.cleanMyTestDB();
        await redisClient.end();
    })

    test("organization admin should list users in affiliate service - graphql", async done => {

        const listAffiliatesMembersResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
        'query': LIST_AFFILIATES_MEMBERS
        });

        expect(listAffiliatesMembersResponse.statusCode).toBe(200);

        expect(listAffiliatesMembersResponse.body.data.listAffiliatesMembers.affiliates).toHaveLength(5);
        expect(listAffiliatesMembersResponse.body.data.listAffiliatesMembers.count).toBe("5");

        done();

    })

    test("organization admin should list users in affiliate service with input - graphql", async done => {

        const listAffiliatesMembersInput = {
            name: inviteAffiliatesInput.users[0].email,
            limit: 1,
            offset: 0
        }

        const listAffiliatesMembersResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
            'query': LIST_AFFILIATES_MEMBERS,
            'variables': {
                input: listAffiliatesMembersInput
            }
        });

        expect(listAffiliatesMembersResponse.statusCode).toBe(200);

        expect(listAffiliatesMembersResponse.body.data.listAffiliatesMembers.affiliates).toHaveLength(1);
        expect(listAffiliatesMembersResponse.body.data.listAffiliatesMembers.count).toBe("1");

        done();

    })

});