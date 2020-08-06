import Faker from 'faker'
import { Integrations } from '../services/integration/types'

const OrganizationIntegrationSecretMock = (secretId?: string, organizationId?: string) => ({
  id: Faker.random.uuid(),
  integration_secrets_id: secretId,
  organization_id: organizationId,
  type: Integrations.VTEX,
  identifier: Faker.name.firstName(),
  active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})

export default OrganizationIntegrationSecretMock
