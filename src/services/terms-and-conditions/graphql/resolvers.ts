import { IResolvers } from 'apollo-server'
import { Transaction } from 'knex'
import knexDatabase from '../../../knex-database'
import service from '../service'

const resolvers: IResolvers = {
  Mutation: {
    sendTermsAndConditions: (_, { input }, { client }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.sendTermsAndConditions(input, { client }, trx)
      })
    },
  },
  Query: {
    getTermsAndConditions: (_, __, { client }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.getTermsAndConditions({ client }, trx)
      })
    },
  },
}

export default resolvers
