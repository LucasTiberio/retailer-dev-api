import Faker from 'faker'

const OrganizationServiceMock = (organizationId?: string, serviceId?: string) => ({
  id: Faker.random.uuid(),
  organization_id: organizationId || Faker.random.uuid(),
  service_id: serviceId || Faker.random.uuid(),
  active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})

export default OrganizationServiceMock
