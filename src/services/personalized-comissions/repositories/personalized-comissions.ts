import knexDatabase from '../../../knex-database'
import { Transaction } from 'knex'

import camelToSnakeCase from '../../../utils/camelToSnakeCase'
import { ComissionsOrder } from '../types'

const getComissionTypeByOrganizationId = async (organization_id: string, type: string, trx: Transaction) => {
  return await (trx || knexDatabase.knex)('organization_commission_order').where('organization_id', organization_id).andWhere('type', type).first().select()
}

const getComissionOrderByOrganizationId = async (organization_id: string, trx: Transaction) => {
  return await (trx || knexDatabase.knex)('organization_commission_order').where('organization_id', organization_id).select('*').orderBy('order', 'desc')
}

const findOrUpdate = async (input: ComissionsOrder, organization_id: string, trx: Transaction) => {
  const comissionOrder = await getComissionTypeByOrganizationId(organization_id, input.type, trx)

  let query = (trx || knexDatabase.knex)('organization_commission_order')

  const inputAddapted = camelToSnakeCase(input)

  if (!comissionOrder) {
    return await query
      .insert({
        ...inputAddapted,
        organization_id,
        type: input.type,
        order: input.order,
      })
      .returning('*')
  } else {
    return await query
      .update({
        organization_id,
        type: input.type,
        order: input.order,
      })
      .where('id', comissionOrder.id)
      .returning('*')
  }
}

export default {
  findOrUpdate,
  getComissionOrderByOrganizationId,
}
