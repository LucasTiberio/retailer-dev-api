process.env.NODE_ENV = 'test'
import service from '../service'
import Faker from 'faker'
import database from '../../../knex-database'
import { Transaction } from 'knex'
import { IUsersOrganizationServiceDB } from '../../services/types'
import createAffiliateMock from '../../../__mocks__/full/create-affiliate-mock'
import vtexSecretMock from '../../../__mocks__/vtexSecretMock'
import OrganizationRulesService from '../../../services/organization-rules/service'
import { IOrganizationFromDB } from '../../organization/types'
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

  it('affiliate should get products in your affiliate store', async (done) => {
    const input = {
      productId: '12345',
    }

    await service.addProductOnAffiliateStore(input, { userServiceOrganizationRolesId: affiliateinserted.id, organizationId: organizationInserted.id }, trx)

    const productAdded = await service.getAffiliateStoreAddedProducts({ userServiceOrganizationRolesId: affiliateinserted.id, secret: vtexSecretMock }, trx)

    const affiliateStore = await (trx || knexDatabase.knex)('affiliate_store').first().select()

    expect(productAdded).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          productId: input.productId,
          affiliateStoreId: affiliateStore.id,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          active: true,
          searchable: true,
          order: 1,
        }),
      ])
    )

    done()
  })
})
