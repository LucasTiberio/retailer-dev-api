import knexDatabase from '../../../knex-database'
import { Transaction } from 'knex'

const getBankDataByAffiliateIds = async (ids: string[], trx: Transaction) => {
  const affiliatesBankData = await (trx || knexDatabase.knexConfig)('users_organization_service_roles as uosr')
    .whereIn('uosr.id', ids)
    .whereNot('uosr.bank_data_id', null)
    .innerJoin('banks_data as bd', 'bd.id', 'uosr.bank_data_id')
    .innerJoin('brazil_banks as bb', 'bd.brazil_bank_id', 'bb.id')
    .select('uosr.id as affiliate_id', 'bd.agency', 'bd.account', 'bd.account_digit', 'bd.document', 'bd.name as affiliate_name', 'bb.code as bank_code', 'bb.name as bank_name')

  return affiliatesBankData
}

const getAffiliateNameById = async (id: string, trx: Transaction) => {
  const affiliateNameAndEmail = await (trx || knexDatabase.knexConfig)('users_organization_service_roles as uosr')
    .where('uosr.id', id)
    .innerJoin('users_organizations as uo', 'uo.id', 'uosr.users_organization_id')
    .innerJoin('users as u', 'u.id', 'uo.user_id')
    .select('u.username', 'u.email')
    .first()

  return affiliateNameAndEmail.username ?? affiliateNameAndEmail.email
}

export default {
  getBankDataByAffiliateIds,
  getAffiliateNameById,
}
