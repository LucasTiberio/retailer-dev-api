import organization from '../../organization'
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

const getSignatureCountByOrganizationId = async (organizationId: string) => {
  const signaturesCount = await SaasCommissionSchema.count({ organizationId })
  return signaturesCount
}

export default {
  getSignaturesByOrganizationId,
  getSignaturesByOrganizationIdAndAffiliateId,
  getSignaturesCommissionByOrganizationIdAndAffiliateId,
  getSignatureCountByOrganizationId,
}
