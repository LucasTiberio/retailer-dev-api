import knexDatabase from '../../../knex-database'
import { Transaction } from 'knex'

const getByAffiliateStoreId = async (organizationAffiliateStoreId: string, trx: Transaction) => {
  return await (trx || knexDatabase.knex)('organization_affiliate_store_banner').where('organization_affiliate_store_id', organizationAffiliateStoreId).select()
}

const getCountByOrganizationId = async (organizationAffiliateStoreId: string, trx: Transaction) => {
  return await (trx || knexDatabase.knex)('organization_affiliate_store_banner').where('organization_affiliate_store_id', organizationAffiliateStoreId).count()
}

const create = async (organizationAffiliateStoreId: string, bannerUrl: string, trx: Transaction) => {
  return await (trx || knexDatabase.knex)('organization_affiliate_store_banner')
    .insert({
      url: bannerUrl,
      organization_affiliate_store_id: organizationAffiliateStoreId,
    })
    .returning('*')
}

const remove = async (organizationAffiliateStoreBannerId: string, affiliateStoreId: string, trx: Transaction) => {
  await (trx || knexDatabase.knex)('organization_affiliate_store_banner').where('id', organizationAffiliateStoreBannerId).andWhere('organization_affiliate_store_id', affiliateStoreId).del()
}

export default {
  getByAffiliateStoreId,
  create,
  getCountByOrganizationId,
  remove,
}
