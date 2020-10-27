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
    getAffiliatesValuesByMonth: (_, { input: { year_month } }, { organizationId }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.getAffiliatesValuesByMonth({ organizationId, year_month }, trx)
      })
    },
    getDailyRevenueAndCommissions: async (_, { input: { year_month } }, { organizationId }) => {
      return await helpers.getDailyRevenueAndCommissions(organizationId, year_month)
    },
  },
  Mutation: {
    handleOrganizationFinantialConciliationConfiguration: (_, { input }, { organizationId }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.handleOrganizationFinantialConciliationConfiguration(input, { organizationId }, trx)
      })
    },
    handleOrganizationFinantialConciliationStatusAdvance: async (_, { input: { finantialConciliationId } }, { organizationId }) => {
      return await helpers.advanceFinancialConciliationStatus(organizationId, finantialConciliationId)
    },
  },
}

export default resolvers
