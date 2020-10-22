import OrganizationRulesService from '../../organization-rules/service'
jest.mock('../../organization-rules/service')
import service from '../service'
import UserService from '../../users/service'
import OrganizationService from '../../organization/service'
import { Transaction } from 'knex'
import knexDatabase from '../../../knex-database'
import { createOrganizationPayload, createOrganizationWithIntegrationLojaIntegradaPayload } from '../../../__mocks__'
import { ISignUpAdapted } from '../../users/types'
import { IUserToken } from '../../authentication/types'
import Faker from 'faker'
import redisClient from '../../../lib/Redis'
import { IContext } from '../../../common/types'
import { Integrations } from '../types'
import common from '../../../common'
import { CREATE_ORGANIZATION_WITHOUT_INTEGRATION_SECRET } from '../../../common/envs'

describe('create integration', () => {
  let trx: Transaction

  let signUpCreated: ISignUpAdapted

  let signUpPayload = {
    username: Faker.name.firstName(),
    email: Faker.internet.email(),
    password: 'B8oneTeste123!',
  }

  let userToken: IUserToken

  let context: IContext

  beforeAll(async () => {
    trx = await knexDatabase.knexConfig.transaction()

    const getAffiliateTeammateRulesSpy = jest.spyOn(OrganizationRulesService, 'getAffiliateTeammateRules')
    getAffiliateTeammateRulesSpy.mockImplementation(
      () =>
        new Promise((resolve) =>
          resolve({
            maxAnalysts: 5,
            maxSales: 5,
            maxTeammates: 5,
            maxTransactionTax: 5,
            providers: [
              {
                name: 'vtex',
                status: true,
              },
              {
                name: 'loja_integrada',
                status: true,
              },
              {
                name: 'iugu',
                status: true,
              },
            ],
          })
        )
    )
  })

  beforeEach(async () => {
    await trx('organization_integration_secrets').del()
    await trx('integration_secrets').del()
    await trx('organization_services').del()
    await trx('users_organization_roles').del()
    await trx('users_organizations').del()
    await trx('organizations').del()
    await trx('organization_additional_infos').del()
    await trx('users').del()
    signUpCreated = await UserService.signUp(signUpPayload, trx)
    userToken = { origin: 'user', id: signUpCreated.id }
  })

  afterAll(async () => {
    await trx.rollback()
    await trx.destroy()
    redisClient.end()
    return new Promise((resolve) => {
      resolve()
    })
  })

  test('user organization admin should create vtex integration', async (done) => {
    const organizationCreated = await OrganizationService.createOrganization(createOrganizationPayload(), { client: userToken, redisClient }, trx)

    const currentOrganizationPayload = {
      organizationId: organizationCreated.id,
    }

    await OrganizationService.setCurrentOrganization(currentOrganizationPayload, { client: userToken, redisClient }, trx)

    let context = { client: userToken, organizationId: organizationCreated.id }

    const createIntegrationInput = {
      secrets: {
        xVtexApiAppKey: 'vtexappkey-beightoneagency-NQFTPH',
        xVtexApiAppToken: 'UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO',
        accountName: 'beightoneagency',
      },
      type: Integrations.VTEX,
    }

    const secretCreated = await service.createIntegration(createIntegrationInput, context, trx)

    expect(secretCreated).toBe(true)

    const integrationSecrets = await (trx || knexDatabase.knexConfig)('integration_secrets').first().select()

    expect(integrationSecrets).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        secret: common.jwtEncode(createIntegrationInput.secrets),
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      })
    )

    const organizationIntegration = await (trx || knexDatabase.knexConfig)('organization_integration_secrets').first().select()

    expect(organizationIntegration).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        active: true,
        type: Integrations.VTEX,
        organization_id: context.organizationId,
        integration_secrets_id: integrationSecrets.id,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      })
    )

    done()
  })

  test('user organization admin should create the same vtex integration', async (done) => {
    const organizationCreated = await OrganizationService.createOrganization(createOrganizationPayload(), { client: userToken, redisClient }, trx)

    const currentOrganizationPayload = {
      organizationId: organizationCreated.id,
    }

    await OrganizationService.setCurrentOrganization(currentOrganizationPayload, { client: userToken, redisClient }, trx)

    let context = { client: userToken, organizationId: organizationCreated.id }

    const createIntegrationInput = {
      secrets: {
        xVtexApiAppKey: 'vtexappkey-beightoneagency-NQFTPH',
        xVtexApiAppToken: 'UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO',
        accountName: 'beightoneagency',
      },
      type: Integrations.VTEX,
    }

    await service.createIntegration(createIntegrationInput, context, trx)

    const secretCreated = await service.createIntegration(createIntegrationInput, context, trx)

    expect(secretCreated).toBe(true)

    const integrationSecrets = await (trx || knexDatabase.knexConfig)('integration_secrets').select()

    expect(integrationSecrets).toHaveLength(1)

    const organizationIntegration = await (trx || knexDatabase.knexConfig)('organization_integration_secrets').select()

    expect(organizationIntegration).toHaveLength(1)

    done()
  })

  test('user organization admin should create loja integrada integration', async (done) => {
    const organizationCreated = await OrganizationService.createOrganization(createOrganizationWithIntegrationLojaIntegradaPayload(), { client: userToken, redisClient }, trx)

    const currentOrganizationPayload = {
      organizationId: organizationCreated.id,
    }

    await OrganizationService.setCurrentOrganization(currentOrganizationPayload, { client: userToken, redisClient }, trx)

    let context = { client: userToken, organizationId: organizationCreated.id }

    const createIntegrationInput = {
      secrets: {
        appKey: 'f0ceb7be2309c30ba3bd',
      },
      type: Integrations.LOJA_INTEGRADA,
    }

    const secretCreated = await service.createIntegration(createIntegrationInput, context, trx)

    expect(secretCreated).toBe(true)

    const integrationSecrets = await (trx || knexDatabase.knexConfig)('integration_secrets').first().select()

    expect(integrationSecrets).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        secret: common.jwtEncode(createIntegrationInput.secrets),
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      })
    )

    const organizationIntegration = await (trx || knexDatabase.knexConfig)('organization_integration_secrets').first().select()

    expect(organizationIntegration).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        active: true,
        type: Integrations.LOJA_INTEGRADA,
        organization_id: context.organizationId,
        integration_secrets_id: integrationSecrets.id,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      })
    )

    done()
  })

  test('user organization admin should create IUGU integration', async (done) => {
    const organizationCreated = await OrganizationService.createOrganization(
      {
        additionalInfos: {
          plataform: 'vtex',
          reason: 'x',
          resellersEstimate: 100,
          segment: 'Moda',
        },
        organization: {
          contactEmail: Faker.internet.email(),
          name: Faker.name.firstName(),
          phone: Faker.phone.phoneNumber(),
        },
      },
      { client: userToken, redisClient, createOrganizationWithoutIntegrationSecret: CREATE_ORGANIZATION_WITHOUT_INTEGRATION_SECRET },
      trx
    )

    const createIntegrationInput = {
      secrets: {
        appKey: '4f9c2925240337823bafb71a107178d1',
      },
    }

    let context = { client: userToken, organizationId: organizationCreated.id }

    const secretCreated = await service.createIuguIntegration(createIntegrationInput, context, trx)

    expect(secretCreated).toBe(true)

    const integrationSecrets = await (trx || knexDatabase.knexConfig)('integration_secrets').first().select()

    expect(integrationSecrets).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        secret: common.jwtEncode(createIntegrationInput.secrets),
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      })
    )

    const organizationIntegration = await (trx || knexDatabase.knexConfig)('organization_integration_secrets').first().select()

    expect(organizationIntegration).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        active: true,
        type: Integrations.IUGU,
        organization_id: context.organizationId,
        integration_secrets_id: integrationSecrets.id,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      })
    )

    done()
  })
})
