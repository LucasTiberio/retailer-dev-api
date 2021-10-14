const options = {
  definition: {
    openapi: '3.0.1',
    info: {
      title: 'Plugone Affiliate API Documentation',
      description: 'Plugone Affiliate API for invitations or requests of new members.',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://plugone.local',
      },
      {
        url: 'http://localhost',
      },
      {
        url: 'https://api-staging.plugone.io',
      },
      {
        url: 'https://api.plugone.io',
      },
    ],
    tags: [
      {
        name: 'Invite Members / Request Membership',
      },
    ],
    paths: {
      '/invite-member/{organizationId}': {
        post: {
          tags: ['Invite Members / Request Membership'],
          parameters: [
            {
              name: 'organizationId',
              in: 'path',
              description: 'ID of organization to affiliate users',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              },
            },
          ],
          summary: "Posts an array of users' infos for affiliation",
          requestBody: {
            description: "Array of users' infos",
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      email: {
                        type: 'string',
                        format: 'email',
                        description: 'email of the user',
                      },
                      username: {
                        type: 'string',
                        description: 'username of the object',
                      },
                      phone: {
                        type: 'string',
                        description: 'phone of the object',
                      },
                      document: {
                        type: 'string',
                        description: 'document of the object',
                      },
                      documentType: {
                        type: 'string',
                        description: 'document type "rg" or "cpf" or "cnpj" of the object',
                      },
                    },
                  },
                },
              },
            },
            required: true,
          },
          responses: {
            '200': {
              description: 'success',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      email: {
                        type: 'string',
                        format: 'email',
                        description: 'email of the user',
                      },
                      organizationRoleId: {
                        type: 'string',
                        example: '4beba19c-93a5-4813-b251-dd4badffdb4a',
                        description: 'organization role id of user',
                      },
                      shortUrl: {
                        type: 'string',
                        example: 'https://go-staging.plugone.io/DzChS7hC9',
                        description: 'short url of the home page, using organization domain (null if organization has no domain set)',
                      },
                    },
                  }
                },
              },
            },
            '400': {
              description: 'Invalid token or organizationId',
            },
            '413': {
              description: 'Payload can\'t be bigger than 30 items'
            },
            '429': {
              description: 'Too many requests',
            },
            '500': {
              description: 'Internal Server Error',
            },
          },
          security: [
            {
              'x-plugone-api-token': [],
            },
          ],
        },
      },
      '/affiliates/{organizationId}': {
        get: {
          tags: ['Get Affiliate Info'],
          parameters: [
            {
              name: 'organizationId',
              in: 'path',
              description: 'Organization identifier',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              },
            },
          ],
          responses: {
            '200': {
              description: 'A list of affiliates',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        username: {
                          type: 'string',
                          description: 'affiliate username'
                        },
                        email: {
                          type: 'string',
                          description: 'affiliate email'
                        },
                      }
                    },
                    example: [
                      {
                        username: 'gabrielb8one',
                        email: 'gabriel@b8one.com'
                      },
                      {
                        username: 'gabriel',
                        email: 'gabriel.tamura@b8one.com'
                      }
                    ]
                  }
                }
              }
            },
            '400': {
              description: 'Invalid token or organizationId',
            },
            '429': {
              description: 'Too many requests',
            },
            '500': {
              description: 'Internal Server Error',
            },
          },
          security: [
            {
              'x-plugone-api-token': [],
            },
          ]
        }
      },
      '/affiliates': {
        get: {
          tags: ['Get Affiliates'],
          parameters: [
            {
              name: 'organizationId',
              in: 'query',
              description: 'Organization identifier',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              },
            },
            {
              name: 'documentType',
              in: 'query',
              description: 'Type of document',
              required: false,
              schema: {
                type: 'string',
                example: 'cnpj'
              },
            },
            {
              name: 'document',
              in: 'query',
              description: 'Document identifier',
              required: false,
              schema: {
                type: 'string',
                example: '12456456000109'
              },
            },
            {
              name: 'page',
              in: 'query',
              description: 'current page',
              required: false,
              schema: {
                type: 'string',
                example: '1'
              },
            },
            {
              name: 'perPage',
              in: 'query',
              description: 'quantity that are being returned',
              required: false,
              schema: {
                type: 'string',
                example: '1'
              },
            },
          ],
          responses: {
            '200': {
              description: 'A filterable list of affiliates',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      affiliates: {
                        type: 'array',
                        description: 'Array of affiliate information',
                        items: {
                          type: 'object',
                          properties: {
                            organization_id: {
                              type: 'string',
                              description: 'Organization identifier'
                            },
                            affiliate_id: {
                              type: 'string',
                              description: 'Affiliate identifier'
                            },
                            username: {
                              type: 'string',
                              description: 'Affiliate username'
                            },
                            email: {
                              type: 'string',
                              description: 'Affiliate email'
                            },
                            document: {
                              type: 'string',
                              description: 'Affiliate document'
                            },
                            phone: {
                              type: 'string',
                              description: 'Affiliate phone'
                            },
                            utm: {
                              type: 'string',
                              description: 'Concatenation of organization_id and affiliate_id'
                            },
                          }
                        }
                      }, 
                      pagination: {
                        type: 'object',
                        description: 'Information of pagination',
                        properties: {
                          total: {
                            type: 'integer',
                            description: 'Total items that the full query contains'
                          },
                          lastPage: {
                            type: 'integer',
                            description: 'Last page number'
                          },
                          perPage: {
                            type: 'integer',
                            description: 'Items per page'
                          },
                          currentPage: {
                            type: 'integer',
                            description: 'Current page number'
                          },
                          from: {
                            type: 'integer',
                            description: 'Counting ID of the first item of the current page'
                          },
                          to: {
                            type: 'integer',
                            description: 'Counting ID of the last item of the current page'
                          },
                        }
                      },
                      },
                      example:  
                      {
                        affiliates: [
                          {
                            organization_id: "96da5eff-617a-4fac-8e87-6e14aeb55a5f",
                            affiliate_id: "1126d03f-f149-4181-8d4e-98e39c996bcc",
                            username: "gabi",
                            email: "gabriela.pinheiro@teste2.com",
                            document: "51294056840",
                            phone: "1232132",
                            utm: "96da5eff-617a-4fac-8e87-6e14aeb55a5f_1126d03f-f149-4181-8d4e-98e39c996bcc"
                          }
                        ],
                        pagination: {
                          total: 75,
                          lastPage: 75,
                          perPage: 1,
                          currentPage: 1,
                          from: 0,
                          to: 1
                        }
                      }
                  }
                },
              }
            },
            '400': {
              description: 'Invalid token or organizationId',
            },
            '429': {
              description: 'Too many requests',
            },
            '500': {
              description: 'Internal Server Error',
            },
          },
          security: [
            {
              'x-plugone-api-token': [],
            },
          ]
        }
      },
      '/orders': {
        get: {
          tags: ['Get Orders'],
          summary: 'Get all organizations orders, paginated and limited by 20 in each interaction. The order format depends on the integration type (VTEX or Loja Integrada)',
          parameters: [
            {
              name: 'organizationId',
              in: 'query',
              description: 'Organization identifier',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              },
            },
            {
              name: 'page',
              in: 'query',
              description: 'current page',
              required: false,
              schema: {
                type: 'string',
                example: '1'
              },
            },
          ],
          responses: {
            '200': {
              description: 'A list of orders',
              content: {
                'application/json': {
                  schema: {
                  type: 'object',
                    properties: {
                      orders: {
                        type: 'array',
                        description: 'array of orders'
                      },
                      count: {
                        type: 'integer',
                        description: 'total orders'
                      },
                      page: {
                        type: 'integer',
                        description: 'current page'
                      },
                      limit: {
                        type: 'integer',
                        description: 'quantity that are being returned'
                      },
                      totalPages: {
                        type: 'integer',
                        description: 'total pages'
                      }
                    },
                    example: {
                      orders: {
                        "isPaid": false,
                        "statuses": [
                          "order-created",
                          "payment-approved",
                          "invoiced"
                        ],
                        "_id": "5f46e00085f831835dc9863e",
                        "orderId": "1057341171378-01",
                        "organizationId": "96da5eff-617a-4fac-8e87-6e14aeb55a5f",
                        "__v": 0,
                        "affiliateInfo": {
                          "affiliateId": "beba3b6a-4e39-4d50-bdb8-6182b2e35f93",
                          "commission": {
                            "amount": 54,
                            "payDay": "2020-10-15T22:20:49.559Z"
                          }
                        },
                        "clientProfileData": {
                          "id": "clientProfileData",
                          "email": "6378884748a5442ea25306aa77653471@ct.vtex.com.br",
                          "firstName": "Gabriel",
                          "lastName": "Tamura",
                          "documentType": "cpf",
                          "document": "37859614804",
                          "phone": "+5511974540961",
                          "corporateName": null,
                          "tradeName": null,
                          "corporateDocument": null,
                          "stateInscription": null,
                          "corporatePhone": null,
                          "isCorporate": false,
                          "userProfileId": "847e33af-25eb-45dc-92ab-744023356f48",
                          "customerClass": null
                        },
                        "creationDate": "2020-08-26T22:19:28.126Z",
                        "isCompleted": true,
                        "items": [
                          {
                            "uniqueId": "E0DC16B3D47F4332B2190F5BF29ECFCD",
                            "id": "48",
                            "productId": "48",
                            "ean": "7898000000034",
                            "lockId": "00-1057341171378-01",
                            "itemAttachment": {
                              "name": null
                            },
                            "attachments": [],
                            "quantity": 1,
                            "seller": "1",
                            "name": "Torta de Limão Sabor & Delicia 500g",
                            "refId": null,
                            "price": 6000,
                            "listPrice": 6000,
                            "manualPrice": null,
                            "priceTags": [],
                            "imageUrl": "https://beightoneagency.vteximg.com.br/arquivos/ids/155585-72-72/torta.png?v=637215541961770000",
                            "detailUrl": "/torta-de-limao-sabor---delicia-500g/p",
                            "components": [],
                            "bundleItems": [],
                            "params": [],
                            "offerings": [],
                            "sellerSku": "48",
                            "priceValidUntil": null,
                            "commission": 0,
                            "tax": 0,
                            "preSaleDate": null,
                            "additionalInfo": {
                              "brandName": "Padaria delícia",
                              "brandId": "2000034",
                              "categoriesIds": "/5/8/",
                              "categories": [
                                {
                                  "id": 8,
                                  "name": "Doces"
                                },
                                {
                                  "id": 5,
                                  "name": "Padaria"
                                }
                              ],
                              "productClusterId": "143,148",
                              "commercialConditionId": "1",
                              "dimension": {
                                "cubicweight": 1,
                                "height": 0.5,
                                "length": 0.5,
                                "weight": 0.5,
                                "width": 0.5
                              },
                              "offeringInfo": null,
                              "offeringType": null,
                              "offeringTypeId": null
                            },
                            "measurementUnit": "un",
                            "unitMultiplier": 1,
                            "sellingPrice": 60,
                            "isGift": false,
                            "shippingPrice": null,
                            "rewardValue": 0,
                            "freightCommission": 0,
                            "priceDefinitions": null,
                            "taxCode": "",
                            "parentItemIndex": null,
                            "parentAssemblyBinding": null,
                            "callCenterOperator": null,
                            "serialNumbers": null,
                            "assemblies": [],
                            "costPrice": 6000
                          }
                        ],
                        "lastChange": "2020-08-26T22:20:32.296Z",
                        "orderFormId": "0254ed95214f45589b51816bada904d7",
                        "plugoneAffiliateStatus": "Approved",
                        "sellerOrderId": "00-1057341171378-01",
                        "status": "window-to-cancel",
                        "statusDescription": "Carência para Cancelamento",
                        "totals": [
                          {
                            "id": "Items",
                            "name": "Total dos Itens",
                            "value": 6000
                          },
                          {
                            "id": "Discounts",
                            "name": "Total dos Descontos",
                            "value": 0
                          },
                          {
                            "id": "Shipping",
                            "name": "Total do Frete",
                            "value": 2188
                          },
                          {
                            "id": "Tax",
                            "name": "Total da Taxa",
                            "value": 0
                          }
                        ],
                        "value": "60"
                      },
                      "count": 28,
                      "page": 2,
                      "limit": 20,
                      "totalPages": 2
                    },
                  }
                }
              }
            },
            '400': {
              description: 'Invalid token or organizationId',
            },
            '401': {
              description: 'api key inexistent'
            },
            '429': {
              description: 'Too many requests',
            },
            '500': {
              description: 'Internal Server Error',
            },
          },
          security: [
            {
              'x-plugone-api-token': [],
            },
          ]
        }
      },
      '/orders/{orderId}': {
        get: {
          tags: ['Get Order'],
          summary: 'Get an order detail. The order format depends on the integration type (VTEX or Loja Integrada)',
          parameters: [
            {
              name: 'organizationId',
              in: 'path',
              description: 'order identifier (VTEX orderId or Loja Integrada number)',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              },
            },
            {
              name: 'organizationId',
              in: 'query',
              description: 'Organization identifier',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              },
            },
          ],
          responses: {
            '200': {
              description: 'A list of orders',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      affiliateInfo: {
                        type: 'object',
                        description: 'affiliate infos'
                      },
                      isPaid: {
                        type: 'boolean',
                        description: 'is order paid or not'
                      }
                    },
                    example: {
                      "isPaid": false,
                      "statuses": [
                        "order-created",
                        "payment-approved",
                        "invoiced"
                      ],
                      "_id": "5f46e00085f831835dc9863e",
                      "orderId": "1057341171378-01",
                      "organizationId": "96da5eff-617a-4fac-8e87-6e14aeb55a5f",
                      "__v": 0,
                      "affiliateInfo": {
                        "affiliateId": "beba3b6a-4e39-4d50-bdb8-6182b2e35f93",
                        "commission": {
                          "amount": 54,
                          "payDay": "2020-10-15T22:20:49.559Z"
                        }
                      },
                      "clientProfileData": {
                        "id": "clientProfileData",
                        "email": "6378884748a5442ea25306aa77653471@ct.vtex.com.br",
                        "firstName": "Gabriel",
                        "lastName": "Tamura",
                        "documentType": "cpf",
                        "document": "37859614804",
                        "phone": "+5511974540961",
                        "corporateName": null,
                        "tradeName": null,
                        "corporateDocument": null,
                        "stateInscription": null,
                        "corporatePhone": null,
                        "isCorporate": false,
                        "userProfileId": "847e33af-25eb-45dc-92ab-744023356f48",
                        "customerClass": null
                      },
                      "creationDate": "2020-08-26T22:19:28.126Z",
                      "isCompleted": true,
                      "items": [
                        {
                          "uniqueId": "E0DC16B3D47F4332B2190F5BF29ECFCD",
                          "id": "48",
                          "productId": "48",
                          "ean": "7898000000034",
                          "lockId": "00-1057341171378-01",
                          "itemAttachment": {
                            "name": null
                          },
                          "attachments": [],
                          "quantity": 1,
                          "seller": "1",
                          "name": "Torta de Limão Sabor & Delicia 500g",
                          "refId": null,
                          "price": 6000,
                          "listPrice": 6000,
                          "manualPrice": null,
                          "priceTags": [],
                          "imageUrl": "https://beightoneagency.vteximg.com.br/arquivos/ids/155585-72-72/torta.png?v=637215541961770000",
                          "detailUrl": "/torta-de-limao-sabor---delicia-500g/p",
                          "components": [],
                          "bundleItems": [],
                          "params": [],
                          "offerings": [],
                          "sellerSku": "48",
                          "priceValidUntil": null,
                          "commission": 0,
                          "tax": 0,
                          "preSaleDate": null,
                          "additionalInfo": {
                            "brandName": "Padaria delícia",
                            "brandId": "2000034",
                            "categoriesIds": "/5/8/",
                            "categories": [
                              {
                                "id": 8,
                                "name": "Doces"
                              },
                              {
                                "id": 5,
                                "name": "Padaria"
                              }
                            ],
                            "productClusterId": "143,148",
                            "commercialConditionId": "1",
                            "dimension": {
                              "cubicweight": 1,
                              "height": 0.5,
                              "length": 0.5,
                              "weight": 0.5,
                              "width": 0.5
                            },
                            "offeringInfo": null,
                            "offeringType": null,
                            "offeringTypeId": null
                          },
                          "measurementUnit": "un",
                          "unitMultiplier": 1,
                          "sellingPrice": 60,
                          "isGift": false,
                          "shippingPrice": null,
                          "rewardValue": 0,
                          "freightCommission": 0,
                          "priceDefinitions": null,
                          "taxCode": "",
                          "parentItemIndex": null,
                          "parentAssemblyBinding": null,
                          "callCenterOperator": null,
                          "serialNumbers": null,
                          "assemblies": [],
                          "costPrice": 6000
                        }
                      ],
                      "lastChange": "2020-08-26T22:20:32.296Z",
                      "orderFormId": "0254ed95214f45589b51816bada904d7",
                      "plugoneAffiliateStatus": "Approved",
                      "sellerOrderId": "00-1057341171378-01",
                      "status": "window-to-cancel",
                      "statusDescription": "Carência para Cancelamento",
                      "totals": [
                        {
                          "id": "Items",
                          "name": "Total dos Itens",
                          "value": 6000
                        },
                        {
                          "id": "Discounts",
                          "name": "Total dos Descontos",
                          "value": 0
                        },
                        {
                          "id": "Shipping",
                          "name": "Total do Frete",
                          "value": 2188
                        },
                        {
                          "id": "Tax",
                          "name": "Total da Taxa",
                          "value": 0
                        }
                      ],
                      "value": "60"
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Invalid token or organizationId',
            },
            '401': {
              description: 'api key inexistent'
            },
            '429': {
              description: 'Too many requests',
            },
            '500': {
              description: 'Internal Server Error',
            },
          },
          security: [
            {
              'x-plugone-api-token': [],
            },
          ]
        }
      },
    },
    components: {
      securitySchemes: {
        'x-plugone-api-token': {
          type: 'apiKey',
          name: 'x-plugone-api-token',
          in: 'header',
        },
      },
    },
  },
  apis: [],
}

export default options
