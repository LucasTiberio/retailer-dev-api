export enum CommissionBonificationTypes {
  absolute = 'absolute',
  percent = 'percent',
}

export enum CommissionBonificationRecurrencies {
  monthly = 'monthly',
  personalized = 'personalized',
}

export enum CommissionBonificationGoals {
  total_sales = 'total_sales',
}

export enum CommissionBonificationBonusTypes {
  all_members = 'all_members',
}

export type CommissionBonificationRule = {
  initialTarget: number
  finalTarget: number
  bonus: number
}

export type CommissionBonificationRules = {
  rules: CommissionBonificationRule[]
}

export type CommissionBonification = {
  title: string
  type: CommissionBonificationTypes
  goal: CommissionBonificationGoals
  recurrency: CommissionBonificationRecurrencies
  bonusType: CommissionBonificationBonusTypes
  startBonusValidAt?: string
  endBonusValidAt?: string
}

export type CommissionBonificationWithRules = CommissionBonification & CommissionBonificationRules

export type OrganizationCommissionBonificationDatabase = {
  id: string
  organization_id: string
  title: string
  type: CommissionBonificationTypes
  active: boolean
  goal: CommissionBonificationGoals
  recurrency: CommissionBonificationRecurrencies
  start_bonus_valid_at?: string
  end_bonus_valid_at?: string
  bonus_type: CommissionBonificationBonusTypes
  created_at: string
  updated_at: string
}

export type CommissionBonificationRuleDatabase = {
  id: string
  organization_commission_bonification_id: string
  initial_target: string
  final_target: string
  active: boolean
  bonus: string
  created_at: string
  updated_at: string
}
