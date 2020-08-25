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

  it.only('should return commission', async (done) => {
    const enumLength = Object.keys(CommissionTypes).length;
    console.log(enumLength);
    const comissions = await service.getOrganizationCommissionOrder({ organizationId: organizationInserted.id }, trx);
    console.log(comissions)

    expect(5).toBeGreaterThanOrEqual(enumLength);

    done()
  })
})
