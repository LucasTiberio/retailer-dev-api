import { Transaction } from 'knex'
import cheerio from 'cheerio'

/** Types */
import { ICreateAffiliateStore, IAffiliateStoreAdapted, IAvatar } from './types'

/** Common */
import {
  affiliateDoesNotExist,
  onlyPnhAndJpgIsSupported,
  minThreeLetters,
  maxAffiliateStoreProductLength,
  onlyThreeBannersInAffiliateStore,
  affiliateStoreNotFound,
  organizationDoestNotHaveActiveIntegration,
  onlyVtexIntegrationFeature,
  organizationDoesNotExist,
  organizationDomainNotFound,
} from '../../common/errors'

/** Utils */
import removeUndefinedOfObjects from '../../utils/removeUndefinedOfObjects'

/** Services */
import StorageService from '../storage/service'
import IntegrationService from '../integration/service'
import OrganizationService from '../organization/service'

/** Repository */
import RepositoryAffiliateStore from './repositories/affiliate-store'
import RepositoryAffiliateStoreProduct from './repositories/affiliate-store-product'
import RepositoryOrganizationAffiliateStore from './repositories/organization-affiliate-store'
import RepositoryOrganizationAffiliateStoreBanner from './repositories/organization_affiliate_store_banner'

/** Adapter */
import { affiliateStoreAdapter, affiliateStoreProductAdapter, organizationAffiliateStoreAdapter, organizationAffiliateStoreBannerAdapter } from './adapters'

/** Clients */
import { fetchVtexProducts, fetchVtexProductsHtml, fetchVtexProductsByIds } from './client/vtex'

import common from '../../common'
import sharp from 'sharp'
import knexDatabase from '../../knex-database'
import { buildProductsHtmlVtexUrl } from '../vtex/helpers'
import client from '../../lib/Redis'
import { Integrations } from '../integration/types'
import { OrganizationServiceMock } from '../../__mocks__'

const handleAffiliateStore = async (
  input: ICreateAffiliateStore,
  context: {
    userServiceOrganizationRolesId: string
    organizationId: string
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
    if (!input.cover.url) {
      const url = await handleAffiliateStoreImages(1120, 130, 'cover', input.cover, context.userServiceOrganizationRolesId, trx)
      input.cover = url
    } else {
      input.cover = input.cover.url
    }
  }

  const [affiliateStoreCreated] = await RepositoryAffiliateStore.findOrUpdate(context.organizationId, context.userServiceOrganizationRolesId, input, trx)

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
    fit: 'cover',
  })

  let newData

  if (process.env.NODE_ENV !== 'test') {
    newData = await data.pipe(pipeline)
  }

  const imageUploaded = await StorageService.uploadImage(
    process.env.NODE_ENV === 'test' ? `tdd/affiliate-store/${type}/${path}` : `affiliate-store/${type}/${path}`,
    process.env.NODE_ENV === 'test' ? data : newData,
    mimetype,
    trx
  )

  return imageUploaded.url
}

const getAffiliateStoreProducts = async (input: { term: string }, context: { secret: string; userServiceOrganizationRolesId: string }, trx: Transaction) => {
  if (input.term.length < 3) {
    throw new Error(minThreeLetters)
  }

  const decode: any = await common.jwtDecode(context.secret)

  const products = await fetchVtexProducts(decode.accountName, input.term)

  let affiliateStore = await RepositoryAffiliateStore.getById(context.userServiceOrganizationRolesId, trx)

  if (affiliateStore) {
    const currentProducts = await RepositoryAffiliateStoreProduct.getByAffiliateStoreId(affiliateStore.id, trx)

    return products.map((item: { productId: string }) => {
      const productFound = currentProducts.find((product) => product.product_id === item.productId)
      return { ...item, added: !!productFound }
    })
  }

  return products
}

