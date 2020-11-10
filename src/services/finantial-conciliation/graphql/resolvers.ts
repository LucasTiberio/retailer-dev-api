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
    getOrderListByAffiliateIdAndReferenceMonth: async (_, { input: { affiliateId, referenceMonth } }, { organizationId }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.getOrderListByAffiliateIdAndReferenceMonth({ organizationId, affiliateId, referenceMonth }, trx)
      })
    },
    downloadFinantialConciliationCSVByReferenceMonth: async (_, { input: { referenceMonth } }, { organizationId }) => {
      return database.knexConfig.transaction(async (trx: Transaction) => {
        const affiliateValues = await service.getAffiliatesValuesByMonth({ organizationId, year_month: referenceMonth }, trx)
        let returnCSV = 'Membro;CPF;Banco;Agência;Conta;Total em vendas;Comissão\n'
        affiliateValues.affiliates.forEach((affiliateValue) => {
          returnCSV +=
            `${affiliateValue.name};${affiliateValue.document};${affiliateValue.bank};${affiliateValue.agency};${affiliateValue.account};${affiliateValue.revenue};${affiliateValue.commission}` + '\n'
        })
        return Buffer.from(returnCSV).toString('base64')
      })
    },
  },
  Mutation: {
    handleOrganizationFinantialConciliationConfiguration: (_, { input }, { organizationId }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.handleOrganizationFinantialConciliationConfiguration(input, { organizationId }, trx)
      })
    },
    handleOrganizationFinantialConciliationStatusAdvance: async (_, { input: { referenceMonth } }, { organizationId }) => {
      return await helpers.advanceFinancialConciliationStatus(organizationId, referenceMonth)
    },
  },
}

export default resolvers
