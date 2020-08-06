process.env.NODE_ENV = 'test'
import service from '../service'
import Faker from 'faker'
import database from '../../../knex-database'
import { Transaction } from 'knex'
import { IUsersOrganizationServiceDB } from '../../services/types'
import createAffiliateMock from '../../../__mocks__/full/create-affiliate-mock'
import OrganizationRulesService from '../../../services/organization-rules/service'
jest.mock('../../../services/organization-rules/service')

describe('Affiliate', () => {
  let trx: Transaction

  let affiliateinserted: IUsersOrganizationServiceDB

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

    affiliateinserted = (await createAffiliateMock(trx)).affiliate
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
      name: Faker.name.firstName(),
      description: Faker.random.uuid(),
      facebook: Faker.random.uuid(),
      youtube: Faker.random.uuid(),
      twitter: Faker.random.uuid(),
      tiktok: Faker.random.uuid(),
      instagram: Faker.random.uuid(),
    }

    await service.handleAffiliateStore(input, { userServiceOrganizationRolesId: affiliateinserted.id }, trx)

    const affiliateStoreFound = await service.getAffiliateStore({ userServiceOrganizationRolesId: affiliateinserted.id }, trx)

    expect(affiliateStoreFound).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        usersOrganizationServiceRolesId: affiliateinserted.id,
        name: input.name,
        description: input.description,
        facebook: input.facebook,
        youtube: input.youtube,
        twitter: input.twitter,
        tiktok: input.tiktok,
        instagram: input.instagram,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    )

    done()
  })
})
