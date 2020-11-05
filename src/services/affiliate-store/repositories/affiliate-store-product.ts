import knexDatabase from '../../../knex-database'
import { ICreateAffiliateStoreProduct } from '../types'
import { Transaction } from 'knex'
import camelToSnakeCase from '../../../utils/camelToSnakeCase'
import { affiliateStoreProductAdapter } from '../adapters'

const getByProductIdAndAffiliateStoreId = async (productId: string, affiliateStoreId: string, trx: Transaction) => {
  return await (trx || knexDatabase.knexConfig)('affiliate_store_product').where('product_id', productId).andWhere('affiliate_store_id', affiliateStoreId).andWhere('active', true).first().select()
}

const getByProductIdAndAffiliateStoreIdWithoutActive = async (productId: string, affiliateStoreId: string, trx: Transaction) => {
  return await (trx || knexDatabase.knexConfig)('affiliate_store_product').where('product_id', productId).andWhere('affiliate_store_id', affiliateStoreId).first().select()
}

const getByAffiliateStoreId = async (affiliateStoreId: string, trx: Transaction) => {
  return await (trx || knexDatabase.knexConfig)('affiliate_store_product').where('affiliate_store_id', affiliateStoreId).andWhere('active', true).orderBy('order', 'asc').select()
}

const getSearchablesByAffiliateStoreId = async (affiliateStoreId: string, trx: Transaction) => {
  return await (trx || knexDatabase.knexConfig)('affiliate_store_product')
    .where('affiliate_store_id', affiliateStoreId)
    .andWhere('active', true)
    .andWhere('searchable', true)
    .orderBy('order', 'asc')
    .select()
}

const getAffiliateStoreProductLengthByAffiliateId = async (affiliateStoreId: string, trx: Transaction) => {
  return await (trx || knexDatabase.knexConfig)('affiliate_store_product').where('affiliate_store_id', affiliateStoreId).andWhere('active', true).count()
}

const getAffiliateStoreOrderByAffiliateStoreId = async (affiliateStoreId: string, trx: Transaction) => {
  return await (trx || knexDatabase.knexConfig)('affiliate_store_product').andWhere('affiliate_store_id', affiliateStoreId).andWhere('active', true).select('order').orderBy('order', 'desc').first()
}

const findOrUpdate = async (affiliateStoreId: string, input: ICreateAffiliateStoreProduct, trx: Transaction) => {
  const affiliateStoreProduct = await getByProductIdAndAffiliateStoreIdWithoutActive(input.productId, affiliateStoreId, trx)

  const affiliateStoreProductLastOrder = await getAffiliateStoreOrderByAffiliateStoreId(affiliateStoreId, trx)

  let query = (trx || knexDatabase.knexConfig)('affiliate_store_product')

  const inputAddapted = camelToSnakeCase(input)

  if (!affiliateStoreProduct) {
    return await query
      .insert({
        ...inputAddapted,
        affiliate_store_id: affiliateStoreId,
        order: affiliateStoreProductLastOrder ? affiliateStoreProductLastOrder.order + 1 : 1,
      })
      .returning('*')
  } else {
    return await query
      .update({
        active: true,
        searchable: true,
      })
      .where('id', affiliateStoreProduct.id)
      .returning('*')
  }
}

const handleProductActivity = async (
  input: {
    affiliateStoreProductId: string
    activity: boolean
  },
  affiliateStoreId: string,
  trx: Transaction
) => {
  const { affiliateStoreProductId, activity } = input

  const updateInput: {
    active: boolean
    order?: number
  } = {
    active: activity,
  }

  if (activity) {
    const affiliateStoreProductLastOrder = await getAffiliateStoreOrderByAffiliateStoreId(affiliateStoreId, trx)
    updateInput.order = affiliateStoreProductLastOrder ? affiliateStoreProductLastOrder.order + 1 : 1
  }

  const [handledProductActivity] = await (trx || knexDatabase.knexConfig)('affiliate_store_product')
    .update({ ...updateInput })
    .where('affiliate_store_id', affiliateStoreId)
    .andWhere('id', affiliateStoreProductId)
    .returning('*')

  return handledProductActivity
}

const handleProductSearchable = async (
  input: {
    affiliateStoreProductId: string
    searchable: boolean
  },
  affiliateStoreId: string,
  trx: Transaction
) => {
  const { affiliateStoreProductId, searchable } = input

  const [handledProductActivity] = await (trx || knexDatabase.knexConfig)('affiliate_store_product')
    .update({
      searchable,
    })
    .where('affiliate_store_id', affiliateStoreId)
    .andWhere('id', affiliateStoreProductId)
    .returning('*')

  return handledProductActivity
}

const handleProductsOrder = async (
  input: {
    affiliateStoreProductId: string
    order: number
  }[],
  affiliateStoreId: string,
  trx: Transaction
) => {
  try {
    await Promise.all(
      input.map(async (item) => {
        await (trx || knexDatabase.knexConfig)('affiliate_store_product')
          .update({
            order: item.order,
          })
          .where('affiliate_store_id', affiliateStoreId)
          .andWhere('product_id', item.affiliateStoreProductId)
          .returning('*')
      })
    )
    return true
  } catch (e) {
    throw new Error(e.message)
  }
}

export default {
  findOrUpdate,
  getByProductIdAndAffiliateStoreId,
  getAffiliateStoreProductLengthByAffiliateId,
  handleProductActivity,
  handleProductSearchable,
  handleProductsOrder,
  getByAffiliateStoreId,
  getSearchablesByAffiliateStoreId,
}
