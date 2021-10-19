import { IResolvers } from 'apollo-server'
import service from '../service'

const resolvers: IResolvers = {
  Query: {
    getAllWebhookExecutions: (_, { offset = 0, limit = 10 }, { organizationId }) => {
      return service.getAllExecutions({ offset, limit }, { organizationId })
    },
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
    triggerManualSend: (_, { input }) => {
      return service.triggerManualSend(input)
    },
  },
}

export default resolvers
