process.env.NODE_ENV = 'test'
import Faker from 'faker'
import { IUserToken, ISignInAdapted } from '../../authentication/types'
import jwt from 'jsonwebtoken'
import knexDatabase from '../../../knex-database'
import { IOrganizationPayload } from '../types'
import redisClient from '../../../lib/Redis'
import { createOrganizationWithIntegrationVTEXPayload } from '../../../__mocks__'
import { stringToSlug } from '../helpers'
const app = require('../../../app')
const request = require('supertest').agent(app)

declare var process: {
  env: {
    NODE_ENV: 'production' | 'development' | 'test'
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

const VERIFY_ORGANIZATION_NAME = `
    query verifyOrganizationName($input: VerifyOrganizationNameInput!) {
        verifyOrganizationName(input: $input)
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

const ORGANIZATION_UPLOAD_IMAGE = `
    mutation organizationUploadImage($input: OrganizationUploadImageInput!) {
        organizationUploadImage(input: $input){
            id
            contactEmail
            name
            active
            logo
            updatedAt
            createdAt
            user{
                id
            }
        }
    }
`

const HANDLE_USER_PERMISSION_IN_ORGANIZATION = `
    mutation handleUserPermissionInOrganization($input: HandleUserPermissionInOrganizationInput!) {
        handleUserPermissionInOrganization(input: $input){
            id
            userOrganization{
                id
                user{
                    id
                }
                organization{
                    id
                }
            }
            createdAt
            updatedAt
        }
    }
`

const SET_CURRENT_ORGANIZATION = `
    mutation setCurrentOrganization($input: SetCurrentOrganizationInput!) {
        setCurrentOrganization(input: $input)
    }
`

const FIND_USERS_TO_ORGANIZATION = `
    query findUsersToOrganization($input: FindUsersToOrganizationInput!) {
        findUsersToOrganization(input: $input){
            inviteStatus
            user{
                id
                email
                username
            }
        }
    }
`

const LIST_MY_ORGANIZATIONS = `
    query listMyOrganizations{
        listMyOrganizations{
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

const ORGANIZATION_DETAILS = `
    query organizationDetails{
        organizationDetails{
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

const LIST_USERS_IN_ORGANIZATION = `
    query listUsersInOrganization($input: ListUsersInOrganizationInput!) {
        listUsersInOrganization(input: $input){
            count
            usersOrganizations{
                id
                user{
                    id
                }
                organization{
                    id
                }
                inviteStatus
                inviteHash
                createdAt
                updatedAt
                active
                organizationRole{
                    id
                    name
                }
            }
        }
    }
`

describe('organizations graphql', () => {
  let signUpCreated: ISignInAdapted

  let userClient: IUserToken

  let userToken: string

  beforeEach(async () => {
    const signUpPayload = {
      username: Faker.name.firstName(),
      email: Faker.internet.email(),
      password: 'B8oneTeste123!',
    }

    const signUpResponse = await request
      .post('/graphql')
      .set('content-type', 'application/json')
      .send({
        query: SIGN_UP,
        variables: {
          input: signUpPayload,
        },
      })

    signUpCreated = signUpResponse.body.data.signUp

    userClient = { origin: 'user', id: signUpCreated.id }

    userToken = await jwt.sign(userClient, process.env.JWT_SECRET)

    await redisClient.flushall('ASYNC')
  })

  afterAll(async () => {
    await knexDatabase.cleanMyTestDB()
    await redisClient.end()
  })

  describe('organization tests with user verified', () => {
    let createOrganizationPayload: IOrganizationPayload

    beforeEach(async () => {
      const [userFromDb] = await knexDatabase.knex('users').where('id', signUpCreated.id).select('verification_hash')

      const userVerifyEmailPayload = {
        verificationHash: userFromDb.verification_hash,
      }

      await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .send({
          query: USER_VERIFY_EMAIL,
          variables: {
            input: userVerifyEmailPayload,
          },
        })

      await knexDatabase.knex('organization_vtex_secrets').del()

      createOrganizationPayload = createOrganizationWithIntegrationVTEXPayload()
    })

    test('user should create new organization', async (done) => {
      const createOrganizationResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
          query: CREATE_ORGANIZATION,
          variables: {
            input: createOrganizationPayload,
          },
        })

      expect(createOrganizationResponse.statusCode).toBe(200)
      expect(createOrganizationResponse.body.data.createOrganization).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          slug: stringToSlug(createOrganizationPayload.organization.name),
          name: createOrganizationPayload.organization.name,
          contactEmail: createOrganizationPayload.organization.contactEmail,
          user: expect.objectContaining({
            id: userClient.id,
          }),
          active: true,
          updatedAt: expect.any(String),
          createdAt: expect.any(String),
        })
      )

      const organizationOnDb = await knexDatabase.knex('organizations').select()

      expect(organizationOnDb).toHaveLength(1)
      expect(organizationOnDb[0]).toEqual(
        expect.objectContaining({
          id: createOrganizationResponse.body.data.createOrganization.id,
          name: createOrganizationPayload.organization.name,
          contact_email: createOrganizationPayload.organization.contactEmail,
          user_id: userClient.id,
          active: true,
          updated_at: expect.any(Date),
          created_at: expect.any(Date),
        })
      )

      done()
    })

    test('user should send a current organization to redis graphql', async (done) => {
      const createOrganizationResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
          query: CREATE_ORGANIZATION,
          variables: {
            input: createOrganizationPayload,
          },
        })

      const organizationCreated = createOrganizationResponse.body.data.createOrganization

      const currentOrganizationPayload = {
        organizationId: organizationCreated.id,
      }

      const setCurrentOrganizationResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
          query: SET_CURRENT_ORGANIZATION,
          variables: {
            input: currentOrganizationPayload,
          },
        })

      expect(setCurrentOrganizationResponse.body.data.setCurrentOrganization).toBeTruthy()
      redisClient.get(signUpCreated.id, (_, data) => {
        expect(data).toBe(organizationCreated.id)
        redisClient.keys('*', function (_, keys) {
          expect(keys).toHaveLength(1)
          done()
        })
      })
    })

    test('user should send a nullable current organization to redis graphql', async (done) => {
      const createOrganizationResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
          query: CREATE_ORGANIZATION,
          variables: {
            input: createOrganizationPayload,
          },
        })

      const organizationCreated = createOrganizationResponse.body.data.createOrganization

      const currentOrganizationPayload = {
        organizationId: organizationCreated.id,
      }

      await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
          query: SET_CURRENT_ORGANIZATION,
          variables: {
            input: currentOrganizationPayload,
          },
        })

      const currentOrganizationNullablePayload = {
        organizationId: null,
      }

      const setCurrentOrganizationResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
          query: SET_CURRENT_ORGANIZATION,
          variables: {
            input: currentOrganizationNullablePayload,
          },
        })

      expect(setCurrentOrganizationResponse.body.data.setCurrentOrganization).toBeTruthy()
      redisClient.get(signUpCreated.id, (_, data) => {
        expect(data).toBeNull()
        redisClient.keys('*', function (_, keys) {
          expect(keys).toHaveLength(0)
          done()
        })
      })
    })

    test('user should verify organization duplicated name before create with new organization graphql', async (done) => {
      const verifyOrganizationNamePayload = {
        name: Faker.internet.domainName(),
      }

      const verifiedOrganizationNameResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
          query: VERIFY_ORGANIZATION_NAME,
          variables: {
            input: verifyOrganizationNamePayload,
          },
        })

      expect(verifiedOrganizationNameResponse.statusCode).toBe(200)
      expect(verifiedOrganizationNameResponse.body.data.verifyOrganizationName).toBeFalsy()

      done()
    })

    test('user should verify organization duplicated name before create with organization exists graphql', async (done) => {
      await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
          query: CREATE_ORGANIZATION,
          variables: {
            input: createOrganizationPayload,
          },
        })

      const verifiedOrganizationNameResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
          query: VERIFY_ORGANIZATION_NAME,
          variables: {
            input: {
              name: createOrganizationPayload.organization.name,
            },
          },
        })

      expect(verifiedOrganizationNameResponse.statusCode).toBe(200)
      expect(verifiedOrganizationNameResponse.body.data.verifyOrganizationName).toBeTruthy()

      done()
    })

    test('user should list your organizations', async (done) => {
      const createOrganizationResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
          query: CREATE_ORGANIZATION,
          variables: {
            input: createOrganizationPayload,
          },
        })

      const listMyOrganizationsResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
          query: LIST_MY_ORGANIZATIONS,
          variables: {
            input: createOrganizationPayload,
          },
        })

      expect(listMyOrganizationsResponse.statusCode).toBe(200)

      expect(listMyOrganizationsResponse.body.data.listMyOrganizations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: createOrganizationResponse.body.data.createOrganization.id,
            name: createOrganizationPayload.organization.name,
            contactEmail: createOrganizationPayload.organization.contactEmail,
            user: expect.objectContaining({
              id: userClient.id,
            }),
            active: true,
            updatedAt: expect.any(String),
            createdAt: expect.any(String),
          }),
        ])
      )

      done()
    })

    test('user should list your organization details', async (done) => {
      const createOrganizationResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
          query: CREATE_ORGANIZATION,
          variables: {
            input: createOrganizationPayload,
          },
        })

      const organizationCreated = createOrganizationResponse.body.data.createOrganization

      const currentOrganizationPayload = {
        organizationId: organizationCreated.id,
      }

      await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .set('x-api-token', userToken)
        .send({
          query: SET_CURRENT_ORGANIZATION,
          variables: {
            input: currentOrganizationPayload,
          },
        })

      const organizationDetailsResponse = await request.post('/graphql').set('content-type', 'application/json').set('x-api-token', userToken).send({
        query: ORGANIZATION_DETAILS,
      })

      expect(organizationDetailsResponse.statusCode).toBe(200)
      expect(organizationDetailsResponse.body.data.organizationDetails).toEqual(
        expect.objectContaining({
          id: createOrganizationResponse.body.data.createOrganization.id,
          name: createOrganizationPayload.organization.name,
          contactEmail: createOrganizationPayload.organization.contactEmail,
          user: expect.objectContaining({
            id: userClient.id,
          }),
          active: true,
          updatedAt: expect.any(String),
          createdAt: expect.any(String),
        })
      )

      done()
    })
  })
})
