import { IResolvers } from 'apollo-server'
import { Transaction } from 'knex'
import knexDatabase from '../../../knex-database'
import service from '../service'
import ShortenerUrlService from '../../shortener-url/service'
import ServicesService from '../../services/service'

const resolvers: IResolvers = {
  Mutation: {
    handleOrganizationCommission: (_, { input }, { organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.handleOrganizationCommission(input, { organizationId }, trx)
      })
    },
    handleTimeToPayCommission: (_, { input }, { organizationId, client }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.handleTimeToPayCommission(input, { organizationId, client }, trx)
      })
    },
    handleDefaultCommission: (_, { input }, { organizationId, client }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.handleDefaultommission(input, { organizationId, client }, trx)
      })
    },
    affiliateGenerateShortenerUrl: (_, attrs, { client, organizationId }) => {
      const { input } = attrs
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.generateShortenerUrl(input, { client, organizationId }, trx)
      })
    },
    changeAffiliateCommissionPayStatus: (_, attrs, { client, organizationId }) => {
      const { input } = attrs
      return service.changeAffiliateCommissionPayStatus(input, { client, organizationId })
    },
    generateSalesShorten: (_, attrs, { salesId }) => {
      const { input } = attrs
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.generateSalesShorten(input, { salesId }, trx)
      })
    },
    generateSalesJwt: (_, attrs, { redisClient }) => {
      const { input } = attrs
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.generateSalesJWT(input, { redisClient }, trx)
      })
    },
    createAffiliateBankValues: (_, attrs, { client, organizationId, userServiceOrganizationRolesId }) => {
      const { input } = attrs
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.createAffiliateBankValues(
          input,
          {
            userServiceOrganizationRolesId,
            client,
            organizationId,
          },
          trx
        )
      })
    },
  },
  Query: {
    getOrganizationCommissions: (_, __, { organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.getOrganizationCommissionByOrganizationId({ organizationId }, trx)
      })
    },
    getAffiliateAvailableBonifications: (_, __, { client, userServiceOrganizationRolesId, organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.getAvailableBonifications({ client, userServiceOrganizationRolesId, organizationId })
      })
    },
    getOrganizationCommissionsName: (_, __, { organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.getOrganizationCommissionsName(organizationId, trx)
      })
    },
    getOrganizationCommissionsSellerName: (_, __, { organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.getOrganizationCommissionsSellerName(organizationId, trx)
      })
    },
    getOrganizationCommissionsCategoriesName: (_, __, { organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.getOrganizationCommissionsCategoriesName(organizationId, trx)
      })
    },
    getOrganizationCommissionsAffiliatesName: (_, __, { organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.getOrganizationCommissionsAffiliatesName(organizationId, trx)
      })
    },
    timeToPayCommission: (_, __, { client, organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.getTimeToPayCommission({ client, organizationId }, trx)
      })
    },
    defaultCommission: (_, __, { client, organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.getDefaultCommission({ client, organizationId }, trx)
      })
    },
    listAffiliateShorterUrl: (_, attrs, { client }) => {
      const { input } = attrs
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.getShorterUrlByUserOrganizationServiceId(input, client, trx)
      })
    },
    getAllOrganizationOrders: (_, attrs, { client, organizationId }) => {
      const { input } = attrs
      return service.getAllOrganizationOrders(input, {
        client,
        organizationId,
      })
    },
    getOrganizationOrdersByAffiliateId: (_, attrs, { client, organizationId, userServiceOrganizationRolesId }) => {
      const { input } = attrs
      return service.getOrganizationOrdersByAffiliateId(input, {
        client,
        organizationId,
        userServiceOrganizationRolesId,
      })
    },
    getOrganizationRevenue: (_, attrs, { client, organizationId }) => {
      const { input } = attrs
      return service.getOrganizationRevenue(input, { client, organizationId })
    },
    getOrganizationAverageTicket: (_, attrs, { client, organizationId }) => {
      const { input } = attrs
      return service.getOrganizationAverageTicket(input, {
        client,
        organizationId,
      })
    },
    getOrganizationTotalOrders: (_, attrs, { client, organizationId }) => {
      const { input } = attrs
      return service.getOrganizationTotalOrders(input, {
        client,
        organizationId,
      })
    },
    getOrganizationTotalOrdersByAffiliate: (_, attrs, { client, organizationId, userServiceOrganizationRolesId }) => {
      const { input } = attrs
      return service.getOrganizationTotalOrdersByAffiliate(input, {
        client,
        organizationId,
        userServiceOrganizationRolesId,
      })
    },
    getOrganizationCommissionByAffiliate: (_, attrs, { client, organizationId, userServiceOrganizationRolesId }) => {
      const { input } = attrs
      return service.getOrganizationCommissionByAffiliate(input, {
        client,
        organizationId,
        userServiceOrganizationRolesId,
      })
    },
    getOrganizationCommission: (_, attrs, { client, organizationId }) => {
      const { input } = attrs
      return service.getOrganizationCommission(input, {
        client,
        organizationId,
      })
    },
  },
  UserOrganizationServiceRolesUrlShortener: {
    shortenerUrl: async (obj, _, { organizationId }) => {
      return ShortenerUrlService.getShortenerUrlById(organizationId, obj.urlShortenId)
    },
    userOrganizationService: async (obj) => {
      return ServicesService.getOrganizationServicesById(obj.usersOrganizationServiceRolesId)
    },
  },
}

export default resolvers
