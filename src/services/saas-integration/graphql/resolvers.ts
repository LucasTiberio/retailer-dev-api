import { IResolvers } from 'apollo-server'
import { Transaction } from 'knex'
import knexDatabase from '../../../knex-database'
import service from '../service'

const resolvers: IResolvers = {
  Mutation: {
    handleSassDefaultCommission: async (_, { input }, { organizationId }) => {
      return knexDatabase.knex.transaction((trx: Transaction) => {
        return service.handleSassDefaultCommission(input, { organizationId }, trx)
      })
    },
  },
  Query: {
    getSaasDefaultCommission: (_, __, { organizationId }) => {
      return knexDatabase.knex.transaction((trx: Transaction) => {
        return service.getSaasDefaultCommission({ organizationId }, trx)
      })
    },
  },
}

export default resolvers
