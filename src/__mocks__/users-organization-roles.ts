import Faker from 'faker'

const UserOrganizationRoleMock = (userOrganizationId?: string, organizationRoleId?: string) => ({
  id: Faker.random.uuid(),
  users_organization_id: userOrganizationId || Faker.random.uuid(),
  organization_role_id: organizationRoleId || Faker.random.uuid(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})

export default UserOrganizationRoleMock
