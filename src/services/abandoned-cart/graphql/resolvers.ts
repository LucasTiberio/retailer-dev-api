import service from '../service'
import { IResolvers } from 'apollo-server'

const resolvers: IResolvers = {
  Mutation: {
    handleCart: async (_, { input }) => {
      return await service.handleCart(input)
    },
  },
}

export default resolvers
