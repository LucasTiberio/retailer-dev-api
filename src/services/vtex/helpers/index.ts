export const ORDER_MOMENTS = ['payment-pending', 'payment-approved', 'payment-denied', 'canceled', 'invoiced', 'order-created']

export const buildVerifyVtexSecretsUrl = (accountName: string) => `https://${accountName}.vtexcommercestable.com.br/api/oms/pvt/orders`

export const buildGetOrderById = (accountName: string, orderId: string) => `https://${accountName}.vtexcommercestable.com.br/api/oms/pvt/orders/${orderId}`

export const buildOrderHookVtexUrl = (accountName: string) => `https://${accountName}.vtexcommercestable.com.br/api/orders/hook/config`

export const buildCreateCampaignVtexUrl = (accountName: string) => `https://${accountName}.vtexcommercestable.com.br/api/rnb/pvt/campaignConfiguration`

export const buildGetCategoriesThreeVtexUrl = (accountName: string) => `https://${accountName}.vtexcommercestable.com.br/api/catalog_system/pub/category/tree/1`

export const buildGetProductsVtexUrl = (accountName: string) => `https://${accountName}.myvtex.com/api/catalog_system/pub/products/search`

export const buildGetSellersVtexUrl = (accountName: string) => `https://${accountName}.myvtex.com/api/catalog_system/pvt/seller/list`

export const buildGetProductByProductIdVtexUrl = (accountName: string, productId: string) => `https://${accountName}.myvtex.com/api/catalog/pvt/product/${productId}`

export const buildGetDomainVtexUrl = (accountName: string) => `https://${accountName}.myvtex.com/api/vlm/account/stores`

export const buildProductsHtmlVtexUrl = (domain: string, shelfId: string, productsIds: string) => `https://${domain}/buscapagina?fq=${productsIds}&PS=50&sl=${shelfId}&cc=50&sm=0`
