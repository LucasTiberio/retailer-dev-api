import { IResolvers } from 'apollo-server'
import { Transaction } from 'knex'
import knexDatabase from '../../../knex-database'
import service from '../service'

const resolvers: IResolvers = {
  Mutation: {
    sendOrganizationComissionOrder: async (_, { input }, { organizationId }) => {
      return knexDatabase.knex.transaction((trx: Transaction) => {
        return service.sendOrganizationComissionOrder(input, { organizationId }, trx)
      })
    },
  },
  Query: {
    getOrganizationComissionOrder: (_, __, { organizationId }) => {
      return knexDatabase.knex.transaction((trx: Transaction) => {
        return service.getOrganizationComissionOrder({organizationId}, trx);
      })
    },
  },
}

export default resolvers
