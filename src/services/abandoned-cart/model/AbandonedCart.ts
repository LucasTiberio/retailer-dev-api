import mongoose, { Schema, Document } from 'mongoose'
import { IAbandonedCart, AbandonedCartStatus } from '../types'

export interface IAbandonedCartSchema extends IAbandonedCart, Document {}

const AbandonedCartSchema = new Schema<IAbandonedCartSchema>(
  {
    organizationId: { type: String, required: true },
    orderFormId: { type: String, required: true },
    orderId: { type: String, required: false },
    email: { type: String, required: true },
    phone: { type: String, required: false },
    provider: { type: String, required: true },
    items: { type: Array, required: false, default: [] },
    status: { type: String, required: false, default: AbandonedCartStatus.UNPAID },
    parent: { type: Schema.Types.ObjectId, required: false, ref: 'AbandonedCarts' },
    blockedAffiliates: { type: Array, required: false, default: [] },
    currentAssistantAffiliateId: { type: String, required: false },
    lastAssistanceDate: { type: Date, required: false },
    clientProfileData: { type: Object, required: true },
    observations: { type: Array, required: false, default: [] },
  },
  { timestamps: true }
)

export default mongoose.model<IAbandonedCartSchema>('AbandonedCart', AbandonedCartSchema, 'AbandonedCarts')
