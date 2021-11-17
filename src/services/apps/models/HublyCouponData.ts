import { IHublyCoupon } from '../types'
import mongoose, { Schema, Document } from 'mongoose'

export interface IHublyCouponDocument extends IHublyCoupon, Document {}

const HublyCoupon = new Schema<IHublyCouponDocument>({
  affiliateId: {
    type: String,
    required: true
  },
  organizationId: {
    type: String,
    required: true
  },
  campaignId: {
    type: String,
    required: true
  },
  coupon: {
    type: String,
    required: true
  },
  sequence: {
    type: Number,
    required: true
  },
  active: {
    type: Boolean,
    required: false,
    default: false
  }
})

const connection = mongoose.connection.useDb('plugone-apps')

export default connection.model<IHublyCouponDocument>('HublyCoupon', HublyCoupon, 'HublyCoupon')
