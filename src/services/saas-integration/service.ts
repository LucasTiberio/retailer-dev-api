import { Transaction } from 'knex'

/** types */
import { SaasDefaultCommissionTypes, SaasDefaultCommissionPeriod, SaasDefaultCommissionFormOfPayment } from './types'

/** Repositories */
import SaasDefaultCommissionRepository from './repositories/organization_default_saas_commission'
import SaasCommissionRepository from './repositories/saas_commission'
import { SaasSignautreAdapter } from './adapters'

const handleSassDefaultCommission = async (
  input: {
    type: SaasDefaultCommissionTypes
    value: string
    period: SaasDefaultCommissionPeriod
    initPayCommission: number
    paymentPeriod: number
    formOfPayment: SaasDefaultCommissionFormOfPayment
    advancedOptions: boolean
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

/** get signatures by organization id */
const getSignaturesByOrganizationId = async (context: { organizationId: string }, trx: Transaction) => {
  let signatures = await SaasCommissionRepository.getSignaturesByOrganizationId(context.organizationId)

  return signatures.map(SaasSignautreAdapter)
}

export default {
  handleSassDefaultCommission,
  getSaasDefaultCommission,
  getSignaturesByOrganizationId,
}

// client, value, status

// ver mais -> planName, commissionType, paymentType
