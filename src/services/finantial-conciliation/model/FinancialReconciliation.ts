import mongoose, { Schema, Document } from 'mongoose'

export enum FinancialReconciliationStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  PAID = 'PAID',
}

interface IFinancialReconciliation extends Document {
  status: FinancialReconciliationStatus
  organizationId: string
  orders: number
  revenue: number
  commissionsToPay: number
  createdAt: string
  referenceMonth: string
  close_day: string
  payment_day: string
}

const FinancialReconciliationSchema = new Schema<IFinancialReconciliation>({
  status: { type: String, required: false, default: FinancialReconciliationStatus.OPEN },
  organizationId: { type: String, required: true },
  orders: { type: Number, required: true },
  revenue: { type: Number, required: true },
  commissionsToPay: { type: Number, required: true },
  createdAt: { type: Date, required: true },
  referenceMonth: { type: String, required: true },
  close_day: { type: String, required: true },
  payment_day: { type: String, required: true },
})

export default mongoose.model<IFinancialReconciliation>('FinancialReconciliation', FinancialReconciliationSchema, 'FinancialReconciliation')
