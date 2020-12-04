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
          summary: "Posts an array of users' e-mails for affiliation",
          requestBody: {
            description: "Array of users' e-mails",
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'string',
                    format: 'email',
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