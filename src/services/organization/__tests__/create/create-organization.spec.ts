import service from '../../service'
import OrganizationRulesService from '../../../organization-rules/service'
jest.mock('../../../organization-rules/service')
import UserService from '../../../users/service'
import { Transaction } from 'knex'
import knexDatabase from '../../../../knex-database'
import { createOrganizationWithIntegrationVTEXPayload } from '../../../../__mocks__'
import { ISignUpAdapted } from '../../../users/types'
import { IUserToken } from '../../../authentication/types'
import Faker from 'faker'
import { IContext } from '../../../../common/types'
import redisClient from '../../../../lib/Redis'

jest.mock('../../../vtex/service')

describe('create organization', () => {
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
    trx = await knexDatabase.knex.transaction()
    const getAffiliateTeammateRulesSpy = jest.spyOn(OrganizationRulesService, 'getAffiliateTeammateRules')
    getAffiliateTeammateRulesSpy.mockImplementation(
      () =>
        new Promise((resolve) =>
          resolve({
            maxTransactionTax: 0,
            maxTeammates: 1,
            maxAnalysts: 3,
            maxSales: 0,
            support: 'sla - 48 hours',
            training: false,
            sso: false,
            providers: [
              { name: 'vtex', status: true },
              { name: 'loja_integrada', status: true },
            ],
          })
        )
    )
  })

  beforeEach(async () => {
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

  test('user should create organization', async (done) => {
    const organizationPayload = createOrganizationWithIntegrationVTEXPayload()

    const organizationCreated = await service.createOrganization(organizationPayload, { client: userToken, redisClient }, trx)

    expect(organizationCreated).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: organizationPayload.organization.name,
        contactEmail: organizationPayload.organization.contactEmail,
        userId: userToken.id,
        active: true,
        freeTrial: true,
        domain: null,
      })
    )

    done()
  })
})
