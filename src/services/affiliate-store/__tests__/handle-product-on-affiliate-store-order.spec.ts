process.env.NODE_ENV = 'test'
import service from '../service'
import Faker from 'faker'
import database from '../../../knex-database'
import { Transaction } from 'knex'
import { IUsersOrganizationServiceDB } from '../../services/types'
import createAffiliateMock from '../../../__mocks__/full/create-affiliate-mock'
import OrganizationRulesService from '../../../services/organization-rules/service'
import { IOrganizationFromDB } from '../../organization/types'
import vtexSecretMock from '../../../__mocks__/vtexSecretMock'
import knexDatabase from '../../../knex-database'
jest.mock('../../../services/organization-rules/service')

describe('Affiliate Store', () => {
  let trx: Transaction

  let affiliateinserted: IUsersOrganizationServiceDB
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

    const { organization, affiliate } = await createAffiliateMock(trx)

    affiliateinserted = affiliate
    organizationInserted = organization
  })

  afterEach(async () => {
    await trx.rollback()
    await trx.destroy()
    return new Promise((resolve) => {
      resolve()
    })
  })

  it('affiliate should handle products order in your affiliate store', async (done) => {
    const input = {
      productId: '1',
    }

    const affiliateStoreProductAdded = await service.addProductOnAffiliateStore(input, { userServiceOrganizationRolesId: affiliateinserted.id }, trx)

    const input2 = {
      productId: '2',
    }

    const affiliateStoreProductAdded2 = await service.addProductOnAffiliateStore(input2, { userServiceOrganizationRolesId: affiliateinserted.id }, trx)

    const orderInput = [
      {
        affiliateStoreProductId: affiliateStoreProductAdded.id,
        order: 2,
      },
      {
        affiliateStoreProductId: affiliateStoreProductAdded2.id,
        order: 1,
      },
    ]

    const productHandled = await service.handleProductOnAffiliateStoreOrder(orderInput, { userServiceOrganizationRolesId: affiliateinserted.id }, trx)

    const affiliateStoreProducts = await (trx || knexDatabase.knex)('affiliate_store_product').select()

    expect(productHandled).toBeTruthy()
    expect(affiliateStoreProducts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: orderInput[0].affiliateStoreProductId,
          affiliate_store_id: expect.any(String),
          product_id: affiliateStoreProductAdded.productId,
          active: true,
          searchable: true,
          order: orderInput[0].order,
          clicks: 0,
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
        }),
        expect.objectContaining({
          id: orderInput[1].affiliateStoreProductId,
          affiliate_store_id: expect.any(String),
          product_id: affiliateStoreProductAdded2.productId,
          active: true,
          searchable: true,
          order: orderInput[1].order,
          clicks: 0,
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
        }),
      ])
    )

    done()
  })
})
