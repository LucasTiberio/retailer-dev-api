import { IResolvers } from 'apollo-server'
import knexDatabase from '../../../knex-database'
import { Transaction } from 'knex'
import service from '../service'

const resolvers: IResolvers = {
  Query: {
    menuTree: (_, __, { client, organizationId, organizationSlug }) => {
      return knexDatabase.knexConfig.transaction(async (trx: Transaction) => {
        const menuTree = await service.getMenuTree({ client, organizationId, organizationSlug }, trx)
        return menuTree
      })
    },
  },
}

export default resolvers
