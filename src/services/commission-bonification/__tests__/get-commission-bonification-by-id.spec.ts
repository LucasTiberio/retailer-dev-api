process.env.NODE_ENV = 'test'
import service from '../service'
import Faker from 'faker'
import database from '../../../knex-database'
import { Transaction } from 'knex'
import { IUsersOrganizationServiceDB } from '../../services/types'
import createAffiliateMock from '../../../__mocks__/full/create-affiliate-mock'
import { IOrganizationFromDB } from '../../organization/types'
import { CommissionBonificationTypes, CommissionBonificationGoals, CommissionBonificationRecurrencies, CommissionBonificationBonusTypes } from '../types'

describe('Affiliate Commission Bonification', () => {
  let trx: Transaction

  let affiliateinserted: IUsersOrganizationServiceDB
  let organizationInserted: IOrganizationFromDB

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

  it('organization admin should get commission bonification by id', async (done) => {
    const input = {
      title: Faker.name.firstName(),
      type: CommissionBonificationTypes.absolute,
      goal: CommissionBonificationGoals.total_sales,
      recurrency: CommissionBonificationRecurrencies.monthly,
      bonusType: CommissionBonificationBonusTypes.all_members,
      rules: [
        {
          initialTarget: 0,
          finalTarget: 100.0,
          bonus: 10.0,
        },
        {
          initialTarget: 100.5,
          finalTarget: 200.5,
          bonus: 20.5,
        },
      ],
    }

    const commission = await service.createCommissionBonification(input, { organizationId: organizationInserted.id }, trx)

    const commissionInput = {
      organizationCommissionBonificationId: commission.id,
    }

    const commissionBonification = await service.getCommissionBonificationById(commissionInput, { organizationId: organizationInserted.id }, trx)

    expect(commissionBonification).toEqual(
      expect.objectContaining({
        id: commission.id,
        organizationId: organizationInserted.id,
        title: input.title,
        type: input.type,
        goal: input.goal,
        recurrency: input.recurrency,
        bonusType: input.bonusType,
        active: true,
        startBonusValidAt: null,
        endBonusValidAt: null,
        rules: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            initialTarget: String(input.rules[0].initialTarget.toFixed(2)),
            finalTarget: String(input.rules[0].finalTarget.toFixed(2)),
            bonus: String(input.rules[0].bonus.toFixed(2)),
            organizationCommissionBonificationId: commission.id,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          }),
          expect.objectContaining({
            id: expect.any(String),
            initialTarget: String(input.rules[1].initialTarget.toFixed(2)),
            finalTarget: String(input.rules[1].finalTarget.toFixed(2)),
            bonus: String(input.rules[1].bonus.toFixed(2)),
            organizationCommissionBonificationId: commission.id,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          }),
        ]),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    )

    done()
  })
})
