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
    }
  },
  Query: {
    getAffiliateStoreApps: async (_, __, { organizationId, headers }) => {
      return service.getAffiliateStoreApps(organizationId, headers)
    },
    getAffiliateStoreApp: async (_, { input }, { organizationId, headers }) => {
      return service.getAffiliateStoreApp(input, organizationId, headers)
    },
    getInstalledAffiliateStoreApps: async (_, __, { organizationId }) => {
      return service.getInstalledAffiliateStoreApps(organizationId)
    },
    getInstalledAffiliateStoreApp: async (_, { input }, { organizationId }) => {
      return service.getInstalledAffiliateStoreApp(input, organizationId)
    },
  },
  OrganizationAffiliateStoreApp: {
    affiliateStoreApp: (obj, _, { organizationId, headers }) => {
      return service.getAffiliateStoreApp({ id: obj.affiliateStoreApp.toString() }, organizationId, headers)
    },
  },
}

export default resolvers
