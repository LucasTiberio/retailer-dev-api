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

  it('affiliate should insert affiliate store', async (done) => {
    const input = {
      avatar: Faker.internet.avatar(),
      cover: Faker.random.image(),
      name: Faker.name.firstName(),
      description: Faker.random.uuid(),
      facebook: Faker.random.uuid(),
      youtube: Faker.random.uuid(),
      twitter: Faker.random.uuid(),
      tiktok: Faker.random.uuid(),
      instagram: Faker.random.uuid(),
    }

    const affiliateStoreCreated = await service.handleAffiliateStore(input, { userServiceOrganizationRolesId: affiliateinserted.id }, trx)

    expect(affiliateStoreCreated).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        usersOrganizationServiceRolesId: affiliateinserted.id,
        avatar: input.avatar,
        cover: input.cover,
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

  it('affiliate should update affiliate store', async (done) => {
    const createInput = {
      avatar: Faker.internet.avatar(),
      cover: Faker.random.image(),
      name: Faker.name.firstName(),
      description: Faker.random.uuid(),
      facebook: Faker.random.uuid(),
      youtube: Faker.random.uuid(),
      twitter: Faker.random.uuid(),
      tiktok: Faker.random.uuid(),
      instagram: Faker.random.uuid(),
    }

    await service.handleAffiliateStore(createInput, { userServiceOrganizationRolesId: affiliateinserted.id }, trx)

    const input = {
      name: Faker.name.firstName(),
    }

    const affiliateStoreUpdated = await service.handleAffiliateStore(input, { userServiceOrganizationRolesId: affiliateinserted.id }, trx)

    expect(affiliateStoreUpdated).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        usersOrganizationServiceRolesId: affiliateinserted.id,
        avatar: createInput.avatar,
        cover: createInput.cover,
        name: input.name,
        description: createInput.description,
        facebook: createInput.facebook,
        youtube: createInput.youtube,
        twitter: createInput.twitter,
        tiktok: createInput.tiktok,
        instagram: createInput.instagram,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    )

    done()
  })
})
