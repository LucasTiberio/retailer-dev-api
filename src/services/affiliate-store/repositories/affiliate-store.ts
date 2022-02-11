import knexDatabase from '../../../knex-database'
import { ICreateAffiliateStore } from '../types'
import { Transaction } from 'knex'

const getBySlugAndOrganizationId = async (slug: string, organizationId: string, trx: Transaction) => {
  return await (trx || knexDatabase.knexConfig)('affiliate_store').where('slug', 'like', `%${decodeURI(slug)}%`).andWhere('organization_id', organizationId).first().select()
}

const updateAffiliateStoreSlug = async (affiliateStoreId: string, slug: string, trx: Transaction) => {
  return await (trx || knexDatabase.knexConfig)('affiliate_store').update({ slug }).where('id', affiliateStoreId).returning('*')
}

const getByOrganizationIdAndUserOrganizationServiceRoleId = async (userOrganizationServiceRoleId: string, organizationId: string, trx: Transaction) => {
  return await (trx || knexDatabase.knexConfig)('affiliate_store')
    .where('users_organization_service_roles_id', userOrganizationServiceRoleId)
    .andWhere('organization_id', organizationId)
    .first()
    .select()
}

const getById = async (affiliateId: string, trx: Transaction) => {
  return await (trx || knexDatabase.knexConfig)('affiliate_store').where('users_organization_service_roles_id', affiliateId).first().select()
}

const findOrUpdate = async (organizationId: string, affiliateId: string, input: ICreateAffiliateStore, trx: Transaction) => {
  const affiliateStoreFound = await getById(affiliateId, trx)

  let query = (trx || knexDatabase.knexConfig)('affiliate_store')

  if (!affiliateStoreFound) {
    return await query
      .insert({
        ...input,
        users_organization_service_roles_id: affiliateId,
        organization_id: organizationId,
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

const createAffiliateStore = async (affiliateId: string, organizationId: string, trx: Transaction) => {
  const [affiliateStoreCreated] = await (trx || knexDatabase.knexConfig)('affiliate_store')
    .insert({
      users_organization_service_roles_id: affiliateId,
      organization_id: organizationId,
    })
    .returning('*')
  return affiliateStoreCreated
}

export default {
  findOrUpdate,
  getById,
  createAffiliateStore,
  getBySlugAndOrganizationId,
  getByOrganizationIdAndUserOrganizationServiceRoleId,
  updateAffiliateStoreSlug,
}
