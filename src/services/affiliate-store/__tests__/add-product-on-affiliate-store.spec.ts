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

  it('affiliate should add product in your affiliate store', async (done) => {
    const createInput = {
      name: Faker.name.firstName(),
    }

    const affiliateStoreCreated = await service.handleAffiliateStore(createInput, { userServiceOrganizationRolesId: affiliateinserted.id, organizationId: organizationInserted.id }, trx)

    const input = {
      productId: '12345',
    }

    const productAdded = await service.addProductOnAffiliateStore(input, { userServiceOrganizationRolesId: affiliateinserted.id, organizationId: organizationInserted.id }, trx)

    expect(productAdded).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        productId: input.productId,
        affiliateStoreId: affiliateStoreCreated.id,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        active: true,
        searchable: true,
        order: 1,
      })
    )

    done()
  })

  it('affiliate should add two product in your affiliate store', async (done) => {
    const createInput = {
      name: Faker.name.firstName(),
    }

    const affiliateStoreCreated = await service.handleAffiliateStore(createInput, { userServiceOrganizationRolesId: affiliateinserted.id, organizationId: organizationInserted.id }, trx)

    const input = {
      productId: '12345',
    }

    await service.addProductOnAffiliateStore(input, { userServiceOrganizationRolesId: affiliateinserted.id, organizationId: organizationInserted.id }, trx)

    const input2 = {
      productId: '123456',
    }

    const product2Added = await service.addProductOnAffiliateStore(input2, { userServiceOrganizationRolesId: affiliateinserted.id, organizationId: organizationInserted.id }, trx)

    expect(product2Added).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        productId: input2.productId,
        affiliateStoreId: affiliateStoreCreated.id,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        active: true,
        searchable: true,
        order: 2,
      })
    )

    done()
  })

  it('affiliate should create your affiliate store by products', async (done) => {
    const input = {
      productId: '12345',
    }

    const productAdded = await service.addProductOnAffiliateStore(input, { userServiceOrganizationRolesId: affiliateinserted.id, organizationId: organizationInserted.id }, trx)

    const affiliateStore = await (trx || knexDatabase.knex)('affiliate_store').first().select('id')

    expect(productAdded).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        productId: input.productId,
        affiliateStoreId: affiliateStore.id,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        active: true,
        searchable: true,
        order: 1,
      })
    )

    done()
  })

  it('affiliate not should add more products in your affiliate store', async (done) => {
    const maxAffiliateStoreProducts = 48

    const createInput = {
      name: Faker.name.firstName(),
    }

    await service.handleAffiliateStore(createInput, { userServiceOrganizationRolesId: affiliateinserted.id, organizationId: organizationInserted.id }, trx)

    const arrayLength = Array(maxAffiliateStoreProducts + 1).fill(0)

    await arrayLength.reduce((accumulatorPromise: any, _, index: number) => {
      return accumulatorPromise.then(async () => {
        await new Promise(async (resolve) => {
          try {
            await service.addProductOnAffiliateStore({ productId: String(index) }, { userServiceOrganizationRolesId: affiliateinserted.id, organizationId: organizationInserted.id }, trx)
          } catch (error) {
            expect(error.message).toBe('max_affiliate_store_product_length')
            done()
          }
          resolve('resolved')
        })
      })
    }, Promise.resolve())
  })
})
