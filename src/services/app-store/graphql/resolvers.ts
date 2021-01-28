import { IResolvers } from 'apollo-server'
import service from '../service'

const resolvers: IResolvers = {
  Mutation: {
    installAffiliateStoreApp: async (_, { input }, { organizationId }) => {
      return service.installAffiliateStoreApp(input, organizationId)
    },
    uninstallAffiliateStoreApp: async (_, { input }, { organizationId }) => {
      return service.uninstallAffiliateStoreApp(input, organizationId)
    },
    editOrganizationAffiliateStoreAppConfig: async (_, { input }, { organizationId }) => {
      return service.editOrganizationAffiliateStoreAppConfig(input, organizationId)
    },
  },
  Query: {
    getAffiliateStoreApps: async (_, __, { organizationId }) => {
      return service.getAffiliateStoreApps(organizationId)
    },
    getAffiliateStoreApp: async (_, { input }, { organizationId }) => {
      return service.getAffiliateStoreApp(input, organizationId)
    },
    getInstalledAffiliateStoreApps: async (_, __, { organizationId }) => {
      return service.getInstalledAffiliateStoreApps(organizationId)
    },
  },
}

export default resolvers
