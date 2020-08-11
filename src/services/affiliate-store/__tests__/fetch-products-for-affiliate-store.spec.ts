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
jest.mock('../../../services/organization-rules/service')

describe('Affiliate', () => {
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

  it('affiliate should get your affiliate store', async (done) => {
    const input = {
      term: 'torta',
    }

    const products = await service.getAffiliateStoreProducts(input, { secret: vtexSecretMock, userServiceOrganizationRolesId: affiliateinserted.id }, trx)

    expect(products).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          productId: '48',
          price: 'R$ 0.60',
          image: 'https://beightoneagency.vteximg.com.br/arquivos/ids/155585/torta.png?v=637215541961770000',
        }),
      ])
    )

    done()
  })
})
