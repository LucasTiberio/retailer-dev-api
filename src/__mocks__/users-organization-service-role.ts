import Faker from 'faker'

const UserOrganizationServiceRolesMock = (serviceRoleId?: string, userOrganizationId?: string, organizationServiceId?: string) => ({
  id: Faker.random.uuid(),
  service_roles_id: serviceRoleId || Faker.random.uuid(),
  users_organization_id: userOrganizationId || Faker.random.uuid(),
  organization_services_id: organizationServiceId || Faker.random.uuid(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})

export default UserOrganizationServiceRolesMock
