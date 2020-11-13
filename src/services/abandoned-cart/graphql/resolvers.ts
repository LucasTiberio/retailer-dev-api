import service from '../service'
import { IResolvers } from 'apollo-server'

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
  },
  Mutation: {
    handleCart: (_, { input }) => {
      return service.handleCart(input)
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
}

export default resolvers
