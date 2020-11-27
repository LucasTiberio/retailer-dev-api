import { Transaction } from 'knex'
import knexDatabase from '../../../knex-database'

const getOrganizationDomainById = async (organizationId: string) => {
  const organizationDomain = await knexDatabase.knexConfig('organizations').where('id', organizationId).first().select('domain')
  return organizationDomain
}

const handleAbandonedCartActivityByOrganizationId = async (active: boolean, organizationId: string, trx: Transaction) => {
  await knexDatabase.knexConfig('organizations').where('id', organizationId).update({
    abandoned_cart: active,
  })
}

export default {
  getOrganizationDomainById,
  handleAbandonedCartActivityByOrganizationId,
}
