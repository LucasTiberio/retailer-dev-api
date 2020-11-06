import service from '../service'
import { IResolvers } from 'apollo-server'
import database from '../../../knex-database'
import { Transaction } from 'knex'

const resolvers: IResolvers = {
  Query: {
    getPlanType: (_, __, { organizationId }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.getPlanType(organizationId, trx)
      })
    },
  },
}

export default resolvers
