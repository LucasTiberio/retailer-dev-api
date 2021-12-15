import mongoose, { Schema, Document } from 'mongoose'
import { PlugoneSaasCommissionStatus } from '../types'

interface ISaasCommission extends Document {
  _id: string
  plataformIdentifier: string
  plataform: string
  createdAt: string
  value: number
  affiliateId: string
  organizationId: string
  organizationClientName: string
  isPaid: boolean
  commission: number
  status: PlugoneSaasCommissionStatus
  planName: string
}

const SaasCommissionSchema = new Schema<ISaasCommission>({
  plataformIdentifier: { type: String, required: true },
  plataform: { type: String, required: true },
  createdAt: { type: String, required: true },
  planName: { type: String, required: true },
  status: { type: String, required: true },
  organizationClientName: { type: String, required: true },
  value: { type: Number, required: true },
  commission: { type: Number, required: true },
  affiliateId: { type: String, required: true },
  organizationId: { type: String, required: true },
  isPaid: { type: Boolean, required: true },
})

export default mongoose.model<ISaasCommission>('SaasCommission', SaasCommissionSchema, 'SaasCommissions')
