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

export default {
  getOrganizationById,
  handleOrganizationDomainById,
}