const getAffiliateStoreAddedProducts = async (context: { userServiceOrganizationRolesId: string; secret: string }, trx: Transaction) => {
  if (!context.userServiceOrganizationRolesId) throw new Error(affiliateDoesNotExist)

  let affiliateStore = await RepositoryAffiliateStore.getById(context.userServiceOrganizationRolesId, trx)

  const products = await RepositoryAffiliateStoreProduct.getByAffiliateStoreId(affiliateStore.id, trx)

  const decode: any = await common.jwtDecode(context.secret)

  const affiliateStoreIds = products.map((item) => `productId:${item.product_id}`)

  const productsData = await fetchVtexProductsByIds(decode.accountName, affiliateStoreIds.join(','))

  const productsFormatted = products.map((item) => {
    const productFound = productsData.find((product: { productId: string }) => {
      return product.productId == item.product_id
    })
    return { ...item, name: productFound?.name, image: productFound?.image }
  })

  return productsFormatted.map(affiliateStoreProductAdapter)
}

const addProductOnAffiliateStore = async (input: { productId: string }, context: { userServiceOrganizationRolesId: string; organizationId: string }, trx: Transaction) => {
  if (!context.userServiceOrganizationRolesId) throw new Error(affiliateDoesNotExist)

  let affiliateStore = await RepositoryAffiliateStore.getById(context.userServiceOrganizationRolesId, trx)

  if (!affiliateStore) {
    affiliateStore = await RepositoryAffiliateStore.createAffiliateStore(context.userServiceOrganizationRolesId, context.organizationId, trx)
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

/**
 * add organization affiliate store banner on bucket and save in database
 *
 * @param input image to insert in bucket
 * @param context graphql context with organizationId
 * @param trx knex transaction
 */
const addOrganizationAffiliateStoreBanner = async (
  input: {
    data: any
    mimetype: string
  },
  context: {
    organizationId: string
  },
  trx: Transaction
) => {
  let affiliateStore = await RepositoryOrganizationAffiliateStore.getByOrganizationId(context.organizationId, trx)

  if (!affiliateStore) {
    let affiliateStoreCreated = await RepositoryOrganizationAffiliateStore.findOrUpdate(context.organizationId, { active: true }, trx)
    affiliateStore = affiliateStoreCreated[0]
  }

  const banners = await RepositoryOrganizationAffiliateStoreBanner.getCountByOrganizationId(affiliateStore.id, trx)

  if (Number(banners[0].count) >= 3) {
    throw new Error(onlyThreeBannersInAffiliateStore)
  }

  let { mimetype, createReadStream } = await input.data

  let data = createReadStream()

  if (!mimetype.match(/\/png/gi)?.length && !mimetype.match(/\/jpg/gi)?.length && !mimetype.match(/\/jpeg/gi)?.length) {
    throw new Error(onlyPnhAndJpgIsSupported)
  }

  const path = common.encryptSHA256(`${affiliateStore.id}${+new Date()}`)

  const pipeline = sharp().resize(1120, 130, {
    fit: 'cover',
  })

  let newData

  if (process.env.NODE_ENV !== 'test') {
    newData = await data.pipe(pipeline)
  }

  const imageUploaded = await StorageService.uploadImage(
    process.env.NODE_ENV === 'test' ? `tdd/affiliate-store/banners/${path}` : `affiliate-store/banners/${path}`,
    process.env.NODE_ENV === 'test' ? data : newData,
    mimetype,
    trx
  )

  const imageUploadedUrl = imageUploaded.url

  const [bannerAdded] = await RepositoryOrganizationAffiliateStoreBanner.create(affiliateStore.id, imageUploadedUrl, trx)

  return organizationAffiliateStoreBannerAdapter(bannerAdded)
}

/**
 * get organization affiliate store banner in database
 *
 * @param context graphql context with organizationId
 * @param trx knex transaction
 */
const getOrganizationAffiliateStoreBanner = async (
  context: {
    organizationId: string
  },
  trx: Transaction
) => {
  const affiliateStore = await RepositoryOrganizationAffiliateStore.getByOrganizationId(context.organizationId, trx)

  const affiliateStoreBanners = await RepositoryOrganizationAffiliateStoreBanner.getByAffiliateStoreId(affiliateStore.id, trx)

  return affiliateStoreBanners.map(organizationAffiliateStoreBannerAdapter)
}

/**
 * remove organization affiliate store banner in database
 *
 * @param input banner id to remove
 * @param context graphql context with organizationId
 * @param trx knex transaction
 */
const removeOrganizationAffiliateStoreBanner = async (
  input: {
    organizationAffiliateStoreBannerId: string
  },
  context: {
    organizationId: string
  },
  trx: Transaction
) => {
  try {
    const affiliateStore = await RepositoryOrganizationAffiliateStore.getByOrganizationId(context.organizationId, trx)

    // const [affiliateStoreBanner] = await RepositoryOrganizationAffiliateStoreBanner.getByAffiliateStoreId(affiliateStore.id, trx)

    // const bucketKey = affiliateStoreBanner.url.replace(/https:\/\/.*?\//gi, '')

    // await StorageService.deleteImage(bucketKey)

    await RepositoryOrganizationAffiliateStoreBanner.remove(input.organizationAffiliateStoreBannerId, affiliateStore.id, trx)

    return true
  } catch (error) {
    throw new Error(error.message)
  }
}

/**
 * get affiliate store with products html
 *
 * @param input organizationId and affiliateStoreSlug
 * @param trx knex transaction
 */
const getAffiliateStoreWithProducts = async (
  input: {
    organizationId: string
    affiliateStoreSlug: string
  },
  trx: Transaction
) => {
  const organization = await OrganizationService.getOrganizationById(input.organizationId, trx)

  if (!organization) throw new Error(organizationDoesNotExist)

  const affiliateStore = await RepositoryAffiliateStore.getBySlugAndOrganizationId(input.affiliateStoreSlug, input.organizationId, trx)

  if (!affiliateStore) throw new Error(affiliateStoreNotFound)

  const organizationAffiliateStore = await RepositoryOrganizationAffiliateStore.getByOrganizationId(input.organizationId, trx)

  const affiliateStoreProducts = await RepositoryAffiliateStoreProduct.getSearchablesByAffiliateStoreId(affiliateStore.id, trx)

  const affiliateStoreIds = affiliateStoreProducts.map((item) => `productId:${item.product_id}`)

  const integration = await IntegrationService.getIntegrationByOrganizationId(input.organizationId, trx)

  if (!integration) throw new Error(organizationDoestNotHaveActiveIntegration)

  if (integration.type !== Integrations.VTEX) throw new Error(onlyVtexIntegrationFeature)

  if (!organization.domain) throw new Error(organizationDomainNotFound)

  const productsHtml = await fetchVtexProductsHtml(organization.domain, organizationAffiliateStore.shelf_id, affiliateStoreIds.join(','))

  const $ = cheerio.load(productsHtml)

  const productIdsOrdered = affiliateStoreProducts.map((item) => item.product_id)

  const htmlOrdered = productIdsOrdered
    .map((item) => {
      const prevLi = $(`#helperComplement_${item}`).prev()[0]
      return $.html(prevLi)
    })
    .join('')

  return {
    affiliateStore: affiliateStore ? affiliateStoreAdapter(affiliateStore) : null,
    productsHtml: htmlOrdered ?? null,
    affiliateId: affiliateStore?.users_organization_service_roles_id,
  }
}

export default {
  handleAffiliateStore,
  removeOrganizationAffiliateStoreBanner,
  getOrganizationAffiliateStoreBanner,
  handleProductOnAffiliateStoreSearchable,
  handleProductOnAffiliateStoreActivity,
  getOrganizationAffiliateStore,
  addOrganizationAffiliateStoreBanner,
  getAffiliateStore,
  getAffiliateStoreProducts,
  getAffiliateStoreWithProducts,
  addProductOnAffiliateStore,
  handleProductOnAffiliateStoreOrder,
  getAffiliateStoreAddedProducts,
  handleOrganizationAffiliateStore,
}
