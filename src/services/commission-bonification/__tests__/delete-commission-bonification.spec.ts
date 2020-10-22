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

  it('organization admin should delete commission bonification', async (done) => {
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

    const commissionBonification = await service.createCommissionBonification(input, { organizationId: organizationInserted.id }, trx)

    const removeInput = {
      organizationCommissionBonificationId: commissionBonification.id,
    }

    const deletedCommissionBonification = await service.deleteCommissionBonification(removeInput, { organizationId: organizationInserted.id }, trx)

    expect(deletedCommissionBonification).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        organizationId: organizationInserted.id,
        title: input.title,
        type: input.type,
        goal: input.goal,
        recurrency: input.recurrency,
        bonusType: input.bonusType,
        active: false,
        startBonusValidAt: null,
        endBonusValidAt: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    )

    done()
  })
})
