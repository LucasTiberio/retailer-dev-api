import { IResolvers } from 'apollo-server'
import { Transaction } from 'knex'
import knexDatabase from '../../../knex-database'
import service from '../service'
import OrganizationService from '../../organization/service'
import ServiceService from '../../services/service'

const resolvers: IResolvers = {
  Mutation: {
    handleSassDefaultCommission: async (_, { input }, { organizationId }) => {
      return knexDatabase.knex.transaction((trx: Transaction) => {
        return service.handleSassDefaultCommission(input, { organizationId }, trx)
      })
    },
  },
  Query: {
    getSaasDefaultCommission: (_, __, { organizationId }) => {
      return knexDatabase.knex.transaction((trx: Transaction) => {
        return service.getSaasDefaultCommission({ organizationId }, trx)
      })
    },
    getSignaturesByOrganizationId: (_, __, { organizationId }) => {
      return service.getSignaturesByOrganizationId({ organizationId })
    },
    getSignaturesByOrganizationIdAndAffiliateId: (_, __, { organizationId, userServiceOrganizationRolesId }) => {
      return service.getSignaturesByOrganizationIdAndAffiliateId({ organizationId, userServiceOrganizationRolesId })
    },
  },
  SaasSignature: {
    organization: async (obj) => {
      return OrganizationService.getOrganizationById(obj.organizationId)
    },
    affiliate: async (obj) => {
      return ServiceService.getOrganizationServicesById(obj.affiliateId)
    },
  },
}

export default resolvers
