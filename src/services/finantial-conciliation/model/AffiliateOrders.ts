import mongoose, { Schema, Document } from 'mongoose'
import { PlugOneAffiliateStatus } from '../types'

interface AffiliateInfo {
  commission?: AffiliateCommission
  affiliateId: string
}

interface AffiliateCommission {
  amount: number
}

interface IAffiliateOrder extends Document {
  creationDate: string
  affiliateInfo: AffiliateInfo
  plugoneAffiliateStatus: PlugOneAffiliateStatus
  organizationId: string
  value: string
  clientProfileData: any
}

const AffiliateVtexOrderSchema = new Schema<IAffiliateOrder>({
  orderId: { type: String, required: true },
  organizationId: { type: String, required: true },
  plugoneAffiliateStatus: { type: String, required: true },
  sellerOrderId: { type: Object, required: true },
  affiliateInfo: { type: Object, required: true },
  marketingData: { type: Object, required: true },
  status: { type: String, required: true },
  statusDescription: { type: String, required: true },
  value: { type: String, required: true },
  creationDate: { type: Date, required: true },
  lastChange: { type: Date, required: true },
  totals: { type: Object, required: false },
  items: { type: Object, required: false },
  clientProfileData: { type: Object, required: false },
  orderFormId: { type: String, required: false },
  isCompleted: { type: Boolean, required: false },
  isPaid: { type: Boolean, required: false, default: false },
  statuses: { type: Array, required: false, default: [] },
})

export default mongoose.model<IAffiliateOrder>('AffiliateOrder', AffiliateVtexOrderSchema, 'AffiliateOrders')
