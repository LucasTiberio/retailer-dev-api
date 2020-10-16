process.env.NODE_ENV = 'test'
import service from '../service'
import Faker from 'faker'
import database from '../../../knex-database'
import { Transaction } from 'knex'
import { IUsersOrganizationServiceDB } from '../../services/types'
import createAffiliateMock from '../../../__mocks__/full/create-affiliate-mock'
import OrganizationRulesService from '../../../services/organization-rules/service'
import imgGen from 'js-image-generator'
import common from '../../../common'
import { IOrganizationFromDB } from '../../organization/types'
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
    trx = await database.knexConfig.transaction()

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

  it('affiliate should insert affiliate store', async (done) => {
    const input = {
      name: Faker.name.firstName(),
      description: Faker.random.uuid(),
      facebook: Faker.random.uuid(),
      youtube: Faker.random.uuid(),
      twitter: Faker.random.uuid(),
      tiktok: Faker.random.uuid(),
      instagram: Faker.random.uuid(),
    }

    const affiliateStoreCreated = await service.handleAffiliateStore(input, { userServiceOrganizationRolesId: affiliateinserted.id, organizationId: organizationInserted.id }, trx)

    expect(affiliateStoreCreated).toEqual(
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

  it('affiliate should update affiliate store', async (done) => {
    const createInput = {
      name: Faker.name.firstName(),
      description: Faker.random.uuid(),
      facebook: Faker.random.uuid(),
      youtube: Faker.random.uuid(),
      twitter: Faker.random.uuid(),
      tiktok: Faker.random.uuid(),
      instagram: Faker.random.uuid(),
    }

    await service.handleAffiliateStore(createInput, { userServiceOrganizationRolesId: affiliateinserted.id, organizationId: organizationInserted.id }, trx)

    const input = {
      name: Faker.name.firstName(),
    }

    const affiliateStoreUpdated = await service.handleAffiliateStore(input, { userServiceOrganizationRolesId: affiliateinserted.id, organizationId: organizationInserted.id }, trx)

    expect(affiliateStoreUpdated).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        usersOrganizationServiceRolesId: affiliateinserted.id,
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

  it('affiliate should insert avatar in affiliate store', async (done) => {
    imgGen.generateImage(50, 50, 80, async function (err: Error, image: any) {
      const createInput = {
        avatar: {
          mimetype: 'image/jpeg',
          data: image.data,
        },
        name: Faker.name.firstName(),
        description: Faker.random.uuid(),
        facebook: Faker.random.uuid(),
        youtube: Faker.random.uuid(),
        twitter: Faker.random.uuid(),
        tiktok: Faker.random.uuid(),
        instagram: Faker.random.uuid(),
      }

      const affiliateStoreCreated = await service.handleAffiliateStore(createInput, { userServiceOrganizationRolesId: affiliateinserted.id, organizationId: organizationInserted.id }, trx)

      expect(affiliateStoreCreated).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          usersOrganizationServiceRolesId: affiliateinserted.id,
          avatar: `https://plugone-staging.nyc3.digitaloceanspaces.com/tdd/affiliate-store/avatar/${common.encryptSHA256(affiliateinserted.id)}`,
          name: createInput.name,
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

  it('affiliate should insert cover in affiliate store', async (done) => {
    imgGen.generateImage(50, 50, 80, async function (err: Error, image: any) {
      const createInput = {
        cover: {
          mimetype: 'image/jpeg',
          data: image.data,
        },
        name: Faker.name.firstName(),
        description: Faker.random.uuid(),
        facebook: Faker.random.uuid(),
        youtube: Faker.random.uuid(),
        twitter: Faker.random.uuid(),
        tiktok: Faker.random.uuid(),
        instagram: Faker.random.uuid(),
      }

      const affiliateStoreCreated = await service.handleAffiliateStore(createInput, { userServiceOrganizationRolesId: affiliateinserted.id, organizationId: organizationInserted.id }, trx)

      expect(affiliateStoreCreated).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          usersOrganizationServiceRolesId: affiliateinserted.id,
          cover: `https://plugone-staging.nyc3.digitaloceanspaces.com/tdd/affiliate-store/cover/${common.encryptSHA256(affiliateinserted.id)}`,
          name: createInput.name,
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
})
