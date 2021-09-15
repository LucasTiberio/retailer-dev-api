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
        const hasHublyInvoice = !!affiliateValues.affiliates[0]?.invoice
        const hasHublyFormFields = !!affiliateValues.affiliates[0]?.plugFormFields
        const hublyFormFieldHeaders = hasHublyFormFields ? Object.entries(JSON.parse(affiliateValues.affiliates[0]?.plugFormFields))?.map(([header]) => header) : []

        console.log(affiliateValues.affiliates.length)

        let returnCSV = 'Membro;CPF;Banco;Agência;Conta;Total em vendas;Comissão'

        if (hasHublyInvoice) returnCSV += ';Nota Fiscal'

        if (hublyFormFieldHeaders.length) {
          returnCSV += `;${hublyFormFieldHeaders.join(';')}` + '\n'
        } else returnCSV += '\n'

        affiliateValues.affiliates.forEach((affiliateValue) => {
          const hublyFormFieldValues = affiliateValue?.plugFormFields ? Object.values(JSON.parse(affiliateValue?.plugFormFields)) : null

          returnCSV +=
            `${affiliateValue.name};${affiliateValue.document};${affiliateValue.bank};${affiliateValue.agency};${affiliateValue.account};${Number(affiliateValue.revenue).toFixed(2)};${Number(
              affiliateValue.commission
            ).toFixed(2)}`

          if (affiliateValue?.invoice) returnCSV += `;${affiliateValue.invoice?.url}`

          if (hublyFormFieldValues) returnCSV += `;${hublyFormFieldValues.join(';')}` + '\n'
          else returnCSV += '\n'
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
