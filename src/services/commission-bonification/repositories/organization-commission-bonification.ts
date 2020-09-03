import knexDatabase from '../../../knex-database'
import { Transaction } from 'knex'
import { CommissionBonification } from '../types'
import { organizationCommissionBonificationAdapter } from '../adapters'

const createOrganizationCommissionBonification = async (input: CommissionBonification, organizationId: string, trx: Transaction) => {
  const [organizationCommissionBonificationCreated] = await (trx || knexDatabase.knex)('organization_commission_bonification')
    .insert({
      organization_id: organizationId,
      title: input.title,
      type: input.type,
      goal: input.goal,
      recurrency: input.recurrency,
      start_bonus_valid_at: input.startBonusValidAt,
      end_bonus_valid_at: input.endBonusValidAt,
      bonus_type: input.bonusType,
    })
    .returning('*')
  return organizationCommissionBonificationAdapter(organizationCommissionBonificationCreated)
}

const deleteOrganizationCommissionBonification = async (organizationCommissionBonificationId: string, organizationId: string, trx: Transaction) => {
  const [organizationCommissionBonificationCreated] = await (trx || knexDatabase.knex)('organization_commission_bonification')
    .update({
      active: false,
    })
    .where('id', organizationCommissionBonificationId)
    .andWhere('organization_id', organizationId)
    .returning('*')
  return organizationCommissionBonificationAdapter(organizationCommissionBonificationCreated)
}

const getAllOrganizationCommissionBonification = async (organizationId: string, trx: Transaction) => {
  const organizationCommissionsBonifications = await (trx || knexDatabase.knex)('organization_commission_bonification').where('organization_id', organizationId).select('*')

  return organizationCommissionsBonifications.map(organizationCommissionBonificationAdapter)
}

const getOrganizationCommissionBonificationById = async (organizationCommissionBonificationId: string, organizationId: string, trx: Transaction) => {
  const organizationCommissionsBonifications = await (trx || knexDatabase.knex)('organization_commission_bonification')
    .where('id', organizationCommissionBonificationId)
    .andWhere('organization_id', organizationId)
    .first()
    .select('*')

  return organizationCommissionsBonifications ? organizationCommissionBonificationAdapter(organizationCommissionsBonifications) : null
}

export default {
  createOrganizationCommissionBonification,
  deleteOrganizationCommissionBonification,
  getAllOrganizationCommissionBonification,
  getOrganizationCommissionBonificationById,
}
