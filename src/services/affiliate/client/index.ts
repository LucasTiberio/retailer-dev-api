import Axios from 'axios'
import { buildGetCategoriesThreeVtexUrl, buildGetProductByProductIdVtexUrl, buildGetSellersVtexUrl } from '../../vtex/helpers'
import { vtexProductNotFound } from '../../../common/errors'

const getLojaIntegradaCategories = async (identifier: string) => {
  const { data: dataLojaIntegradaCategories } = await Axios.get('https://api.awsli.com.br/v1/categoria', {
    params: {
      chave_aplicacao: process.env.LOJA_INTEGRADA_APPLICATION_KEY,
      chave_api: identifier,
    },
  })

  return dataLojaIntegradaCategories.objects
}

const getVtexCategoriesCategories = async (accountName: string) => {
  const { data: vtexCategoriesData } = await Axios.get(buildGetCategoriesThreeVtexUrl(accountName), {
    headers: {
      'content-type': 'Content-Type',
    },
  })

  return vtexCategoriesData
}

const getVtexSubCategories = async (accountName: string) => {
  const { data: vtexCategoriesData } = await Axios.get(buildGetCategoriesThreeVtexUrl(accountName), {
    headers: {
      'content-type': 'Content-Type',
    },
  })

  return vtexCategoriesData.reduce((acc: any, current: any) => {
    return acc.concat(current.children)
  }, [])
}

const getVtexProductByProductId = async (secret: any, productId: string) => {
  try {
    await Axios.get(buildGetProductByProductIdVtexUrl(secret.accountName, productId), {
      headers: {
        'content-type': 'Content-Type',
        'x-vtex-api-appkey': secret.xVtexApiAppKey,
        'x-vtex-api-apptoken': secret.xVtexApiAppToken,
      },
    })

    return true
  } catch (e) {
    return false
  }
}

const getVtexProductDataByProductId = async (secret: any, productId: string) => {
  try {
    const { data } = await Axios.get(buildGetProductByProductIdVtexUrl(secret.accountName, productId), {
      headers: {
        'content-type': 'Content-Type',
        'x-vtex-api-appkey': secret.xVtexApiAppKey,
        'x-vtex-api-apptoken': secret.xVtexApiAppToken,
      },
    })

    return data
  } catch (e) {
    return false
  }
}

const getVtexSellerList = async (secret: any) => {
  try {
    const { data } = await Axios.get(buildGetSellersVtexUrl(secret.accountName), {
      headers: {
        'content-type': 'Content-Type',
        'x-vtex-api-appkey': secret.xVtexApiAppKey,
        'x-vtex-api-apptoken': secret.xVtexApiAppToken,
      },
    })

    return data
  } catch (e) {
    return false
  }
}

export default {
  getLojaIntegradaCategories,
  getVtexSellerList,
  getVtexCategoriesCategories,
  getVtexProductDataByProductId,
  getVtexProductByProductId,
  getVtexSubCategories,
}
