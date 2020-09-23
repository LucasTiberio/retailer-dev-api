export enum SaasDefaultCommissionPeriod {
  lifetime = 'lifetime',
  personalized = 'personalized',
}

export enum SaasDefaultCommissionTypes {
  absolute = 'absolute',
  percent = 'percent',
}

export type SaasDefaultCommissionFromDB = {
  id: string
  organization_id: string
  type: SaasDefaultCommissionTypes
  value: number
  payment_period: number
  active: boolean
  period: SaasDefaultCommissionPeriod
  init_pay_commission: number
  created_at: string
  updated_at: string
}

export type SaasDefaultCommissionAdapted = {
  id: string
  organizationId: string
  type: SaasDefaultCommissionTypes
  value: number
  active: boolean
  paymentPeriod: number
  period: SaasDefaultCommissionPeriod
  initPayCommission: number
  createdAt: string
  updatedAt: string
}
