import knexDatabase from '../../../knex-database'
import { Transaction } from 'knex'
import camelToSnakeCase from '../../../utils/camelToSnakeCase'

const getByOrganizationId = async (organizationId: string, trx: Transaction) => {
  return await (trx || knexDatabase.knexConfig)('organization_affiliate_store').where('organization_id', organizationId).first().select()
}

const findOrUpdate = async (
  organizationId: string,
  input: {
    active?: boolean
    scriptUrl?: string
    shelfId?: string
    allowSlugEdit?: boolean
  },
  trx: Transaction
) => {
  const organizationAffiliateStore = await getByOrganizationId(organizationId, trx)

  let query = (trx || knexDatabase.knexConfig)('organization_affiliate_store')

  const inputAddapted = camelToSnakeCase(input)

  if (!organizationAffiliateStore) {
    return await query
      .insert({
        ...inputAddapted,
        organization_id: organizationId,
      })
      .returning('*')
  } else {
    return await query
      .update({
        ...inputAddapted,
      })
      .where('organization_id', organizationId)
      .returning('*')
  }
}

export default {
  getByOrganizationId,
  findOrUpdate,
}
