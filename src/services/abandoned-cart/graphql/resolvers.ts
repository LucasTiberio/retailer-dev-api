import service from '../service'
import { IResolvers } from 'apollo-server'

const resolvers: IResolvers = {
  Query: {
    getAbandonedCarts: (_, __, { organizationId }) => {
      return service.getAbandonedCarts(organizationId)
    },
  },
  Mutation: {
    handleCart: (_, { input }) => {
      return service.handleCart(input)
    },
  },
}

export default resolvers
