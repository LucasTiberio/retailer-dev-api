import { Transaction } from 'knex'
import knexDatabase from '../../../knex-database'
import { _usersOrganizationServiceAdapter } from '../adapters'

const getAffiliatesEmailByOrganizationServiceId = async (organizationServiceId: string, trx: Transaction) => {
  const affiliates = await (trx || knexDatabase.knexConfig)('users_organization_service_roles AS uosr')
    .innerJoin('users_organizations AS uo', 'uo.id', 'uosr.users_organization_id')
    .innerJoin('users AS usr', 'usr.id', 'uo.user_id')
    .where('uosr.organization_services_id', organizationServiceId)
    .andWhere('uosr.active', true)
    .select('usr.email', 'uosr.id')

  return affiliates
}

const getAffiliateEmailByIds = async (getAffiliateNamesByIds: string[], trx: Transaction) => {
  const affiliates = await (trx || knexDatabase.knexConfig)('users_organization_service_roles AS uosr')
    .innerJoin('users_organizations AS uo', 'uo.id', 'uosr.users_organization_id')
    .innerJoin('users AS usr', 'usr.id', 'uo.user_id')
    .whereIn('uosr.id', getAffiliateNamesByIds)
    .select('usr.email', 'uosr.id')

  return affiliates
}

export default {
  getAffiliatesEmailByOrganizationServiceId,
  getAffiliateEmailByIds,
}
