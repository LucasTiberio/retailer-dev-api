import { SaasDefaultCommissionFromDB } from '../types'

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
})
