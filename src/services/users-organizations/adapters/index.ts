import { UserOrganizationAdaptedFromDB } from '../types'

export const usersOrganizationsAdapter = (record: UserOrganizationAdaptedFromDB) => ({
  id: record.id,
  userId: record.user_id,
  organizationId: record.organization_id,
  inviteStatus: record.invite_status,
  inviteHash: record.invite_hash,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
  active: record.active,
  isRequested: record.is_requested,
})
