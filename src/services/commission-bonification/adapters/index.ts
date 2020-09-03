import { OrganizationCommissionBonificationDatabase, CommissionBonificationRuleDatabase } from '../types'

export const organizationCommissionBonificationAdapter = (record: OrganizationCommissionBonificationDatabase) => ({
  id: record.id,
  organizationId: record.organization_id,
  title: record.title,
  type: record.type,
  goal: record.goal,
  recurrency: record.recurrency,
  active: record.active,
  startBonusValidAt: record.start_bonus_valid_at,
  endBonusValidAt: record.end_bonus_valid_at,
  bonusType: record.bonus_type,
  updatedAt: record.updated_at,
  createdAt: record.created_at,
})

export const CommissionBonificationRuleAdapter = (record: CommissionBonificationRuleDatabase) => ({
  id: record.id,
  organizationCommissionBonificationId: record.organization_commission_bonification_id,
  initialTarget: record.initial_target,
  finalTarget: record.final_target,
  bonus: record.bonus,
  active: record.active,
  updatedAt: record.updated_at,
  createdAt: record.created_at,
})
