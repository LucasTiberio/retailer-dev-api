import SaasCommissionSchema from '../models/SaasCommission'

const getSignaturesByOrganizationId = async (organizationId: string) => {
  const signatures = await SaasCommissionSchema.find({ organizationId }).lean()
  return signatures
}

const getSignaturesByOrganizationIdAndAffiliateId = async (organizationId: string, affiliateId: string) => {
  const signatures = await SaasCommissionSchema.find({ organizationId, affiliateId }).lean()
  return signatures
}

const getSignaturesCommissionByOrganizationIdAndAffiliateId = async (organizationId: string, affiliateId: string) => {
  const signatures = await SaasCommissionSchema.find({ organizationId, affiliateId }).select('commission').lean()
  return signatures
}

export default {
  getSignaturesByOrganizationId,
  getSignaturesByOrganizationIdAndAffiliateId,
  getSignaturesCommissionByOrganizationIdAndAffiliateId,
}
