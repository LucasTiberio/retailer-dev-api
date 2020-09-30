import SaasCommissionSchema from '../models/SaasCommission'

const getSignaturesByOrganizationId = async (organizationId: string) => {
  const signatures = await SaasCommissionSchema.find({ organizationId }).lean()
  return signatures
}

export default {
  getSignaturesByOrganizationId,
}
