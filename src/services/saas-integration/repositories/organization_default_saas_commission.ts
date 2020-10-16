import knexDatabase from '../../../knex-database'
import { Transaction } from 'knex'
import { SaasDefaultCommissionTypes, SaasDefaultCommissionPeriod, SaasDefaultCommissionFormOfPayment } from '../types'
import camelToSnakeCase from '../../../utils/camelToSnakeCase'
import { SaasDefaultCommissionAdapter } from '../adapters'

const findOrUpdate = async (
  input: {
    type: SaasDefaultCommissionTypes
    value: string
    period: SaasDefaultCommissionPeriod
    initPayCommission: number
    paymentPeriod: number
    formOfPayment: SaasDefaultCommissionFormOfPayment
    advancedOptions: boolean
  },
  organizationId: string,
  trx: Transaction
) => {
  const saasDefaultCommissionFound = await getSaasDefaultCommissionByOrganizationId(organizationId, trx)

  let query = (trx || knexDatabase.knexConfig)('organization_default_saas_commission')

  const inputAddapted = camelToSnakeCase(input)

  if (!saasDefaultCommissionFound) {
    const [saasDefaultCommissionCreated] = await query
      .insert({
        ...inputAddapted,
        organization_id: organizationId,
      })
      .returning('*')
    return SaasDefaultCommissionAdapter(saasDefaultCommissionCreated)
  } else {
    const [saasDefaultCommissionUpdated] = await query
      .update({
        ...inputAddapted,
      })
      .where('id', saasDefaultCommissionFound.id)
      .returning('*')
    return SaasDefaultCommissionAdapter(saasDefaultCommissionUpdated)
  }
}

const getSaasDefaultCommissionByOrganizationId = async (organizationId: string, trx: Transaction) => {
  const CommissionBonificationCreatedRules = await (trx || knexDatabase.knexConfig)('organization_default_saas_commission').where('organization_id', organizationId).first().select()
  return CommissionBonificationCreatedRules ? SaasDefaultCommissionAdapter(CommissionBonificationCreatedRules) : null
}

export default {
  findOrUpdate,
  getSaasDefaultCommissionByOrganizationId,
}
