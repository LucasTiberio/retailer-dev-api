import { Integrations } from '../../integration/types'
import knexDatabase from '../../../knex-database'
import { organizationCommissionAdapter } from '../adapters'
import { Transaction } from 'knex'
import { OrganizationCommissionIdentifiers } from '../types'

const getOrganizationCommissionByType = async (identifier: OrganizationCommissionIdentifiers, identifierId: string, organizationId: string, integrationType: Integrations, trx: Transaction) => {
  const organizationCommission = await (trx || knexDatabase.knex)('organization_commission')
    .where('organization_id', organizationId)
    .andWhere('identifier_id', identifierId)
    .andWhere('identifier', identifier)
    .andWhere('type', integrationType)
    .first()
    .select()

  return organizationCommission ? organizationCommissionAdapter(organizationCommission) : null
}

const createOrganizationCommission = async (
  input: {
    identifierId: string
    identifier: OrganizationCommissionIdentifiers
    commissionPercentage: number
    active: boolean
  },
  organizationId: string,
  integrationType: Integrations,
  trx: Transaction
) => {
  const [organizationCommission] = await (trx || knexDatabase.knex)('organization_commission')
    .insert({
      identifier_id: input.identifierId,
      identifier: input.identifier,
      commission_percentage: input.commissionPercentage,
      active: input.active,
      organization_id: organizationId,
      type: integrationType,
    })
    .returning('*')

  return organizationCommissionAdapter(organizationCommission)
}

const updateOrganizationCommission = async (
  input: {
    commissionPercentage: number
    active: boolean
  },
  commissionId: string,
  trx: Transaction
) => {
  const [organizationCommission] = await (trx || knexDatabase.knex)('organization_commission')
    .update({
      commission_percentage: input.commissionPercentage,
      active: input.active,
    })
    .where('id', commissionId)
    .returning('*')

  return organizationCommissionAdapter(organizationCommission)
}

const getByOrganizationIdAndType = async (organizationId: string, integrationType: Integrations, trx: Transaction) => {
  const organizationCommission = await (trx || knexDatabase.knex)('organization_commission')
    .where('organization_id', organizationId)
    .andWhere('type', integrationType)
    .andWhere('active', true)
    .select()

  return organizationCommission
}

export default {
  getOrganizationCommissionByType,
  createOrganizationCommission,
  updateOrganizationCommission,
  getByOrganizationIdAndType,
}
