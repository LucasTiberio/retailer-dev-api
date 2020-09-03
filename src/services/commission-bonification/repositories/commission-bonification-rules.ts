import knexDatabase from '../../../knex-database'
import { Transaction } from 'knex'
import { CommissionBonificationRule } from '../types'
import camelToSnakeCase from '../../../utils/camelToSnakeCase'
import { CommissionBonificationRuleAdapter } from '../adapters'

const createCommissionBonificationRules = async (input: CommissionBonificationRule[], organizationCommissionBonificationId: string, trx: Transaction) => {
  const inputAdapted = input.map(camelToSnakeCase).map((item) => ({ ...item, organization_commission_bonification_id: organizationCommissionBonificationId }))

  const CommissionBonificationCreatedRules = await (trx || knexDatabase.knex)('commission_bonification_rules').insert(inputAdapted).returning('*')
  return CommissionBonificationCreatedRules.map(CommissionBonificationRuleAdapter)
}

const getOrganizationCommissionBonificationRulesByCommissionBonificationId = async (organizationCommissionBonificationId: string, trx: Transaction) => {
  const CommissionBonificationCreatedRules = await (trx || knexDatabase.knex)('commission_bonification_rules')
    .where('organization_commission_bonification_id', organizationCommissionBonificationId)
    .select()
  return CommissionBonificationCreatedRules.map(CommissionBonificationRuleAdapter)
}

export default {
  createCommissionBonificationRules,
  getOrganizationCommissionBonificationRulesByCommissionBonificationId,
}
