import knexDatabase from '../../../knex-database'
import { Transaction } from 'knex'

import camelToSnakeCase from '../../../utils/camelToSnakeCase'
import { CommissionsOrder } from '../types'

const getCommissionTypeByOrganizationId = async (organization_id: string, type: string, trx: Transaction) => {
  return await (trx || knexDatabase.knex)('organization_commission_order').where('organization_id', organization_id).andWhere('type', type).first().select()
}

const getCommissionOrderByOrganizationId = async (organization_id: string, trx: Transaction) => {
  return await (trx || knexDatabase.knex)('organization_commission_order').where('organization_id', organization_id).select().orderBy('order', 'desc')
}

const findOrUpdate = async (input: CommissionsOrder, organization_id: string, trx: Transaction) => {
  const commissionOrder = await getCommissionTypeByOrganizationId(organization_id, input.type, trx)

  let query = (trx || knexDatabase.knex)('organization_commission_order')

  const inputAddapted = camelToSnakeCase(input)

  if (!commissionOrder) {
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
      .where('id', commissionOrder.id)
      .returning('*')
  }
}

export default {
  findOrUpdate,
  getCommissionOrderByOrganizationId,
}
