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
              description: 'Success',
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
      }
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
