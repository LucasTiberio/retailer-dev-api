import { Transaction } from 'knex'

/** Types */
import { ICreateAffiliateStore, IAffiliateStoreAdapted, IAvatar } from './types'

/** Common */
import { affiliateDoesNotExist, onlyPnhAndJpgIsSupported, minThreeLetters, maxAffiliateStoreProductLength } from '../../common/errors'

/** Utils */
import removeUndefinedOfObjects from '../../utils/removeUndefinedOfObjects'

/** Services */
import StorageService from '../storage/service'

/** Repository */
import RepositoryAffiliateStore from './repositories/affiliate-store'
import RepositoryAffiliateStoreProduct from './repositories/affiliate-store-product'
import RepositoryOrganizationAffiliateStore from './repositories/organization-affiliate-store'

/** Adapter */
import { affiliateStoreAdapter, affiliateStoreProductAdapter, organizationAffiliateStoreAdapter } from './adapters'

import common from '../../common'
import sharp from 'sharp'
import { fetchVtexProducts } from './client/vtex'

const handleAffiliateStore = async (
  input: ICreateAffiliateStore,
  context: {
    userServiceOrganizationRolesId: string
  },
  trx: Transaction
): Promise<IAffiliateStoreAdapted> => {
  if (!context.userServiceOrganizationRolesId) throw new Error(affiliateDoesNotExist)

  removeUndefinedOfObjects(input)

  if (input.avatar) {
    const url = await handleAffiliateStoreImages(192, 192, 'avatar', input.avatar, context.userServiceOrganizationRolesId, trx)
    input.avatar = url
  }

  if (input.cover) {
    const url = await handleAffiliateStoreImages(1120, 130, 'cover', input.cover, context.userServiceOrganizationRolesId, trx)
    input.cover = url
  }

  const [affiliateStoreCreated] = await RepositoryAffiliateStore.findOrUpdate(context.userServiceOrganizationRolesId, input, trx)

  return affiliateStoreAdapter(affiliateStoreCreated)
}

const getAffiliateStore = async (context: { userServiceOrganizationRolesId: string }, trx: Transaction) => {
  if (!context.userServiceOrganizationRolesId) throw new Error(affiliateDoesNotExist)

  const affiliateStore = await RepositoryAffiliateStore.getById(context.userServiceOrganizationRolesId, trx)

  return affiliateStore ? affiliateStoreAdapter(affiliateStore) : null
}

const handleAffiliateStoreImages = async (width: number, height: number, type: string, input: IAvatar, affiliateId: string, trx: Transaction) => {
  let { mimetype, data } = input

  if (!mimetype.match(/\/png/gi)?.length && !mimetype.match(/\/jpg/gi)?.length && !mimetype.match(/\/jpeg/gi)?.length) {
    throw new Error(onlyPnhAndJpgIsSupported)
  }

  const path = common.encryptSHA256(affiliateId)

  const pipeline = sharp().resize(width, height, {
    fit: 'contain',
  })

  let newData

  if (process.env.NODE_ENV !== 'test') {
    newData = await data.pipe(pipeline)
  }

  const imageUploaded = await StorageService.uploadImage(
    process.env.NODE_ENV === 'test' ? `tdd/affiliate-store/${type}/${path}` : `affiliatestore/${type}/${path}`,
    process.env.NODE_ENV === 'test' ? data : newData,
    mimetype,
    trx
  )

  return imageUploaded.url
}

const getAffiliateStoreProducts = async (input: { term: string }, context: { secret: string }) => {
  if (input.term.length < 3) {
    throw new Error(minThreeLetters)
  }

  const decode: any = await common.jwtDecode(context.secret)

  const products = await fetchVtexProducts(decode.accountName, input.term)

  return products
}

const getAffiliateStoreAddedProducts = async (context: { userServiceOrganizationRolesId: string }, trx: Transaction) => {
  if (!context.userServiceOrganizationRolesId) throw new Error(affiliateDoesNotExist)

  let affiliateStore = await RepositoryAffiliateStore.getById(context.userServiceOrganizationRolesId, trx)

  const products = await RepositoryAffiliateStoreProduct.getByAffiliateStoreId(affiliateStore.id, trx)

  return products.map(affiliateStoreProductAdapter)
}

