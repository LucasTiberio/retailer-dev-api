import service from '../service'
import { IResolvers } from 'apollo-server'

const resolvers: IResolvers = {
  Query: {
    getAbandonedCarts: (_, __, { organizationId }) => {
      return service.getAbandonedCarts(organizationId)
    },
    getAvailableAbandonedCartsAndMyAbandonedCarts: (_, __, { organizationId, userServiceOrganizationRolesId }) => {
      return service.getAvailableAbandonedCartsAndMyAbandonedCarts(organizationId, userServiceOrganizationRolesId);
    }
  },
  Mutation: {
    handleCart: (_, { input }) => {
      return service.handleCart(input)
    },
    handleCartOrderId: (_, { input }) => {
      return service.handleCartOrderId(input)
    },
  },
}

export default resolvers
