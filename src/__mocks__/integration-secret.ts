import Faker from 'faker'
import vtexSecretMock from './vtexSecretMock'

const IntegrationSecretMock = () => ({
  id: Faker.random.uuid(),
  secret: vtexSecretMock,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})

export default IntegrationSecretMock
