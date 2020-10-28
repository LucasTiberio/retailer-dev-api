import knexDatabase from '../../../knex-database'

interface AffiliateInfoI {
  username: string
  email: string
  id: string
}

const getAffiliateInfos = async (affiliateIds: string[]): Promise<AffiliateInfoI[]> => {
  const affiliates = await knexDatabase
    .knexConfig('users_organization_service_roles as uosr')
    .whereIn('uosr.id', affiliateIds)
    .innerJoin('users_organizations as uo', 'uo.id', 'uosr.users_organization_id')
    .innerJoin('users as u', 'u.id', 'uo.user_id')
    .select('u.username', 'u.email', 'uosr.id')
  return affiliates
}

export default {
  getAffiliateInfos,
}
