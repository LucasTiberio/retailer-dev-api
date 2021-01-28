import mongoose, { Schema, Document } from 'mongoose'
import { OrganizationAffiliateStoreAppConfig } from '../types'

interface IOrganizationAffiliateStoreApps extends Document {
  affiliateStoreApp: string
  organizationId: string
  configs: OrganizationAffiliateStoreAppConfig[]
}

const OrganizationAffiliateStoreApps = new Schema<IOrganizationAffiliateStoreApps>({
  affiliateStoreApp: {
    type: Schema.Types.ObjectId,
    ref: 'AffiliateStoreApps',
    required: true,
  },
  organizationId: {
    type: String,
    required: true,
  },
  configs: {
    type: [Object],
    default: [],
    required: true,
  },
})

export default mongoose.model<IOrganizationAffiliateStoreApps>('OrganizationAffiliateStoreApps', OrganizationAffiliateStoreApps, 'OrganizationAffiliateStoreApps')
