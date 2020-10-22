process.env.NODE_ENV = 'test'
import service from '../../service'
import Faker from 'faker'
import database from '../../../../knex-database'
import { Transaction } from 'knex'
import createOrganizationMock from '../../../../__mocks__/full/create-organization-mock'
import OrganizationRulesService from '../../../../services/organization-rules/service'
import { IOrganizationFromDB } from '../../../organization/types'
jest.mock('../../../../services/organization-rules/service')

describe('Organization', () => {
  let trx: Transaction

  let organizationInserted: IOrganizationFromDB

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
            ],
          })
        )
    )
  })

  beforeEach(async () => {
    trx = await database.knexConfig.transaction()

    organizationInserted = await createOrganizationMock(trx)
  })

  afterEach(async () => {
    await trx.rollback()
    await trx.destroy()
    return new Promise((resolve) => {
      resolve()
    })
  })

  it('organization admin should handle organization domain', async (done) => {
    const input = {
      domain: Faker.internet.url(),
    }

    const organizationDomain = await service.handleOrganizationDomain(input, { organizationId: organizationInserted.id }, trx)

    expect(organizationDomain).toEqual(
      expect.objectContaining({
        id: organizationInserted.id,
        domain: input.domain,
      })
    )

    done()
  })
})
