import { IResolvers } from 'apollo-server'
import { Transaction } from 'knex'
import knexDatabase from '../../../knex-database'
import service from '../service'

const resolvers: IResolvers = {
  Mutation: {
    createCommissionBonification: async (_, { input }, { organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.createCommissionBonification(input, { organizationId }, trx)
      })
    },
    deleteCommissionBonification: async (_, { input }, { organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.deleteCommissionBonification(input, { organizationId }, trx)
      })
    },
  },
  Query: {
    getAllCommissionsBonifications: (_, __, { organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.getAllCommissionsBonifications({ organizationId }, trx)
      })
    },
    getCommissionBonificationById: (_, { input }, { organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.getCommissionBonificationById(input, { organizationId }, trx)
      })
    },
  },
}

export default resolvers
