import { Transaction } from 'knex'

/** types */
import { SaasDefaultCommissionTypes, SaasDefaultCommissionPeriod } from './types'

/** Repositories */
import SaasDefaultCommissionRepository from './repositories/organization_default_saas_commission'

const handleSassDefaultCommission = async (
  input: {
    type: SaasDefaultCommissionTypes
    value: string
    period: SaasDefaultCommissionPeriod
    initPayCommission: number
    paymentPeriod: number
  },
  context: { organizationId: string },
  trx: Transaction
) => {
  const SaasDefaultCommission = await SaasDefaultCommissionRepository.findOrUpdate(input, context.organizationId, trx)

  return SaasDefaultCommission
}

const getSaasDefaultCommission = async (context: { organizationId: string }, trx: Transaction) => {
  const commissionsBonifications = await SaasDefaultCommissionRepository.getSaasDefaultCommissionByOrganizationId(context.organizationId, trx)

  return commissionsBonifications
}

export default {
  handleSassDefaultCommission,
  getSaasDefaultCommission,
}