const addProductOnAffiliateStore = async (input: { productId: string }, context: { userServiceOrganizationRolesId: string }, trx: Transaction) => {
  if (!context.userServiceOrganizationRolesId) throw new Error(affiliateDoesNotExist)

  let affiliateStore = await RepositoryAffiliateStore.getById(context.userServiceOrganizationRolesId, trx)

  if (!affiliateStore) {
    affiliateStore = await RepositoryAffiliateStore.createAffiliateStore(context.userServiceOrganizationRolesId, trx)
  }

  const affiliateStoreLength = await RepositoryAffiliateStoreProduct.getAffiliateStoreProductLengthByAffiliateId(affiliateStore.id, trx)

  if (Number(affiliateStoreLength[0].count) >= 48) throw new Error(maxAffiliateStoreProductLength)

  const [affiliateStoreProductAdded] = await RepositoryAffiliateStoreProduct.findOrUpdate(affiliateStore.id, input, trx)

  return affiliateStoreProductAdapter(affiliateStoreProductAdded)
}

const handleProductOnAffiliateStoreActivity = async (
  input: {
    affiliateStoreProductId: string
    activity: boolean
  },
  context: { userServiceOrganizationRolesId: string },
  trx: Transaction
) => {
  if (!context.userServiceOrganizationRolesId) throw new Error(affiliateDoesNotExist)

  let affiliateStore = await RepositoryAffiliateStore.getById(context.userServiceOrganizationRolesId, trx)

  let handledProductActivity = await RepositoryAffiliateStoreProduct.handleProductActivity(input, affiliateStore.id, trx)

  return affiliateStoreProductAdapter(handledProductActivity)
}

const handleProductOnAffiliateStoreSearchable = async (
  input: {
    affiliateStoreProductId: string
    searchable: boolean
  },
  context: { userServiceOrganizationRolesId: string },
  trx: Transaction
) => {
  if (!context.userServiceOrganizationRolesId) throw new Error(affiliateDoesNotExist)

  let affiliateStore = await RepositoryAffiliateStore.getById(context.userServiceOrganizationRolesId, trx)

  let handledProductActivity = await RepositoryAffiliateStoreProduct.handleProductSearchable(input, affiliateStore.id, trx)

  return affiliateStoreProductAdapter(handledProductActivity)
}

const handleProductOnAffiliateStoreOrder = async (
  input: {
    affiliateStoreProductId: string
    order: number
  }[],
  context: { userServiceOrganizationRolesId: string },
  trx: Transaction
) => {
  if (!context.userServiceOrganizationRolesId) throw new Error(affiliateDoesNotExist)

  let affiliateStore = await RepositoryAffiliateStore.getById(context.userServiceOrganizationRolesId, trx)

  let handledProductsOrder = await RepositoryAffiliateStoreProduct.handleProductsOrder(input, affiliateStore.id, trx)

  return handledProductsOrder
}

/**
 * create or update organization affiliate store on database
 *
 * @param input possible parameters for insertion or alteration in the database
 * @param context graphql context with organizationId
 * @param trx knex transaction
 */
const handleOrganizationAffiliateStore = async (
  input: {
    active?: boolean
    shelfId?: string
  },
  context: { organizationId: string },
  trx: Transaction
) => {
  const [organizationStore] = await RepositoryOrganizationAffiliateStore.findOrUpdate(context.organizationId, { ...input }, trx)

  return organizationAffiliateStoreAdapter(organizationStore)
}

/**
 * get organization affiliate store on database
 *
 * @param context graphql context with organizationId
 * @param trx knex transaction
 */
const getOrganizationAffiliateStore = async (context: { organizationId: string }, trx: Transaction) => {
  const organizationStore = await RepositoryOrganizationAffiliateStore.getByOrganizationId(context.organizationId, trx)

  return organizationStore ? organizationAffiliateStoreAdapter(organizationStore) : null
}

export default {
  handleAffiliateStore,
  handleProductOnAffiliateStoreSearchable,
  handleProductOnAffiliateStoreActivity,
  getOrganizationAffiliateStore,
  getAffiliateStore,
  getAffiliateStoreProducts,
  addProductOnAffiliateStore,
  handleProductOnAffiliateStoreOrder,
  getAffiliateStoreAddedProducts,
  handleOrganizationAffiliateStore,
}
