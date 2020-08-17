import { buildGetProductsVtexUrl, buildProductsHtmlVtexUrl } from '../../vtex/helpers'
import Axios from 'axios'

export const fetchVtexProducts = async (accountName: string, term: string) => {
  const { data: vtexProductsData } = await Axios.get(`${buildGetProductsVtexUrl(accountName)}/${term}?_from=0&_to=49`, {
    headers: {
      'content-type': 'Content-Type',
    },
  })

  return vtexProductsData.map((product: any) => {
    const [item] = product.items
    const { images, sellers } = item
    const [image] = images
    const [seller] = sellers
    const {
      commertialOffer: { Price },
    } = seller
    return { name: item.name || item.nameComplete, productId: product.productId, price: `R$ ${Price}`, image: image.imageUrl }
  })
}

export const fetchVtexProductsByIds = async (accountName: string, productIds: string) => {
  const { data: vtexProductsData } = await Axios.get(`${buildGetProductsVtexUrl(accountName)}?fq=${productIds}`, {
    headers: {
      'content-type': 'Content-Type',
    },
  })

  return vtexProductsData.map((product: any) => {
    const [item] = product.items
    const { images, sellers } = item
    const [image] = images
    const [seller] = sellers
    const {
      commertialOffer: { Price },
    } = seller
    return { name: item.name || item.nameComplete, productId: product.productId, image: image.imageUrl }
  })
}

export const fetchVtexProductsHtml = async (accountName: string, shelfId: string, affiliateStoreIds: string) => {
  const { data: vtexProductsData } = await Axios.get(buildProductsHtmlVtexUrl(accountName, shelfId, affiliateStoreIds), {
    headers: {
      'content-type': 'Content-Type',
    },
  })

  return vtexProductsData
}
