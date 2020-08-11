import { IResolvers } from 'apollo-server'
import { Transaction } from 'knex'
import knexDatabase from '../../../knex-database'
import service from '../service'

const resolvers: IResolvers = {
  Mutation: {
    handleAffiliateStore: async (_, { input }, { userServiceOrganizationRolesId, organizationId }) => {
      if (input.cover) {
        const { createReadStream: coverCreateReadStream, mimetype: coverMimetype } = await input.cover.data
        input.cover = {
          data: coverCreateReadStream(),
          mimetype: coverMimetype,
        }
      }

      if (input.avatar) {
        const { createReadStream: avatarCreateReadStream, mimetype: avatarMimetype } = await input.avatar.data
        input.avatar = {
          data: avatarCreateReadStream(),
          mimetype: avatarMimetype,
        }
      }

      return knexDatabase.knex.transaction((trx: Transaction) => {
        return service.handleAffiliateStore(input, { userServiceOrganizationRolesId, organizationId }, trx)
      })
    },
    addProductOnAffiliateStore: async (_, { input }, { userServiceOrganizationRolesId, organizationId }) => {
      return knexDatabase.knex.transaction((trx: Transaction) => {
        return service.addProductOnAffiliateStore(input, { userServiceOrganizationRolesId, organizationId }, trx)
      })
    },
    removeOrganizationAffiliateStoreBanner: async (_, { input }, { organizationId }) => {
      return knexDatabase.knex.transaction((trx: Transaction) => {
        return service.removeOrganizationAffiliateStoreBanner(input, { organizationId }, trx)
      })
    },
    addOrganizationAffiliateStoreBanner: async (_, { input }, { organizationId }) => {
      return knexDatabase.knex.transaction((trx: Transaction) => {
        return service.addOrganizationAffiliateStoreBanner(input, { organizationId }, trx)
      })
    },
    handleOrganizationAffiliateStore: async (_, { input }, { organizationId }) => {
      return knexDatabase.knex.transaction((trx: Transaction) => {
        return service.handleOrganizationAffiliateStore(input, { organizationId }, trx)
      })
    },
    handleProductOnAffiliateStoreActivity: async (_, { input }, { userServiceOrganizationRolesId }) => {
      return knexDatabase.knex.transaction((trx: Transaction) => {
        return service.handleProductOnAffiliateStoreActivity(input, { userServiceOrganizationRolesId }, trx)
      })
    },
    handleProductOnAffiliateStoreOrder: async (_, { input }, { userServiceOrganizationRolesId }) => {
      return knexDatabase.knex.transaction((trx: Transaction) => {
        return service.handleProductOnAffiliateStoreOrder(input, { userServiceOrganizationRolesId }, trx)
      })
    },
    handleProductOnAffiliateStoreSearchable: async (_, { input }, { userServiceOrganizationRolesId }) => {
      return knexDatabase.knex.transaction((trx: Transaction) => {
        return service.handleProductOnAffiliateStoreSearchable(input, { userServiceOrganizationRolesId }, trx)
      })
    },
  },
  Query: {
    getAffiliateStore: (_, __, { userServiceOrganizationRolesId }) => {
      return knexDatabase.knex.transaction((trx: Transaction) => {
        return service.getAffiliateStore({ userServiceOrganizationRolesId }, trx)
      })
    },
    getAffiliateStoreWithProducts: (_, { input }) => {
      return knexDatabase.knex.transaction((trx: Transaction) => {
        return service.getAffiliateStoreWithProducts(input, trx)
      })
    },
    getOrganizationAffiliateStoreBanner: (_, __, { organizationId }) => {
      return knexDatabase.knex.transaction((trx: Transaction) => {
        return service.getOrganizationAffiliateStoreBanner({ organizationId }, trx)
      })
    },
    getOrganizationAffiliateStore: (_, __, { organizationId }) => {
      return knexDatabase.knex.transaction((trx: Transaction) => {
        return service.getOrganizationAffiliateStore({ organizationId }, trx)
      })
    },
    getAffiliateStoreAddedProducts: (_, __, { userServiceOrganizationRolesId, secret }) => {
      return knexDatabase.knex.transaction((trx: Transaction) => {
        return service.getAffiliateStoreAddedProducts({ userServiceOrganizationRolesId, secret }, trx)
      })
    },
    getAffiliateStoreProducts: (_, { input }, { secret, userServiceOrganizationRolesId }) => {
      return knexDatabase.knex.transaction((trx: Transaction) => {
        return service.getAffiliateStoreProducts(input, { secret, userServiceOrganizationRolesId }, trx)
      })
    },
  },
}

export default resolvers
