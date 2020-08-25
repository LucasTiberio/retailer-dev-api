process.env.NODE_ENV = 'test'
import service from '../service'
import { Transaction } from 'knex'
import OrganizationRulesService from '../../../services/organization-rules/service'
jest.mock('../../../services/organization-rules/service')
import { IOrganizationFromDB } from '../../../services/organization/types'
import { Integrations } from '../../../services/integration/types'
import knexDatabase from '../../../knex-database'
import createOrganizationMock from '../../../__mocks__/full/create-organization-mock'
import { OrganizationCommissionIdentifiers } from '../types'
import Faker from 'faker'

describe('Affiliate - Handle Commission By Department Id', () => {
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
    trx = await knexDatabase.knex.transaction()

    organizationInserted = await createOrganizationMock(trx)
  })

  afterEach(async () => {
    await trx.rollback()
    await trx.destroy()
    return new Promise((resolve) => {
      resolve()
    })
  })

  test('organization admin handle organization commission by provider type', async (done) => {
    const organizationCommissionInput = {
      identifier: OrganizationCommissionIdentifiers.Affiliate,
      identifierId: Faker.random.uuid(),
      commissionPercentage: 15.5,
      active: true,
    }

    const organizationCommissionCreated = await service.handleOrganizationCommission(organizationCommissionInput, { organizationId: organizationInserted.id }, trx)

    expect(organizationCommissionCreated).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        identifierId: organizationCommissionInput.identifierId,
        identifier: organizationCommissionInput.identifier,
        commissionPercentage: String(organizationCommissionInput.commissionPercentage.toFixed(2)),
        active: organizationCommissionInput.active,
        type: Integrations.VTEX,
      })
    )

    done()
  })

  test('organization admin handle existent organization commission by provider type', async (done) => {
    const organizationCommissionInput = {
      identifier: OrganizationCommissionIdentifiers.Affiliate,
      identifierId: Faker.random.uuid(),
      commissionPercentage: 15.5,
      active: true,
    }

    await service.handleOrganizationCommission(
      organizationCommissionInput,
      {
        organizationId: organizationInserted.id,
      },
      trx
    )

    const organizationCommissionHandleInput = {
      identifier: organizationCommissionInput.identifier,
      identifierId: organizationCommissionInput.identifierId,
      commissionPercentage: 18.5,
      active: true,
    }

    const organizationCommissionCreated = await service.handleOrganizationCommission(
      organizationCommissionHandleInput,
      {
        organizationId: organizationInserted.id,
      },
      trx
    )

    expect(organizationCommissionCreated).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        identifierId: organizationCommissionHandleInput.identifierId,
        identifier: organizationCommissionHandleInput.identifier,
        commissionPercentage: String(organizationCommissionHandleInput.commissionPercentage.toFixed(2)),
        active: organizationCommissionHandleInput.active,
        type: Integrations.VTEX,
      })
    )

    done()
  })
})
