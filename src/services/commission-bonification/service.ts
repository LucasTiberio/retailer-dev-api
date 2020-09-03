import { Transaction } from 'knex'
import { CommissionBonificationWithRules, CommissionBonificationRule } from './types'
import moment from 'moment'

/** Repositories */
import OrganizationCommissionBonificationRepository from './repositories/organization-commission-bonification'
import CommissionBonificationRulesRepository from './repositories/commission-bonification-rules'
import {
  commissionBonificationWithouRules,
  commissionBonificationPastDate,
  commissionBonificationWithFinalPeriodBeforeStartPeriod,
  commissionBonificationOnlyWithTwoDates,
  commissionBonificationRulesWithWrongTargets,
} from '../../common/errors'

const createCommissionBonification = async (input: CommissionBonificationWithRules, context: { organizationId: string }, trx: Transaction) => {
  const { bonusType, goal, recurrency, rules, title, type, endBonusValidAt, startBonusValidAt } = input

  if (!rules.length) throw new Error(commissionBonificationWithouRules)

  if (startBonusValidAt) {
    if (moment(startBonusValidAt).isBefore(moment().utc())) throw new Error(commissionBonificationPastDate)
  }

  if (endBonusValidAt || startBonusValidAt) {
    if ((endBonusValidAt && !startBonusValidAt) || (!endBonusValidAt && startBonusValidAt)) throw new Error(commissionBonificationOnlyWithTwoDates)
  }

  if (endBonusValidAt && startBonusValidAt) {
    if (moment(endBonusValidAt).isBefore(moment(startBonusValidAt))) throw new Error(commissionBonificationWithFinalPeriodBeforeStartPeriod)
  }

  rules
    .sort((a, b) => a.initialTarget - b.initialTarget)
    .forEach((rule: CommissionBonificationRule, index: number) => {
      if (Number(rule.finalTarget) <= Number(rule.initialTarget)) {
        throw new Error(commissionBonificationRulesWithWrongTargets)
      }

      if (index !== 0) {
        const previousRule = rules[index - 1]

        if (previousRule.finalTarget > rule.initialTarget) {
          throw new Error(commissionBonificationRulesWithWrongTargets)
        }
      }
    })

  const organizationCommissionBonification = await OrganizationCommissionBonificationRepository.createOrganizationCommissionBonification(
    {
      bonusType,
      goal,
      recurrency,
      title,
      type,
      endBonusValidAt,
      startBonusValidAt,
    },
    context.organizationId,
    trx
  )

  const organizationCommissionBonificationRules = await CommissionBonificationRulesRepository.createCommissionBonificationRules(rules, organizationCommissionBonification.id, trx)

  return { ...organizationCommissionBonification, rules: organizationCommissionBonificationRules }
}

const deleteCommissionBonification = async (
  input: {
    organizationCommissionBonificationId: string
  },
  context: { organizationId: string },
  trx: Transaction
) => {
  const deletedCommissionBonification = await OrganizationCommissionBonificationRepository.deleteOrganizationCommissionBonification(
    input.organizationCommissionBonificationId,
    context.organizationId,
    trx
  )

  return deletedCommissionBonification
}

const getAllCommissionsBonifications = async (context: { organizationId: string }, trx: Transaction) => {
  const commissionsBonifications = await OrganizationCommissionBonificationRepository.getAllOrganizationCommissionBonification(context.organizationId, trx)

  return commissionsBonifications
}

const getCommissionBonificationById = async (
  commissionInput: {
    organizationCommissionBonificationId: string
  },
  context: { organizationId: string },
  trx: Transaction
) => {
  const commissionsBonifications = await OrganizationCommissionBonificationRepository.getOrganizationCommissionBonificationById(
    commissionInput.organizationCommissionBonificationId,
    context.organizationId,
    trx
  )

  const commissionsBonificationsRules = await CommissionBonificationRulesRepository.getOrganizationCommissionBonificationRulesByCommissionBonificationId(
    commissionInput.organizationCommissionBonificationId,
    trx
  )

  return { ...commissionsBonifications, rules: commissionsBonificationsRules }
}

export default {
  createCommissionBonification,
  deleteCommissionBonification,
  getAllCommissionsBonifications,
  getCommissionBonificationById,
}
