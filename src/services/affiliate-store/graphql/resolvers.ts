import { IResolvers } from 'apollo-server'
import { Transaction } from 'knex'
import knexDatabase from '../../../knex-database'
import service from '../service'
import ServicesService from '../../services/service'

const resolvers: IResolvers = {
  Mutation: {
    handleAffiliateStore: async (_, { input }, { userServiceOrganizationRolesId, organizationId }) => {
      console.log({ input })

      if (input.cover) {
        if (!input.cover.url) {
          const { createReadStream: coverCreateReadStream, mimetype: coverMimetype } = await input.cover.data
          input.cover = {
            data: coverCreateReadStream(),
            mimetype: coverMimetype,
          }
        }
      }

      if (input.avatar) {
        const { createReadStream: avatarCreateReadStream, mimetype: avatarMimetype } = await input.avatar.data
        input.avatar = {
          data: avatarCreateReadStream(),
          mimetype: avatarMimetype,
        }
      }

      console.log('depois', { input })

      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.handleAffiliateStore(input, { userServiceOrganizationRolesId, organizationId }, trx)
      })
    },
    addProductOnAffiliateStore: async (_, { input }, { userServiceOrganizationRolesId, organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.addProductOnAffiliateStore(input, { userServiceOrganizationRolesId, organizationId }, trx)
      })
    },
    handleAffiliateStoreSlug: async (_, { input }, { organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.handleAffiliateStoreSlug(input, { organizationId }, trx)
      })
    },
    clearAffiliateStoreLojaIntegradaCache: async (_, __, { organizationId }) => {
      return service.clearAffiliateStoreLojaIntegradaCache(organizationId)
    },
    removeOrganizationAffiliateStoreBanner: async (_, { input }, { organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.removeOrganizationAffiliateStoreBanner(input, { organizationId }, trx)
      })
    },
    addOrganizationAffiliateStoreBanner: async (_, { input }, { organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.addOrganizationAffiliateStoreBanner(input, { organizationId }, trx)
      })
    },
    handleOrganizationAffiliateStore: async (_, { input }, { organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.handleOrganizationAffiliateStore(input, { organizationId }, trx)
      })
    },
    handleProductOnAffiliateStoreActivity: async (_, { input }, { userServiceOrganizationRolesId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.handleProductOnAffiliateStoreActivity(input, { userServiceOrganizationRolesId }, trx)
      })
    },
    handleProductOnAffiliateStoreOrder: async (_, { input }, { userServiceOrganizationRolesId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.handleProductOnAffiliateStoreOrder(input, { userServiceOrganizationRolesId }, trx)
      })
    },
    handleProductOnAffiliateStoreSearchable: async (_, { input }, { userServiceOrganizationRolesId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.handleProductOnAffiliateStoreSearchable(input, { userServiceOrganizationRolesId }, trx)
      })
    },
  },
  Query: {
    getAffiliateStore: (_, __, { userServiceOrganizationRolesId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.getAffiliateStore({ userServiceOrganizationRolesId }, trx)
      })
    },
    getAffiliateStoreWithProducts: (_, { input }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.getAffiliateStoreWithProducts(input, trx)
      })
    },
    getOrganizationAffiliateStoreBanner: (_, __, { organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.getOrganizationAffiliateStoreBanner({ organizationId }, trx)
      })
    },
    getOrganizationAffiliateStore: (_, __, { organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.getOrganizationAffiliateStore({ organizationId }, trx)
      })
    },
    getAffiliateStoreAddedProducts: (_, __, { userServiceOrganizationRolesId, secret, organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.getAffiliateStoreAddedProducts({ userServiceOrganizationRolesId, secret, organizationId }, trx)
      })
    },
    getAffiliateStoreProducts: (_, { input }, { secret, userServiceOrganizationRolesId, organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.getAffiliateStoreProducts(input, { secret, userServiceOrganizationRolesId, organizationId }, trx)
      })
    },
  },
  AffiliateStore: {
    usersOrganizationServiceRoles: async (obj) => {
      return ServicesService.getOrganizationServicesById(obj.usersOrganizationServiceRolesId)
    },
  },
}

export default resolvers
