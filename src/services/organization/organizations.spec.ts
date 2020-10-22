process.env.NODE_ENV = 'test'
import service from './service'
import UserService from '../users/service'
import Faker from 'faker'
import { ISignUpAdapted } from '../users/types'
import { IUserToken } from '../authentication/types'
import { OrganizationRoles, OrganizationInviteStatus, IOrganizationPayload } from './types'
import { Transaction } from 'knex'
import knexDatabase from '../../knex-database'
var imgGen = require('js-image-generator')
import redisClient from '../../lib/Redis'
import { MESSAGE_ERROR_USER_NOT_IN_ORGANIZATION } from '../../common/consts'
import { createOrganizationWithIntegrationVTEXPayload } from '../../__mocks__'

describe('Organizations', () => {
  let createOrganizationPayload: IOrganizationPayload

  let trx: Transaction

  let signUpCreated: ISignUpAdapted

  let signUpPayload = {
    username: Faker.name.firstName(),
    email: Faker.internet.email(),
    password: 'B8oneTeste123!',
  }

  let userToken: IUserToken

  beforeAll(async () => {
    trx = await knexDatabase.knexConfig.transaction()
  })

  afterAll(async () => {
    await trx.rollback()
    await trx.destroy()
    redisClient.end()
    return new Promise((resolve) => {
      resolve()
    })
  })

  beforeEach(async () => {
    await trx('organization_vtex_secrets').del()
    await trx('users_organization_service_roles').del()
    await trx('organization_services').del()
    await trx('users_organization_roles').del()
    await trx('users_organizations').del()
    await trx('organizations').del()
    await trx('organization_additional_infos').del()
    await trx('users').del()
    createOrganizationPayload = createOrganizationWithIntegrationVTEXPayload()
    await redisClient.flushall('ASYNC')
    signUpCreated = await UserService.signUp(signUpPayload, trx)
    userToken = { origin: 'user', id: signUpCreated.id }
  })

  test('user should send a current organization to redis', async (done) => {
    const organizationCreated = await service.createOrganization(createOrganizationPayload, { client: userToken, redisClient }, trx)

    const currentOrganizationPayload = {
      organizationId: organizationCreated.id,
    }

    const currentOrganizationAdded = await service.setCurrentOrganization(currentOrganizationPayload, { client: userToken, redisClient }, trx)

    expect(currentOrganizationAdded).toBeTruthy()
    redisClient.get(userToken.id, (_, data) => {
      expect(data).toBe(organizationCreated.id)
      redisClient.keys('*', function (_, keys) {
        expect(keys).toHaveLength(1)
        done()
      })
    })
  })

  test('user should send a current organization null and delete to redis', async (done) => {
    const organizationCreated = await service.createOrganization(createOrganizationPayload, { client: userToken, redisClient }, trx)

    const currentOrganizationPayload = {
      organizationId: organizationCreated.id,
    }

    await service.setCurrentOrganization(currentOrganizationPayload, { client: userToken, redisClient }, trx)

    const currentOrganizationNullablePayload = {
      organizationId: null,
    }

    const currentOrganizationRemoved = await service.setCurrentOrganization(currentOrganizationNullablePayload, { client: userToken, redisClient }, trx)

    expect(currentOrganizationRemoved).toBeTruthy()
    redisClient.get(userToken.id, (_, data) => {
      expect(data).toBeNull()
      redisClient.keys('*', function (_, keys) {
        expect(keys).toHaveLength(0)
        done()
      })
    })
  })

  test('users without organization not should send a current organization to redis', async (done) => {
    const organizationCreated = await service.createOrganization(createOrganizationPayload, { client: userToken, redisClient }, trx)

    const currentOrganizationPayload = {
      organizationId: organizationCreated.id,
    }

    let otherSignUpPayload = {
      username: Faker.name.firstName(),
      email: Faker.internet.email(),
      password: 'B8oneTeste123!',
    }

    const otherSignUpCreated = await UserService.signUp(otherSignUpPayload, trx)

    try {
      await service.setCurrentOrganization(currentOrganizationPayload, { client: { origin: 'user', id: otherSignUpCreated.id }, redisClient }, trx)
    } catch (e) {
      expect(e.message).toBe(MESSAGE_ERROR_USER_NOT_IN_ORGANIZATION)
      done()
    }
  })

  test('user should create new organization and grant admin role', async (done) => {
    const organizationCreated = await service.createOrganization(createOrganizationPayload, { client: userToken, redisClient }, trx)

    expect(organizationCreated).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: createOrganizationPayload.organization.name,
        contactEmail: createOrganizationPayload.organization.contactEmail,
        userId: userToken.id,
        active: true,

        updatedAt: expect.any(Date),
        createdAt: expect.any(Date),
      })
    )

    const organizationOnDb = await (trx || knexDatabase.knexConfig)('organizations').select()

    expect(organizationOnDb).toHaveLength(1)
    expect(organizationOnDb[0]).toEqual(
      expect.objectContaining({
        id: organizationCreated.id,
        name: createOrganizationPayload.organization.name,
        free_trial: true,
        free_trial_expires: expect.any(Date),
        contact_email: createOrganizationPayload.organization.contactEmail,
        phone: createOrganizationPayload.organization.phone,
        user_id: userToken.id,
        active: true,
        updated_at: expect.any(Date),
        created_at: expect.any(Date),
        organization_additional_infos_id: expect.any(String),
      })
    )

    const [organizationAdditionalInfosOnDb] = await (trx || knexDatabase.knexConfig)('organization_additional_infos').select()

    expect(organizationAdditionalInfosOnDb).toEqual(
      expect.objectContaining({
        segment: createOrganizationPayload.additionalInfos.segment,
        resellers_estimate: createOrganizationPayload.additionalInfos.resellersEstimate,
        reason: createOrganizationPayload.additionalInfos.reason,
        plataform: createOrganizationPayload.additionalInfos.plataform,
      })
    )

    const [organizationRoles] = await (trx || knexDatabase.knexConfig)('organization_roles').where('name', OrganizationRoles.ADMIN).select()

    expect(organizationRoles).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: OrganizationRoles.ADMIN,
        updated_at: expect.any(Date),
        created_at: expect.any(Date),
      })
    )

    const userOrganizations = await (trx || knexDatabase.knexConfig)('users_organizations').select()

    expect(userOrganizations).toHaveLength(1)
    expect(userOrganizations[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        user_id: userToken.id,
        organization_id: organizationCreated.id,
        invite_status: OrganizationInviteStatus.ACCEPT,
        invite_hash: null,
      })
    )

    const userOrganizationRoles = await (trx || knexDatabase.knexConfig)('users_organization_roles').select()

    expect(userOrganizationRoles).toHaveLength(1)
    expect(userOrganizationRoles[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        users_organization_id: userOrganizations[0].id,
        organization_role_id: organizationRoles.id,
        updated_at: expect.any(Date),
        created_at: expect.any(Date),
      })
    )

    done()
  })

  test('user should verify organization duplicated name before create with new organization', async (done) => {
    const verifyOrganizationNamePayload = {
      name: Faker.internet.domainName(),
    }

    const verifiedOrganizationName = await service.verifyOrganizationName(verifyOrganizationNamePayload.name, trx)

    expect(verifiedOrganizationName).toBeFalsy()

    done()
  })

  test('user should verify organization duplicated name before create with exists organization', async (done) => {
    await service.createOrganization(createOrganizationPayload, { client: userToken, redisClient }, trx)

    const verifiedOrganizationName = await service.verifyOrganizationName(createOrganizationPayload.organization.name, trx)

    expect(verifiedOrganizationName).toBeTruthy()

    done()
  })

  test('user should list your organizations', async (done) => {
    const organizationCreated = await service.createOrganization(createOrganizationPayload, { client: userToken, redisClient }, trx)

    const organizations = await service.listMyOrganizations(userToken, trx)

    expect(organizations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: organizationCreated.id,
          name: createOrganizationPayload.organization.name,
          contactEmail: createOrganizationPayload.organization.contactEmail,
          userId: userToken.id,
          active: true,
          updatedAt: expect.any(Date),
          createdAt: expect.any(Date),
        }),
      ])
    )

    done()
  })

  test('user should list your organization details', async (done) => {
    const organizationCreated = await service.createOrganization(createOrganizationPayload, { client: userToken, redisClient }, trx)

    const currentOrganizationPayload = {
      organizationId: organizationCreated.id,
    }

    await service.setCurrentOrganization(currentOrganizationPayload, { client: userToken, redisClient }, trx)

    let context = { client: userToken, organizationId: organizationCreated.id }

    const organizations = await service.organizationDetails(context, trx)

    expect(organizations).toEqual(
      expect.objectContaining({
        id: organizationCreated.id,
        name: createOrganizationPayload.organization.name,
        contactEmail: createOrganizationPayload.organization.contactEmail,
        userId: userToken.id,
        active: true,
        updatedAt: expect.any(Date),
        createdAt: expect.any(Date),
      })
    )

    done()
  })

  test('user should search other members', async (done) => {
    const [userFromDb] = await (trx || knexDatabase.knexConfig)('users').where('id', signUpCreated.id).select('verification_hash')

    await UserService.verifyEmail(userFromDb.verification_hash, trx)

    const organizationCreated = await service.createOrganization(createOrganizationPayload, { client: userToken, redisClient }, trx)

    const currentOrganizationPayload = {
      organizationId: organizationCreated.id,
    }

    await service.setCurrentOrganization(currentOrganizationPayload, { client: userToken, redisClient }, trx)

    let context = { client: userToken, organizationId: organizationCreated.id }

    const signUpPayload2 = {
      username: 'User1',
      email: 'user1@b8one.com',
      password: 'B8oneTeste123!',
    }

    const signUpPayload3 = {
      username: 'User2',
      email: 'user2@b8one.com',
      password: 'B8oneTeste123!',
    }

    let signUpCreated2 = await UserService.signUp(signUpPayload2, trx)
    let signUpCreated3 = await UserService.signUp(signUpPayload3, trx)

    const [userFromDb2] = await (trx || knexDatabase.knexConfig)('users').where('id', signUpCreated2.id).select('verification_hash')

    await UserService.verifyEmail(userFromDb2.verification_hash, trx)

    const [userFromDb3] = await (trx || knexDatabase.knexConfig)('users').where('id', signUpCreated3.id).select('verification_hash')

    await UserService.verifyEmail(userFromDb3.verification_hash, trx)

    const findUsersPayload = {
      name: 'user',
      organizationId: organizationCreated.id,
    }

    const userFound = await service.findUsersToOrganization(findUsersPayload, context, trx)

    expect(userFound).toHaveLength(2)
    expect(userFound).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          user: expect.objectContaining({
            username: signUpPayload2.username,
            email: signUpPayload2.email,
          }),
          inviteStatus: null,
        }),
        expect.objectContaining({
          user: expect.objectContaining({
            username: signUpPayload3.username,
            email: signUpPayload3.email,
          }),
          inviteStatus: null,
        }),
      ])
    )

    const userFoundsOnDB = await (trx || knexDatabase.knexConfigTest)('users').select()

    expect(userFoundsOnDB).toHaveLength(3)
    expect(userFoundsOnDB).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          username: signUpPayload.username,
          email: signUpPayload.email,
        }),
        expect.objectContaining({
          username: signUpPayload2.username,
          email: signUpPayload2.email,
        }),
        expect.objectContaining({
          username: signUpPayload3.username,
          email: signUpPayload3.email,
        }),
      ])
    )

    done()
  })

  test('admin should upload organization image', async (done) => {
    const organizationCreated = await service.createOrganization(createOrganizationPayload, { client: userToken, redisClient }, trx)

    const currentOrganizationPayload = {
      organizationId: organizationCreated.id,
    }

    await service.setCurrentOrganization(currentOrganizationPayload, { client: userToken, redisClient }, trx)

    let context = { client: userToken, organizationId: organizationCreated.id }

    imgGen.generateImage(1, 1, 80, async function (err: Error, image: any) {
      const organizationUploadImagePayload = {
        imageName: 'teste-organization-upload2',
        mimetype: 'image/jpeg',
        data: image.data,
      }

      const organizationImageUploaded = await service.organizationUploadImage(organizationUploadImagePayload, context, trx)

      expect(organizationImageUploaded).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: organizationCreated.name,
          contactEmail: organizationCreated.contactEmail,
          userId: userToken.id,
          active: true,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          userOrganizationId: undefined,
          logo: expect.any(String),
        })
      )
      done()
    })
  })
})
