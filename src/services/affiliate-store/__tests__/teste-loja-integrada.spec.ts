process.env.NODE_ENV = 'test'
import { fetchLojaIntegradaProducts, fetchLojaIntegradaProductsByTerm } from '../client/loja-integrada'

describe('Loja Integrada', () => {
  it('should return 4 products', async (done) => {
    const products = await fetchLojaIntegradaProducts('xxx')
    expect(products.length).toBeGreaterThanOrEqual(4)
    done()
  })

  it('should return at least a product with name "camisa" and "cama"', async (done) => {
    const camisasProducts = await fetchLojaIntegradaProductsByTerm('camisa')
    expect(camisasProducts.length).toBeGreaterThanOrEqual(1)

    const camaProducts = await fetchLojaIntegradaProductsByTerm('cama')
    expect(camaProducts.length).toBeGreaterThanOrEqual(1)
    done()
  })
})
