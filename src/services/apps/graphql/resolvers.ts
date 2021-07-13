import { IResolvers } from 'apollo-server'
import AppsService from '../service'

const resolvers: IResolvers = {
  Query: {
    getPlugForm: (_, __, { organizationId, client: { id: userId } }) => {
      return AppsService.getPlugFormFields({ userId, organizationId })
    },
  },
  Mutation: {
    savePlugForm: (_, { input }, { organizationId, client: { id: userId } }) => {
      return AppsService.savePlugFormFields({ ...input }, { userId, organizationId })
    },
    editPlugForm: (_, { input }) => {
      return AppsService.editPlugForm(input)
    },
  },
}

export default resolvers
