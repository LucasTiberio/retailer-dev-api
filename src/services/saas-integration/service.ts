import { Transaction } from 'knex'

/** types */
import { SaasDefaultCommissionTypes, SaasDefaultCommissionPeriod, SaasDefaultCommissionFormOfPayment } from './types'

/** Repositories */
import SaasDefaultCommissionRepository from './repositories/organization_default_saas_commission'
import SaasCommissionRepository from './repositories/saas_commission'
import { SaasSignatureCommissionAdapter, SaasSignautreAdapter } from './adapters'

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
const getSignaturesByOrganizationId = async (context: { organizationId: string }) => {
  let signatures = await SaasCommissionRepository.getSignaturesByOrganizationId(context.organizationId)

  return signatures.map(SaasSignautreAdapter)
}

/** get signatures by organization id and affiliate id */
const getSignaturesByOrganizationIdAndAffiliateId = async (context: { organizationId: string; userServiceOrganizationRolesId: string }) => {
  let signatures = await SaasCommissionRepository.getSignaturesByOrganizationIdAndAffiliateId(context.organizationId, context.userServiceOrganizationRolesId)

  return signatures.map(SaasSignautreAdapter)
}

/** get signature commission by organization id and affiliate id */
const getSignatureCommissionByOrganizationAndAffiliateId = async (context: { organizationId: string; userServiceOrganizationRolesId: string }) => {
  let signatureCommission = await SaasCommissionRepository.getSignaturesCommissionByOrganizationIdAndAffiliateId(context.organizationId, context.userServiceOrganizationRolesId)

  return signatureCommission.map(SaasSignatureCommissionAdapter)
}

/** get signature count by organization id */
const getSignatureCountByOrganizationId = async (context: { organizationId: string }) => {
  let signatureCount = await SaasCommissionRepository.getSignatureCountByOrganizationId(context.organizationId)

  return signatureCount
}

export default {
  handleSassDefaultCommission,
  getSaasDefaultCommission,
  getSignaturesByOrganizationId,
  getSignaturesByOrganizationIdAndAffiliateId,
  getSignatureCommissionByOrganizationAndAffiliateId,
  getSignatureCountByOrganizationId,
}
