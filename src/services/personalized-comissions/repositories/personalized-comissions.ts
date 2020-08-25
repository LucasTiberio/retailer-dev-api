import knexDatabase from '../../../knex-database'
import { Transaction } from 'knex'

import camelToSnakeCase from '../../../utils/camelToSnakeCase'
import { ComissionsI } from '../types';

const getComissionTypeByOrganizationId = async (organization_id: string, type: string, trx: Transaction) => {
  return await (trx || knexDatabase.knex)('organization_commission_order').where('organization_id', organization_id).andWhere('type', type).first().select()
}

const getLastComissionsOrderByOrganizationId = async (organization_id: string, trx: Transaction) => {
  return await (trx || knexDatabase.knex)('organization_commission_order').andWhere('organization_id', organization_id).select('order').orderBy('order', 'desc').first()
}

const getComissionOrderByOrganizationId = async (organization_id: string, trx: Transaction) => {
  return await (trx || knexDatabase.knex)('organization_commission_order').where('organization_id', organization_id).select('*').orderBy('order', 'desc');
}

const findOrUpdate = async (input: ComissionsI, organization_id: string, trx: Transaction) => {
  const comissionOrder = await getComissionTypeByOrganizationId(organization_id, input.type, trx);
  const comissionLastOrder = await getLastComissionsOrderByOrganizationId(organization_id, trx)

  let query = (trx || knexDatabase.knex)('organization_commission_order')
  const inputAddapted = camelToSnakeCase(input)

  if (!comissionOrder) {
    return await query
      .insert({
        ...inputAddapted,
        organization_id,
        type: input.type,
        order: comissionLastOrder ? comissionLastOrder.order + 1 : 1,
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

const findOrUpdateList = async (input: ComissionsI[], organization_id: string, trx: Transaction) => {
  input.reduce(async (prevPromise: any, nextComission) => {
    await prevPromise;
    return findOrUpdate(nextComission, organization_id, trx);
  }, Promise.resolve());
};

export default {
  findOrUpdateList,
  getComissionOrderByOrganizationId
}
