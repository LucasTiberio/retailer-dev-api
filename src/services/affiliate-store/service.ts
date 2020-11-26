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
import {
  fetchLojaIntegradaProductsByTerm,
  fetchLojaIntegradaProductsByIds,
  fetchLojaIntegradaProductById,
  fetchLojaIntegradaProductPriceByProductId,
  fetchLojaIntegradaProductStockByProductId,
} from './client/loja-integrada'

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

  console.log('final', { input })

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

const getAffiliateStoreProducts = async (input: { term: string }, context: { secret: string; userServiceOrganizationRolesId: string; organizationId: string }, trx: Transaction) => {
  let products: any[] = []
  if (input.term.length < 3) {
    throw new Error(minThreeLetters)
  }

  const decode: any = await common.jwtDecode(context.secret)

  const integration = await IntegrationService.getIntegrationByOrganizationId(context.organizationId)

  switch (integration.type) {
    case Integrations.LOJA_INTEGRADA:
      const token = integration.identifier

      products = await fetchLojaIntegradaProductsByTerm(token, input.term, context.organizationId)

      let affiliateStoreLI = await RepositoryAffiliateStore.getById(context.userServiceOrganizationRolesId, trx)

      if (affiliateStoreLI) {
        const currentProducts = await RepositoryAffiliateStoreProduct.getByAffiliateStoreId(affiliateStoreLI.id, trx)

        return (
          await Promise.all(
            products.map(async (item: { id: number; nome: string }) => {
              const productFound = currentProducts.find((product) => product.product_id === item.id.toString())

              const product = await fetchLojaIntegradaProductById(token, item.id)
              const productStock = await fetchLojaIntegradaProductStockByProductId(token, item.id)

              if (!product) return null

              if (!productStock.quantidade_disponivel) return null

              return {
                productId: item.id,
                price: undefined,
                image: (product.imagem_principal?.media || product.imagens[0]?.media) ?? 'https://plugone-staging.nyc3.digitaloceanspaces.com/app-assets/semfoto.jpeg',
                name: item.nome,
                added: !!productFound,
              }
            })
          )
        ).filter((item: any) => item)
      }

      return null
    case Integrations.VTEX:
      products = await fetchVtexProducts(decode.accountName, input.term)

      let affiliateStoreVTEX = await RepositoryAffiliateStore.getById(context.userServiceOrganizationRolesId, trx)
      if (affiliateStoreVTEX) {
        const currentProducts = await RepositoryAffiliateStoreProduct.getByAffiliateStoreId(affiliateStoreVTEX.id, trx)

        return (products = products.map((item: { productId: string }) => {
          const productFound = currentProducts.find((product) => product.product_id === item.productId)
          return { ...item, added: !!productFound }
        }))
      }
      return null
    default:
      return []
  }
}

const getAffiliateStoreAddedProducts = async (context: { userServiceOrganizationRolesId: string; secret: string; organizationId: string }, trx: Transaction) => {
  if (!context.userServiceOrganizationRolesId) throw new Error(affiliateDoesNotExist)

  let affiliateStore = await RepositoryAffiliateStore.getById(context.userServiceOrganizationRolesId, trx)

  const products = await RepositoryAffiliateStoreProduct.getByAffiliateStoreId(affiliateStore.id, trx)

  const decode: any = await common.jwtDecode(context.secret)

  const affiliateStoreIds = products.map((item) => `productId:${item.product_id}`)

  const integration = await IntegrationService.getIntegrationByOrganizationId(context.organizationId)

  switch (integration.type) {
    case Integrations.LOJA_INTEGRADA:
      const token = integration.identifier

      return await Promise.all(
        products.map(async (item) => {
          const x = await fetchLojaIntegradaProductById(token, item.product_id)

          return affiliateStoreProductAdapter({
            ...item,
            name: x.nome,
            image: x.imagem_principal?.media ?? 'https://plugone-staging.nyc3.digitaloceanspaces.com/app-assets/semfoto.jpeg',
          })
        })
      )

    case Integrations.VTEX:
      const productsDataVTEX = await fetchVtexProductsByIds(decode.accountName, affiliateStoreIds.join(','))

      let vtexProductsFormatted = products.map((item) => {
        const productFound = productsDataVTEX.find((product: { productId: string }) => {
          return product.productId == item.product_id
        })
        return { ...item, name: productFound?.name, image: productFound?.image }
      })
      return vtexProductsFormatted.map(affiliateStoreProductAdapter)
    default:
      return []
  }
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

  if (!organization.domain) throw new Error(organizationDomainNotFound)

  if (integration.type === Integrations.LOJA_INTEGRADA) {
    const token = integration.identifier
    const productsIds = affiliateStoreProducts.map((item) => item.product_id)

    const products = await Promise.all(
      productsIds.map(async (item) => {
        const product = await fetchLojaIntegradaProductById(token, item)

        return product
      })
    )

    if (products && !products.length)
      return {
        affiliateStore: affiliateStore ? affiliateStoreAdapter(affiliateStore) : null,
        productsHtml: '',
        affiliateId: affiliateStore?.users_organization_service_roles_id,
        integration: Integrations.LOJA_INTEGRADA,
      }

    const liHtmlOrdered = (
      await Promise.all(
        products.map(async (item) => {
          const x = await fetchLojaIntegradaProductById(token, item.id)
          const productPrice = await fetchLojaIntegradaProductPriceByProductId(token, item.id)
          const productStock = await fetchLojaIntegradaProductStockByProductId(token, item.id)

          if (!x) return null

          if (!productStock.quantidade_disponivel) return null

          return `
        <li style="display: flex; flex-direction: column; align-items: center; justify-content: center; max-width: 300px; margin-bottom: 5rem">
          <div style="min-height: 80px; font-size: 1.25rem; margin-bottom: 0.5rem"> ${item.nome} </div>
          <img style="width: 183px; height: 308px; object-fit: contain; margin-bottom: 0.5rem" src="${
            x.imagem_principal?.media ?? 'https://plugone-staging.nyc3.digitaloceanspaces.com/app-assets/semfoto.jpeg'
          }"/>
          ${productPrice.cheio ? `<div style="min-height: 80px; font-size: 0.875rem; margin-bottom: 0.5rem" >R$ ${Number(productPrice.cheio).toFixed(2)}</div>` : ''}  
          <a style="border: 1px solid gray ; padding: 0.5rem ;font-size: 0.875rem; border-radius: 8px" href="${item.url}?utm_campaign=plugone-affiliate_${
            affiliateStore.users_organization_service_roles_id
          }_${input.organizationId}"> Comprar </a>
        </li>
      `
        })
      )
    ).filter((item) => item)

    return {
      affiliateStore: affiliateStore ? affiliateStoreAdapter(affiliateStore) : null,
      productsHtml: liHtmlOrdered.join('') ?? null,
      affiliateId: affiliateStore?.users_organization_service_roles_id,
      integration: Integrations.LOJA_INTEGRADA,
    }
  }

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
    integration: Integrations.VTEX,
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
