import { IResolvers } from 'apollo-server'
import { Transaction } from 'knex'
import database from '../../../knex-database'
import AppsService from '../service'

const resolvers: IResolvers = {
  Query: {
    getPlugForm: (_, __, { organizationId, client: { id: userId } }) => {
      return AppsService.getPlugFormFields({ userId, organizationId })
    },
    getInvoice: (_, __, { organizationId, client: { id: userId } }) => {
      return AppsService.getInvoice({ organizationId, userId })
    }
  },
  Mutation: {
    savePlugForm: (_, { input }, { organizationId, client: { id: userId } }) => {
      return AppsService.savePlugFormFields({ ...input }, { userId, organizationId })
    },
    editPlugForm: (_, { input }) => {
      return AppsService.editPlugForm(input)
    },
    uploadInvoice: (_, { input }, { organizationId, client: { id: userId } }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return AppsService.uploadInvoice(input, { organizationId, userId }, trx)
      })
    }
  },
}

export default resolvers
