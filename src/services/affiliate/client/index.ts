import Axios from 'axios'
import { buildGetCategoriesThreeVtexUrl, buildGetProductByProductIdVtexUrl, buildGetSellersVtexUrl } from '../../vtex/helpers'
import { LOJA_INTEGRADA_APPLICATION_KEY } from '../../../common/consts'

const getLojaIntegradaCategories = async (identifier: string) => {
  let { data: dataLojaIntegradaCategories } = await Axios.get('https://api.awsli.com.br/v1/categoria', {
    params: {
      chave_aplicacao: process.env.LOJA_INTEGRADA_APPLICATION_KEY,
      chave_api: identifier,
    },
  })

  let categories = dataLojaIntegradaCategories.objects

  const pagesToLoop = Math.ceil(dataLojaIntegradaCategories.meta.total_count / 20) - 1

  if (pagesToLoop > 0) {
    let offsets = []

    for (let index = 1; index <= pagesToLoop; index++) {
      offsets.push(index * 20)
    }

    let otherCategories: any = []

    for (const offset of offsets) {
      let { data: dataLojaIntegradaCategories } = await Axios.get('https://api.awsli.com.br/v1/categoria', {
        params: {
          chave_aplicacao: process.env.LOJA_INTEGRADA_APPLICATION_KEY,
          chave_api: identifier,
          offset,
        },
      })

      otherCategories = [...otherCategories, ...dataLojaIntegradaCategories.objects]
    }

    const responseCategories = categories.concat(otherCategories)

    return responseCategories
  } else {
    return categories
  }
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

const getLojaIntegradaProductByProductId = async (identifier: any, productId: string) => {
  try {
    await Axios.get(`https://api.awsli.com.br/v1/produto/${productId}?descricao_completa=0`, {
      params: {
        chave_aplicacao: LOJA_INTEGRADA_APPLICATION_KEY,
        chave_api: identifier,
      },
    })

    return true
  } catch (e) {
    return false
  }
}

const getLojaIntegradaProductDataByProductId = async (identifier: any, productId: string) => {
  try {
    const { data } = await Axios.get(`https://api.awsli.com.br/v1/produto/${productId}?descricao_completa=0`, {
      params: {
        chave_aplicacao: LOJA_INTEGRADA_APPLICATION_KEY,
        chave_api: identifier,
      },
    })

    return data
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
  getLojaIntegradaProductByProductId,
  getLojaIntegradaProductDataByProductId,
}
