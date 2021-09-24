import { IResolvers } from 'apollo-server'
import service from '../service'

const resolvers: IResolvers = {
  Query: {
    getAllWebhookSubscriptions: (_, __, { organizationId }) => {
      return service.getAllWebhookSubscriptions({ organizationId })
    },
    getAvailableWebhooks: () => {
      return service.getAvailableWebhooks()
    },
  },
  Mutation: {
    subscribe: (_, { input }, { organizationId }) => {
      return service.subscribe({ ...input, organizationId })
    },
    updateSubscription: (_, { input }, { organizationId }) => {
      return service.updateSubscription({ ...input, organizationId })
    },
  },
}

export default resolvers
