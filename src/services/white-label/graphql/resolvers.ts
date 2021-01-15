import { IResolvers } from 'apollo-server'
import { Transaction } from 'knex'
import knexDatabase from '../../../knex-database'
import service from '../service'

const resolvers: IResolvers = {
  Mutation: {
    sendWhiteLabelInfos: (_, { input }, { organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.sendWhiteLabelInfos(input, organizationId, trx)
      })
    },
  },
  Query: {
    getWhiteLabelColorOptions: (_, __, ___) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.getWhiteLabelColorOptions(trx);
      })
    },
    getWhiteLabelInfos: (_, __, { organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.getWhiteLabelInfos(organizationId, trx)
      })
    },
    getWhiteLabelInfosByDomain: (_, { input }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.getWhiteLabelInfosByDomain(input.domain, trx)
      })
    },
  },
}

export default resolvers
