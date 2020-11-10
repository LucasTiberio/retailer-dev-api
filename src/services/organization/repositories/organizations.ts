import { Transaction } from 'knex'
import knexDatabase from '../../../knex-database'
import { _organizationAdapter } from '../adapters'

const getOrganizationById = async (organizationId: string, trx: Transaction) => {
  const organization = await (trx || knexDatabase.knexConfig)('organizations').where('id', organizationId).first().select()
  return organization ? _organizationAdapter(organization) : null
}

const handleOrganizationDomainById = async (domain: string, organizationId: string, trx: Transaction) => {
  const [organizationHandled] = await (trx || knexDatabase.knexConfig)('organizations').update('domain', domain).where('id', organizationId).returning('*')
  return organizationHandled
}

const updateApiKeyByOrganizationId = async (apiKey: string, organizationId: string, trx: Transaction) => {
  const [organizationApiKey] = await (trx || knexDatabase.knexConfig)('organizations').update({ api_key: apiKey }).where('id', organizationId).returning('api_key')
  return organizationApiKey
}

const updatePublicOrganization = async (isPublic: boolean, organizationId: string, trx: Transaction) => {
  const [organizationPublic] = await (trx || knexDatabase.knexConfig)('organizations').update({ public: isPublic }).where('id', organizationId).returning('public')
  return organizationPublic
}

export default {
  getOrganizationById,
  handleOrganizationDomainById,
  updateApiKeyByOrganizationId,
  updatePublicOrganization,
}
