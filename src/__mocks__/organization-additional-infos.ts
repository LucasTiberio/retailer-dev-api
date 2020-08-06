import Faker from 'faker'
import { Integrations } from '../services/integration/types'

const OrganizationAdditionalInfosMock = () => ({
  id: Faker.random.uuid(),
  segment: Faker.name.firstName(),
  resellers_estimate: 1000,
  reason: Faker.random.uuid(),
  plataform: Integrations.VTEX,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})

export default OrganizationAdditionalInfosMock
