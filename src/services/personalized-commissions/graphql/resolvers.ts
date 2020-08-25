import { IResolvers } from 'apollo-server'
import { Transaction } from 'knex'
import knexDatabase from '../../../knex-database'
import service from '../service'

const resolvers: IResolvers = {
  Mutation: {
    sendOrganizationCommissionOrder: async (_, { input }, { organizationId }) => {
      return knexDatabase.knex.transaction((trx: Transaction) => {
        return service.sendOrganizationCommissionOrder(input, { organizationId }, trx)
      })
    },
  },
  Query: {
    getOrganizationCommissionOrder: (_, __, { organizationId }) => {
      return knexDatabase.knex.transaction((trx: Transaction) => {
        return service.getOrganizationCommissionOrder({organizationId}, trx);
      })
    },
  },
}

export default resolvers
