import Faker from 'faker'

const OrganizationMock = (userId?: string, organizationAdditionalInfoId?: string) => ({
  id: Faker.random.uuid(),
  name: Faker.internet.userName(),
  contact_email: Faker.internet.email(),
  organization_additional_infos_id: organizationAdditionalInfoId,
  free_trial: false,
  free_trial_expires: null,
  phone: Faker.phone.phoneNumber(),
  user_id: userId || Faker.random.uuid(),
  active: true,
  slug: Faker.internet.email(),
  updated_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  logo: Faker.internet.avatar(),
})

export default OrganizationMock
