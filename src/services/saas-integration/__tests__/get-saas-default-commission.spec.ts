process.env.NODE_ENV = 'test'
import service from '../service'
import Faker from 'faker'
import { Transaction } from 'knex'
import { SaasDefaultCommissionAdapted, SaasDefaultCommissionFormOfPayment, SaasDefaultCommissionFromDB, SaasDefaultCommissionPeriod, SaasDefaultCommissionTypes } from '../types'
import redisClient from '../../../lib/Redis'
import moment from 'moment'
import OrganizationService from '../../organization/service'
import IntegrationService from '../../integration/service'
import UserService from '../../users/service'
import knexDatabase from '../../../knex-database'
import OrganizationRulesService from '../../organization-rules/service'
import { ISignUpAdapted } from '../../users/types'
import { IUserToken } from '../../authentication/types'
import { IContext } from '../../../common/types'
import { CREATE_ORGANIZATION_WITHOUT_INTEGRATION_SECRET } from '../../../common/envs'
jest.mock('../../organization-rules/service')

describe('Saas default commission', () => {
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
    trx = await knexDatabase.knex.transaction()
    signUpCreated = await UserService.signUp(signUpPayload, trx)
    userToken = { origin: 'user', id: signUpCreated.id }
  })

  afterEach(async () => {
    await trx.rollback()
    return new Promise((resolve) => {
      resolve()
    })
  })

  afterAll(async () => {
    await redisClient.end()
    return new Promise((resolve) => {
      resolve()
    })
  })

  it('organization admin should get commission default for saas integration by organization id', async (done) => {
    const organizationInserted = await OrganizationService.createOrganization(
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

    let context = { client: userToken, organizationId: organizationInserted.id }

    await IntegrationService.createIuguIntegration(createIntegrationInput, context, trx)

    const input = {
      type: SaasDefaultCommissionTypes.absolute,
      value: '10.00',
      period: SaasDefaultCommissionPeriod.lifetime,
      initPayCommission: 3,
      paymentPeriod: 1,
      formOfPayment: SaasDefaultCommissionFormOfPayment.unique,
      advancedOptions: true,
    }

    await service.handleSassDefaultCommission(input, { organizationId: organizationInserted.id }, trx)

    const commissionBonification = await service.getSaasDefaultCommission({ organizationId: organizationInserted.id }, trx)

    expect(commissionBonification).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        organizationId: organizationInserted.id,
        type: input.type,
        value: input.value,
        active: true,
        period: input.period,
        paymentPeriod: input.paymentPeriod,
        initPayCommission: input.initPayCommission,
        formOfPayment: input.formOfPayment,
        advancedOptions: input.advancedOptions,
      })
    )

    done()
  })
})
