process.env.NODE_ENV = 'test'
import service from '../service'
import Faker from 'faker'
import database from '../../../knex-database'
import { Transaction } from 'knex'
import { IUsersOrganizationServiceDB } from '../../services/types'
import createAffiliateMock from '../../../__mocks__/full/create-affiliate-mock'
import { IOrganizationFromDB } from '../../organization/types'
import { CommissionBonificationTypes, CommissionBonificationGoals, CommissionBonificationRecurrencies, CommissionBonificationBonusTypes } from '../types'
import {
  commissionBonificationWithouRules,
  commissionBonificationPastDate,
  commissionBonificationWithFinalPeriodBeforeStartPeriod,
  commissionBonificationOnlyWithTwoDates,
  commissionBonificationRulesWithWrongTargets,
} from '../../../common/errors'
import moment from 'moment'

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

  it('organization admin should create new commission bonification', async (done) => {
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

    expect(commissionBonification).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        organizationId: organizationInserted.id,
        title: input.title,
        type: input.type,
        goal: input.goal,
        recurrency: input.recurrency,
        bonusType: input.bonusType,
        startBonusValidAt: null,
        endBonusValidAt: null,
        rules: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            initialTarget: String(input.rules[0].initialTarget.toFixed(2)),
            finalTarget: String(input.rules[0].finalTarget.toFixed(2)),
            bonus: String(input.rules[0].bonus.toFixed(2)),
            organizationCommissionBonificationId: commissionBonification.id,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          }),
          expect.objectContaining({
            id: expect.any(String),
            initialTarget: String(input.rules[1].initialTarget.toFixed(2)),
            finalTarget: String(input.rules[1].finalTarget.toFixed(2)),
            bonus: String(input.rules[1].bonus.toFixed(2)),
            organizationCommissionBonificationId: commissionBonification.id,
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

  it('organization admin should not create new commission bonification without rules', async (done) => {
    const input = {
      title: Faker.name.firstName(),
      type: CommissionBonificationTypes.absolute,
      goal: CommissionBonificationGoals.total_sales,
      recurrency: CommissionBonificationRecurrencies.monthly,
      bonusType: CommissionBonificationBonusTypes.all_members,
      rules: [],
    }

    try {
      await service.createCommissionBonification(input, { organizationId: organizationInserted.id }, trx)
    } catch (error) {
      expect(error.message).toBe(commissionBonificationWithouRules)
      done()
    }
  })

  it('organization admin should not create new commission bonification with past date', async (done) => {
    const input = {
      title: Faker.name.firstName(),
      type: CommissionBonificationTypes.absolute,
      goal: CommissionBonificationGoals.total_sales,
      recurrency: CommissionBonificationRecurrencies.personalized,
      bonusType: CommissionBonificationBonusTypes.all_members,
      startBonusValidAt: moment().subtract(1, 'hours').toISOString(),
      endBonusValidAt: moment().add(1, 'hours').toISOString(),
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

    try {
      await service.createCommissionBonification(input, { organizationId: organizationInserted.id }, trx)
    } catch (error) {
      expect(error.message).toBe(commissionBonificationPastDate)
      done()
    }
  })

  it('organization admin should create new commission bonification with future date', async (done) => {
    const input = {
      title: Faker.name.firstName(),
      type: CommissionBonificationTypes.absolute,
      goal: CommissionBonificationGoals.total_sales,
      recurrency: CommissionBonificationRecurrencies.personalized,
      bonusType: CommissionBonificationBonusTypes.all_members,
      startBonusValidAt: moment().add(1, 'hours').toISOString(),
      endBonusValidAt: moment().add(2, 'hours').toISOString(),
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

    expect(commissionBonification).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        organizationId: organizationInserted.id,
        title: input.title,
        type: input.type,
        goal: input.goal,
        recurrency: input.recurrency,
        bonusType: input.bonusType,
        rules: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            initialTarget: String(input.rules[0].initialTarget.toFixed(2)),
            finalTarget: String(input.rules[0].finalTarget.toFixed(2)),
            bonus: String(input.rules[0].bonus.toFixed(2)),
            organizationCommissionBonificationId: commissionBonification.id,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          }),
          expect.objectContaining({
            id: expect.any(String),
            initialTarget: String(input.rules[1].initialTarget.toFixed(2)),
            finalTarget: String(input.rules[1].finalTarget.toFixed(2)),
            bonus: String(input.rules[1].bonus.toFixed(2)),
            organizationCommissionBonificationId: commissionBonification.id,
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

  it('organization admin should not create new commission bonification end date before start date', async (done) => {
    const input = {
      title: Faker.name.firstName(),
      type: CommissionBonificationTypes.absolute,
      goal: CommissionBonificationGoals.total_sales,
      recurrency: CommissionBonificationRecurrencies.personalized,
      bonusType: CommissionBonificationBonusTypes.all_members,
      startBonusValidAt: moment().add(8, 'days').toISOString(),
      endBonusValidAt: moment().add(5, 'days').toISOString(),
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

    try {
      await service.createCommissionBonification(input, { organizationId: organizationInserted.id }, trx)
    } catch (error) {
      expect(error.message).toBe(commissionBonificationWithFinalPeriodBeforeStartPeriod)
      done()
    }
  })

  it('organization admin should not create new commission bonification with only one date', async (done) => {
    const input = {
      title: Faker.name.firstName(),
      type: CommissionBonificationTypes.absolute,
      goal: CommissionBonificationGoals.total_sales,
      recurrency: CommissionBonificationRecurrencies.personalized,
      bonusType: CommissionBonificationBonusTypes.all_members,
      startBonusValidAt: moment().add(8, 'days').toISOString(),
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

    try {
      await service.createCommissionBonification(input, { organizationId: organizationInserted.id }, trx)
    } catch (error) {
      expect(error.message).toBe(commissionBonificationOnlyWithTwoDates)
      done()
    }
  })

  it('organization admin should not create new commission bonification wrongs rules values', async (done) => {
    const input = {
      title: Faker.name.firstName(),
      type: CommissionBonificationTypes.absolute,
      goal: CommissionBonificationGoals.total_sales,
      recurrency: CommissionBonificationRecurrencies.personalized,
      bonusType: CommissionBonificationBonusTypes.all_members,
      startBonusValidAt: moment().add(1, 'days').toISOString(),
      endBonusValidAt: moment().add(5, 'days').toISOString(),
      rules: [
        {
          initialTarget: 100.0,
          finalTarget: 0,
          bonus: 10.0,
        },
        {
          initialTarget: 100.5,
          finalTarget: 200.5,
          bonus: 20.5,
        },
      ],
    }

    try {
      await service.createCommissionBonification(input, { organizationId: organizationInserted.id }, trx)
    } catch (error) {
      expect(error.message).toBe(commissionBonificationRulesWithWrongTargets)
      done()
    }
  })

  it('organization admin should not create new commission bonification wrongs rules values', async (done) => {
    const input = {
      title: Faker.name.firstName(),
      type: CommissionBonificationTypes.absolute,
      goal: CommissionBonificationGoals.total_sales,
      recurrency: CommissionBonificationRecurrencies.personalized,
      bonusType: CommissionBonificationBonusTypes.all_members,
      startBonusValidAt: moment().add(1, 'days').toISOString(),
      endBonusValidAt: moment().add(5, 'days').toISOString(),
      rules: [
        {
          initialTarget: 250.0,
          finalTarget: 350.5,
          bonus: 40.5,
        },
        {
          initialTarget: 200.0,
          finalTarget: 300.0,
          bonus: 10.0,
        },
        {
          initialTarget: 400.0,
          finalTarget: 500.5,
          bonus: 20.5,
        },
        {
          initialTarget: 600.0,
          finalTarget: 800.5,
          bonus: 30.5,
        },
      ],
    }

    try {
      await service.createCommissionBonification(input, { organizationId: organizationInserted.id }, trx)
    } catch (error) {
      expect(error.message).toBe(commissionBonificationRulesWithWrongTargets)
      done()
    }
  })
})
