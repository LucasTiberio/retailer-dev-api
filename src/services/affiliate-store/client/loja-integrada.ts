import axios from 'axios'
import redisClient from '../../../lib/Redis'
import { LOJA_INTEGRADA_APPLICATION_KEY } from '../../../common/envs'

const params = {
  chave_aplicacao: LOJA_INTEGRADA_APPLICATION_KEY,
  chave_api: '',
  limit: 50,
  ativo: 1,
}

export const instance = axios.create({
  baseURL: 'https://api.awsli.com.br/v1',
  timeout: 100000,
  params,
})

export const queryParams = `?chave_aplicacao=${params.chave_aplicacao}&chave_api=${params.chave_api}`

interface ProductListingI {
  meta: {
    limit: number
    total_count: number
    next: string
    previous: string
  }
  objects: ProductI[]
}

interface ProductI {
  apelido: string
  ativo: boolean
  bloqueado: boolean
  descricao_completa: string
  id: number
  nome?: string
  url: string
}

export const fetchLojaIntegradaProducts = async (lojaIntegradaToken: string, organizationId?: string): Promise<ProductI[]> => {
  params.chave_api = lojaIntegradaToken

  let products: any[] = []
  let pages = 0

  const filterProducts = (products: ProductI[]) => products.filter((product) => product.nome !== null)

  try {
    if (organizationId) {
      const cachedLiItems = await redisClient.getAsync(`lojaIntegradaProducts_${organizationId}`)

      if (cachedLiItems) {
        return JSON.parse(cachedLiItems)
      }
    }
    //First fetch to get initial products & total items
    await instance.get('/produto', { params }).then(({ data }) => {
      if (data.meta.next) {
        pages = Math.round(data.meta.total_count / params.limit)
      }

      const filtredProducts = filterProducts(data.objects)
      products = [...products, ...filtredProducts]
    })

    const promises = []

    for (let offset = 1; offset <= pages; offset++) {
      promises.push(offset * params.limit)
    }

    await promises.reduce((accumulatorPromise: any, offset: any) => {
      return accumulatorPromise.then(async () => {
        await new Promise(async (resolve) => {
          setTimeout(() => {
            resolve()
          }, 100)
        })
        return await new Promise(async (resolve) => {
          console.log(offset)
          await instance
            .get('/produto', {
              params: {
                ...params,
                offset,
              },
            })
            .then(({ data }) => {
              const filtredProducts = filterProducts(data.objects)
              products = [...products, ...filtredProducts]
              resolve('resolved')
            })
        })
      }, [])
    }, Promise.resolve())

    const cleanProducts = products
      .map((item) => {
        if (item.filhos?.length > 0) {
          return { nome: item.nome, id: item.id }
        }
      })
      .filter((item) => item)

    if (organizationId) {
      await redisClient.setAsync(`lojaIntegradaProducts_${organizationId}`, JSON.stringify(cleanProducts), 'EX', 1800)
    }
  } catch (error) {
    console.log(error.data)
  }

  return products
}

export const fetchLojaIntegradaProductsByTerm = async (lojaIntegradaToken: string, term = '', organizationId: string): Promise<ProductI[]> => {
  const productList = await fetchLojaIntegradaProducts(lojaIntegradaToken, organizationId)

  const filtredProductList = productList.filter((product) => {
    return product.nome?.toUpperCase().includes(term.toUpperCase())
  })

  return filtredProductList
}

export const fetchLojaIntegradaProductsByIds = async (lojaIntegradaToken: string, ids: string[]) => {
  let products: ProductI[] = []

  try {
    products = await fetchLojaIntegradaProducts(lojaIntegradaToken)

    products = products.filter((product) => ids.includes(product.id.toString()))

    return products
  } catch (error) {
    console.log(error.data)
  }
}

export const fetchLojaIntegradaProductById = async (lojaIntegradaToken: string, id: number) => {
  params.chave_api = lojaIntegradaToken
  try {
    let { data } = await instance.get(`/produto/${id}`, { params })

    return data
  } catch (error) {
    console.log('error.data', error.response.data)
  }
}

export const fetchLojaIntegradaProductPriceByProductId = async (lojaIntegradaToken: string, id: number) => {
  params.chave_api = lojaIntegradaToken
  try {
    let { data } = await instance.get(`/produto_preco/${id}`, { params })

    return data
  } catch (error) {
    console.log(error.data)
  }
}

export const fetchLojaIntegradaProductStockByProductId = async (lojaIntegradaToken: string, id: number) => {
  params.chave_api = lojaIntegradaToken
  try {
    let { data } = await instance.get(`/produto_estoque/${id}`, { params })

    return data
  } catch (error) {
    console.log(error.data)
  }
}
