import service from '../service'
import { IResolvers } from 'apollo-server'
import { Transaction } from 'knex'
import database from '../../../knex-database'
import UserService from '../../users/service'
import ServicesService from '../../services/service'

const resolvers: IResolvers = {
  Mutation: {
    inviteTeammates: (_, { input }, { client, organizationId, headers }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.inviteTeammates(input, { client, organizationId, headers }, trx)
      })
    },
    reinviteServiceMember: (_, { input }, { headers }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.reinviteServiceMember(input, { headers }, trx)
      })
    },
    handleOrganizationDomain: (_, { input }, { client, organizationId }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.handleOrganizationDomain(input, { organizationId }, trx)
      })
    },
    handleTeammatesActivity: (_, { input }, { organizationId, client }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.handleTeammatesActivity(input, { organizationId, client }, trx)
      })
    },
    inviteAffiliate: (_, { input }, { client, organizationId, headers }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.inviteAffiliateServiceMembers(input, { client, organizationId, headers }, trx)
      })
    },
    handleServiceMembersActivity: (_, { input }, { organizationId }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.handleServiceMembersActivity(input, { organizationId }, trx)
      })
    },
    createOrganization: (_, { input }, { client, redisClient, headers }) => {
      let createOrganizationWithoutIntegrationSecret = headers['create-organization-without-integration-secret']
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.createOrganization(input, { client, redisClient, createOrganizationWithoutIntegrationSecret }, trx)
      })
    },
    setCurrentOrganization: (_, { input }, context) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.setCurrentOrganization(input, context, trx)
      })
    },
    organizationUploadImage: async (_, { input }, { client, organizationId }) => {
      const { createReadStream, filename, mimetype } = await input.data
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.organizationUploadImage(
          {
            imageName: filename,
            data: createReadStream(),
            mimetype,
          },
          { client, organizationId },
          trx
        )
      })
    },
    responseOrganizationInvite: (_, { input }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.responseInvite(input, trx)
      })
    },
    handleUserPermissionInOrganization: (_, { input }, { client, organizationId }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.handleUserPermissionInOrganization(input, { client, organizationId }, trx)
      })
    },
    handlePublicOrganization: (_, { input }, { organizationId }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.handlePublicOrganization(input, { organizationId }, trx)
      })
    },
  },
  Query: {
    verifyOrganizationName: (_, { input }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.verifyOrganizationName(input.name, trx)
      })
    },
    fetchOrganizationDomain: (_, __, { organizationId }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.fetchOrganizationDomain({ organizationId }, trx)
      })
    },
    teammatesCapacities: (_, __, { organizationId }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.teammatesCapacities({ organizationId }, trx)
      })
    },
    listTeammates: (_, __, { organizationId }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.listTeammates({ organizationId }, trx)
      })
    },
    organizationDetails: (_, __, { client, organizationId }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.organizationDetails({ client, organizationId }, trx)
      })
    },
    listMyOrganizations: (_, __, { client }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.listMyOrganizations(client, trx)
      })
    },
    listUsersInOrganization: (_, { input }, { client, organizationId }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.listUsersInOrganization(input, { client, organizationId }, trx)
      })
    },
    findUsersToOrganization: (_, { input }, { client, organizationId }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.findUsersToOrganization(input, { client, organizationId }, trx)
      })
    },
    organizationPaymentsDetails: (_, __, { client, organizationId }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.getOrganizationPaymentsDetails({ client, organizationId }, trx)
      })
    },
    getOrganizationApiKey: (_, __, { organizationId }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.getOrganizationApiKey({ organizationId }, trx)
      })
    },
  },
  Organization: {
    user: async (obj) => {
      return UserService.getUserById(obj.userId)
    },
    hasBillingPendency: async (obj) => {
      return service.organizationHasBillingPendency(obj.id)
    },
    organizationRole: async (obj) => {
      return service.getUserOrganizationRole(obj.userOrganizationId)
    },
    services: async (obj) => {
      return ServicesService.getOrganizationServicesByOrganizationId(obj.userOrganizationId, obj.id)
    },
    hasMember: async (obj) => {
      return service.verifyOrganizationHasMember(obj.id)
    },
    showFirstSteps: async (obj) => {
      return service.verifyShowFirstSteps(obj.id)
    },
  },
  UserOrganizationRole: {
    userOrganization: async (obj) => {
      return service.getUserOrganizationById(obj.userOrganizationId)
    },
  },
  UserOrganization: {
    user: async (obj) => {
      return UserService.getUserById(obj.userId)
    },
    organization: async (obj) => {
      return service.getOrganizationById(obj.organizationId)
    },
    organizationRole: async (obj) => {
      return service.getOrganizationRoleById(obj.organizationRoleId)
    },
  },
}

export default resolvers
