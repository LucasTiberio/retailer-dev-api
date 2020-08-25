process.env.NODE_ENV = 'test'
import service from '../service'
import database from '../../../knex-database'
import { Transaction } from 'knex'
import createOrganizationMock from '../../../__mocks__/full/create-organization-mock'
import OrganizationRulesService from '../../../services/organization-rules/service'
import { IOrganizationFromDB } from '../../organization/types'
import imgGen from 'js-image-generator'
jest.mock('../../../services/organization-rules/service')

describe('Organization', () => {
  let trx: Transaction

  let organizationInserted: IOrganizationFromDB

  beforeAll(async () => {
    const getAffiliateTeammateRulesSpy = jest.spyOn(OrganizationRulesService, 'getAffiliateTeammateRules')

    // getAffiliateTeammateRulesSpy.mockImplementation(
    //   () =>
    //     new Promise((resolve) =>
    //       resolve({
    //         maxAnalysts: 5,
    //         maxSales: 5,
    //         maxTeammates: 5,
    //         maxTransactionTax: 5,
    //         providers: [
    //           {
    //             name: 'vtex',
    //             status: true,
    //           },
    //           {
    //             name: 'loja_integrada',
    //             status: true,
    //           },
    //         ],
    //       })
    //     )
    // )
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

  it('should create comission with type and order', () => {});

  it('should update comission order', () => {});

  // it('organization admin should add organization affiliate store banner', async (done) => {
  //   imgGen.generateImage(50, 50, 80, async function (err: Error, image: any) {
  //     const input = {
  //       data: image.data,
  //       mimetype: 'text/jpg',
  //     }

  //     const organizationAffiliateStore = await service.addOrganizationAffiliateStoreBanner(input, { organizationId: organizationInserted.id }, trx)

  //     expect(organizationAffiliateStore).toEqual(
  //       expect.objectContaining({
  //         id: expect.any(String),
  //         organizationAffiliateStoreId: expect.any(String),
  //         url: expect.any(String),
  //       })
  //     )

  //     done()
  //   })
  // })
})
