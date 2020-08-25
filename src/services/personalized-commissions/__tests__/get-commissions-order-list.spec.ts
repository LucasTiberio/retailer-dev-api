process.env.NODE_ENV = 'test'
import service from '../service'
import database from '../../../knex-database'
import { Transaction } from 'knex'
import createOrganizationMock from '../../../__mocks__/full/create-organization-mock'
import OrganizationRulesService from '../../organization-rules/service'
import { IOrganizationFromDB } from '../../organization/types'
import { CommissionTypes } from '../types'
jest.mock('../../../services/organization-rules/service')

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
    trx = await database.knex.transaction()

    organizationInserted = await createOrganizationMock(trx)
  })

  afterEach(async () => {
    await trx.rollback()
    await trx.destroy()
    return new Promise((resolve) => {
      resolve()
    })
  })

  it('should return null commission', async (done) => {
    const comissions = await service.getOrganizationCommissionOrder({ organizationId: organizationInserted.id }, trx)

    expect(comissions).toBeNull()

    done()
  })

  it('should return commission', async (done) => {
    const input = {
      commissions: [
        {
          order: 0,
          type: CommissionTypes.AFFILIATE,
        },
        {
          order: 1,
          type: CommissionTypes.CATEGORY,
        },
        {
          order: 2,
          type: CommissionTypes.DEPARTMENT,
        },
        {
          order: 3,
          type: CommissionTypes.PRODUCT,
        },
        {
          order: 4,
          type: CommissionTypes.SELLER,
        },
      ],
    }

    await service.sendOrganizationCommissionOrder(input, { organizationId: organizationInserted.id }, trx)

    const comissions = await service.getOrganizationCommissionOrder({ organizationId: organizationInserted.id }, trx)

    expect(comissions).toEqual(
      expect.arrayContaining(
        input.commissions.map((item) =>
          expect.objectContaining({
            ...item,
          })
        )
      )
    )

    done()
  })
})
