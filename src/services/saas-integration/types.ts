export enum SaasDefaultCommissionPeriod {
  lifetime = 'lifetime',
  personalized = 'personalized',
}

export enum SaasDefaultCommissionTypes {
  absolute = 'absolute',
  percent = 'percent',
}

export enum SaasDefaultCommissionFormOfPayment {
  unique = 'unique',
  recurrency = 'recurrency',
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
  form_of_payment: SaasDefaultCommissionFormOfPayment
  advanced_options: boolean
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
  formOfPayment: SaasDefaultCommissionFormOfPayment
  advancedOptions: boolean
}

export type SaasSignatureFromDB = {
  _id: string
  affiliateId: string
  organizationId: string
  createdAt: string
  isPaid: boolean
  plataform: string
  plataformIdentifier: string
  value: number
  commission: number
  planName: string
  organizationClientName: string
  status: string
}

export enum PlugoneSaasCommissionStatus {
  approved = 'approved',
  pendent = 'pendent',
  reproved = 'reproved',
}
