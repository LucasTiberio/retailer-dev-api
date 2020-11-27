import service from '../service'
import { IResolvers } from 'apollo-server'
import ServiceService from '../../services/service'
import knexDatabase from '../../../knex-database'
import { Transaction } from 'knex'

const resolvers: IResolvers = {
  Query: {
    getAbandonedCarts: (_, __, { organizationId }) => {
      return service.getAbandonedCarts(organizationId)
    },
    getAbandonedCartsRecoveredAmount: (_, __, { organizationId }) => {
      return service.getAbandonedCartsRecoveredAmount(organizationId)
    },
    getAbandonedCartsLostAmount: (_, __, { organizationId }) => {
      return service.getAbandonedCartsLostAmount(organizationId)
    },
    getFilteredAbandonedCarts: (_, __, { organizationId, userServiceOrganizationRolesId }) => {
      return service.getFilteredAbandonedCarts(organizationId, userServiceOrganizationRolesId)
    },
  },
  Mutation: {
    handleCart: (_, { input }) => {
      return service.handleCart(input)
    },
    generateNewCart: (_, { input }, { organizationId }) => {
      return service.generateNewCart(input.abandonedCartId, organizationId)
    },
    handleAbandonedCartActivity: (_, { input }, { organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.handleAbandonedCartActivity(input, organizationId, trx)
      })
    },
    handleCartOrderId: (_, { input }) => {
      return service.handleCartOrderId(input)
    },
    assumeCartAssistance: (_, { input }, { organizationId, userServiceOrganizationRolesId }) => {
      return service.assumeCartAssistance(input.abandonedCartId, organizationId, userServiceOrganizationRolesId)
    },
    leaveCartAssistance: (_, { input }, { organizationId, userServiceOrganizationRolesId }) => {
      return service.leaveCartAssistance(input.abandonedCartId, organizationId, userServiceOrganizationRolesId)
    },
    rejectCartAssistance: (_, { input }, { organizationId, userServiceOrganizationRolesId }) => {
      return service.rejectCartAssistance(input.abandonedCartId, organizationId, userServiceOrganizationRolesId, input.observation)
    },
    createObservation: (_, { input }, { organizationId, userServiceOrganizationRolesId }) => {
      return service.createObservation(input.abandonedCartId, organizationId, userServiceOrganizationRolesId, input.observation)
    },
    editObservation: (_, { input }, { organizationId, userServiceOrganizationRolesId }) => {
      return service.editObservation(input.abandonedCartId, organizationId, userServiceOrganizationRolesId, input.observationIndex, input.observation)
    },
    removeObservation: (_, { input }, { organizationId, userServiceOrganizationRolesId }) => {
      return service.removeObservation(input.abandonedCartId, organizationId, userServiceOrganizationRolesId, input.observationIndex)
    },
    removeCartAssistance: (_, { input }, { organizationId }) => {
      return service.removeCartAssistance(input.abandonedCartId, organizationId)
    },
  },
  AbandonedCart: {
    currentAssistantAffiliate: (obj) => {
      if (!obj.currentAssistantAffiliateId) return null
      return ServiceService.getOrganizationServicesById(obj.currentAssistantAffiliateId)
    },
  },
}

export default resolvers
