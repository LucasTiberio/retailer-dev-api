import { IResolvers } from 'apollo-server'
import { Transaction } from 'knex'
import knexDatabase from '../../../knex-database'
import service from '../service'

const resolvers: IResolvers = {
  Mutation: {
    handleAffiliateStore: (_, { input }, { userServiceOrganizationRolesId }) => {
      return knexDatabase.knex.transaction((trx: Transaction) => {
        return service.handleAffiliateStore(input, { userServiceOrganizationRolesId }, trx)
      })
    },
  },
  Query: {
    getAffiliateStore: (_, __, { userServiceOrganizationRolesId }) => {
      return knexDatabase.knex.transaction((trx: Transaction) => {
        return service.getAffiliateStore({ userServiceOrganizationRolesId }, trx)
      })
    },
  },
}

export default resolvers
