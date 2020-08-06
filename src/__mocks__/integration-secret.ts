import Faker from 'faker'

const IntegrationSecretMock = () => ({
  id: Faker.random.uuid(),
  secret: Faker.random.uuid(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})

export default IntegrationSecretMock
