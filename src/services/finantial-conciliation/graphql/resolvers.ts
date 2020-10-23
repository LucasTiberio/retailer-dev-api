import { IResolvers } from 'apollo-server'
import { Transaction } from 'knex'
import database from '../../../knex-database'
import service from '../service'
import helpers from '../helpers'

const resolvers: IResolvers = {
  Query: {
    getOrganizationFinantialConciliation: (_, {}, { organizationId }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.getFinantialConciliationConfigurationByOrganizationId({ organizationId }, trx)
      })
    },
    getAffiliatesValuesByMonth: (_, {}, { organization_id, year_month }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.getAffiliatesValuesByMonth({ organization_id, year_month }, trx)
      })
    },
    getDailyRevenueAndCommissions: async (_, {}, { organization_id, year_month }) => {
      return await helpers.getDailyRevenueAndCommissions(organization_id, year_month)
    },
  },
  Mutation: {
    handleOrganizationFinantialConciliationConfiguration: (_, { input }, { organizationId }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.handleOrganizationFinantialConciliationConfiguration(input, { organizationId }, trx)
      })
    },
  },
}

export default resolvers
