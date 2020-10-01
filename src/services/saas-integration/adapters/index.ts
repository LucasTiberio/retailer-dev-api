import { SaasDefaultCommissionFromDB, SaasSignatureFromDB } from '../types'

export const SaasDefaultCommissionAdapter = (record: SaasDefaultCommissionFromDB) => ({
  id: record.id,
  organizationId: record.organization_id,
  type: record.type,
  value: record.value,
  active: record.active,
  period: record.period,
  initPayCommission: record.init_pay_commission,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
  paymentPeriod: record.payment_period,
  formOfPayment: record.form_of_payment,
  advancedOptions: record.advanced_options,
})

export const SaasSignautreAdapter = (record: SaasSignatureFromDB) => ({
  id: record._id,
  affiliateId: record.affiliateId,
  organizationId: record.organizationId,
  createdAt: record.createdAt,
  isPaid: record.isPaid,
  plataform: record.plataform,
  plataformIdentifier: record.plataformIdentifier,
  commission: record.commission,
  value: record.value,
  planName: record.planName,
  organizationClientName: record.organizationClientName,
  status: record.status,
})
