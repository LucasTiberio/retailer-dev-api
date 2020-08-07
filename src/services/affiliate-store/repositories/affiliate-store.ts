import knexDatabase from '../../../knex-database'
import { ICreateAffiliateStore } from '../types'
import { Transaction } from 'knex'

const getById = async (affiliateId: string, trx: Transaction) => {
  return await (trx || knexDatabase.knex)('affiliate_store').where('users_organization_service_roles_id', affiliateId).first().select()
}

const findOrUpdate = async (affiliateId: string, input: ICreateAffiliateStore, trx: Transaction) => {
  const affiliateStoreFound = await getById(affiliateId, trx)

  let query = (trx || knexDatabase.knex)('affiliate_store')

  if (!affiliateStoreFound) {
    return await query
      .insert({
        ...input,
        users_organization_service_roles_id: affiliateId,
      })
      .returning('*')
  } else {
    return await query
      .update({
        ...input,
      })
      .where('users_organization_service_roles_id', affiliateId)
      .returning('*')
  }
}

const createAffiliateStore = async (affiliateId: string, trx: Transaction) => {
  const [affiliateStoreCreated] = await (trx || knexDatabase.knex)('affiliate_store')
    .insert({
      users_organization_service_roles_id: affiliateId,
    })
    .returning('*')
  return affiliateStoreCreated
}

export default {
  findOrUpdate,
  getById,
  createAffiliateStore,
}
