import knexDatabase from '../../../knex-database'

const getOrganizationDomainById = async (organizationId: string) => {
  const organizationDomain = await knexDatabase.knexConfig('organizations').where('id', organizationId).first().select('domain')
  return organizationDomain
}

export default {
  getOrganizationDomainById,
}
