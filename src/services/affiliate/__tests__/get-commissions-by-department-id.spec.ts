process.env.NODE_ENV = 'test'
import service from '../service'
import Faker from 'faker'
import { Transaction } from 'knex'
import OrganizationRulesService from '../../../services/organization-rules/service'
jest.mock('../../../services/organization-rules/service')
import { IOrganizationFromDB } from '../../../services/organization/types'
import knexDatabase from '../../../knex-database'
import { Integrations } from '../../../services/integration/types'
import { OrganizationCommissionIdentifiers } from '../types'
import createOrganizationMock from '../../../__mocks__/full/create-organization-mock'

describe('Affiliate - Handle Commission By Department Id', () => {
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
    trx = await knexDatabase.knex.transaction()

    organizationInserted = await createOrganizationMock(trx)
  })

  afterEach(async () => {
    await trx.rollback()
    await trx.destroy()
    return new Promise((resolve) => {
      resolve()
    })
  })

  test('organization admin get organization commissions', async (done) => {
    const organizationCommissionInput = {
      identifier: OrganizationCommissionIdentifiers.Department,
      identifierId: '1',
      commissionPercentage: 15.5,
      active: true,
    }

    await service.handleOrganizationCommission(organizationCommissionInput, { organizationId: organizationInserted.id }, trx)

    const getOrganizationCommissionByOrganizationIdInput = {
      identifier: organizationCommissionInput.identifier,
    }

    const organizationCommissions = await service.getOrganizationCommissionByOrganizationId(
      {
        organizationId: organizationInserted.id,
      },
      trx
    )

    expect(organizationCommissions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          identifierId: organizationCommissionInput.identifierId,
          identifier: organizationCommissionInput.identifier,
          commissionPercentage: String(organizationCommissionInput.commissionPercentage.toFixed(2)),
          active: organizationCommissionInput.active,
          type: Integrations.VTEX,
        }),
      ])
    )

    done()
  })
})
