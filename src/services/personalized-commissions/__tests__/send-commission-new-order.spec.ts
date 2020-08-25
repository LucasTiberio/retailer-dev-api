process.env.NODE_ENV = 'test'
import service from '../service'
import database from '../../../knex-database'
import { Transaction } from 'knex'
import createOrganizationMock from '../../../__mocks__/full/create-organization-mock'
import OrganizationRulesService from '../../organization-rules/service'
import { IOrganizationFromDB } from '../../organization/types'
import { CommissionTypes } from '../types'
import { organizationCommissionOrderDuplicated } from '../../../common/errors'
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

  it('should create commission with type and order', async (done) => {
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

    const createdCommission = await service.sendOrganizationCommissionOrder(input, { organizationId: organizationInserted.id }, trx)

    expect(createdCommission).toBeTruthy()

    done()
  })

  it('should not sent same orders in commission order array', async (done) => {
    const createInput = {
      commissions: [
        {
          order: 0,
          type: CommissionTypes.AFFILIATE,
        },
        {
          order: 0,
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

    try {
      await service.sendOrganizationCommissionOrder(createInput, { organizationId: organizationInserted.id }, trx)
    } catch (error) {
      expect(error.message).toBe(organizationCommissionOrderDuplicated)
      done()
    }
  })

  it('should update commission order', async (done) => {
    const createInput = {
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

    await service.sendOrganizationCommissionOrder(createInput, { organizationId: organizationInserted.id }, trx)

    const updateInput = {
      commissions: [
        {
          order: 1,
          type: CommissionTypes.AFFILIATE,
        },
        {
          order: 0,
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

    const updatedCommission = await service.sendOrganizationCommissionOrder(updateInput, { organizationId: organizationInserted.id }, trx)

    expect(updatedCommission).toBeTruthy()
    done()
  })
})
