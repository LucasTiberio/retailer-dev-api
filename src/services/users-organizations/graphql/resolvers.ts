import { IResolvers } from 'apollo-server'
import { Transaction } from 'knex'
import knexDatabase from '../../../knex-database'
import service from '../service'

const resolvers: IResolvers = {
  Mutation: {
    handleMemberInvitation: (_, { input }, { organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.handleMemberInvitation(input, { organizationId }, trx)
      })
    },
  },
  Query: {
    getPendingMembersByOrganizationId: (_, __, { organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.getPendingMembersByOrganizationId({ organizationId }, trx)
      })
    },
  },
}

export default resolvers
