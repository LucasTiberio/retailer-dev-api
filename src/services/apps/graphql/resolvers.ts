import { IResolvers } from 'apollo-server'
import { Transaction } from 'knex'
import database from '../../../knex-database'
import AppsService from '../service'

const resolvers: IResolvers = {
  Query: {
    getPlugForm: (_, __, { organizationId, client: { id: userId } }) => {
      return AppsService.getPlugFormFields({ userId, organizationId })
    },
     getInvoice: (_, { input }, { organizationId, client: { id: userId } }) => {
      return AppsService.getInvoice(input, { organizationId, userId })
    },
    getInvoices: (_, { input }, { organizationId, client: { id: userId } }) => {
      return AppsService.getInvoices(input, { organizationId, userId })
    },
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
    },
    receiveInvoice: (_, { input }) => {
      return AppsService.receiveInvoice(input)
    }
  },
}

export default resolvers
