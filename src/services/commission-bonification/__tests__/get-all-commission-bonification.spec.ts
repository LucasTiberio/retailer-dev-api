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

  it('organization admin should get all commission bonification', async (done) => {
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

    const input2 = {
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
    const commissionBonification2 = await service.createCommissionBonification(input2, { organizationId: organizationInserted.id }, trx)

    const commissionsBonifications = await service.getAllCommissionsBonifications({ organizationId: organizationInserted.id }, trx)

    expect(commissionsBonifications).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: commissionBonification.id,
          organizationId: organizationInserted.id,
          title: input.title,
          type: input.type,
          goal: input.goal,
          recurrency: input.recurrency,
          bonusType: input.bonusType,
          active: true,
          startBonusValidAt: null,
          endBonusValidAt: null,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
        expect.objectContaining({
          id: commissionBonification2.id,
          organizationId: organizationInserted.id,
          title: input2.title,
          type: input2.type,
          goal: input2.goal,
          recurrency: input2.recurrency,
          bonusType: input2.bonusType,
          active: true,
          startBonusValidAt: null,
          endBonusValidAt: null,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      ])
    )

    done()
  })
})
