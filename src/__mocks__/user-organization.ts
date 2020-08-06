import Faker from 'faker'
import { OrganizationInviteStatus } from '../services/organization/types'

const UserOrganizationMock = (userId?: string, organizationId?: string) => ({
  id: Faker.random.uuid(),
  user_id: userId || Faker.random.uuid(),
  organization_id: organizationId || Faker.random.uuid(),
  invite_status: OrganizationInviteStatus.ACCEPT,
  invite_hash: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  active: true,
})

export default UserOrganizationMock
