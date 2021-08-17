import { IResolvers } from 'apollo-server'
import knexDatabase from '../../../knex-database'
import { Transaction } from 'knex'
import service from '../service'
import { ICreateServiceInOrganization } from '../types'
import OrganizationService from '../../organization/service'
import AppsService from '../../apps/service'
import UrlShortenerService from '../../shortener-url/service'

const resolvers: IResolvers = {
  Mutation: {
    createServiceInOrganization: (_, attrs: ICreateServiceInOrganization, { client }) => {
      const { input } = attrs
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.createServiceInOrganization(input.serviceId, input.organizationId, client, trx)
      })
    },
    handleServiceMembersRole: (_, attrs, { client, organizationId }) => {
      const { input } = attrs
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.handleServiceMembersRole(input, { client, organizationId }, trx)
      })
    },
  },
  Query: {
    listAvailableServices: (_, __, { client, organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.listUsedServices({ client, organizationId }, trx)
      })
    },
    affiliatesCapacities: (_, __, { organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.affiliatesCapacities({ organizationId }, trx)
      })
    },
    getUserInOrganizationServiceById: (_, attrs) => {
      const { input } = attrs

      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.getUserInOrganizationServiceById(input, trx)
      })
    },
    getUserInOrganizationService: (_, attrs, { client }) => {
      const { input } = attrs

      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.getUserInOrganizationService(input, { client }, trx)
      })
    },
    getUserOrganizationByServiceName: (_, attrs, { client, userServiceOrganizationRolesId, isOrganizationAdmin }) => {
      const { input } = attrs
      if (isOrganizationAdmin) return null
      if (!userServiceOrganizationRolesId) throw new Error('user service organization role id doesnt exists!')
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.getUserOrganizationServiceByServiceName(input, { client, userServiceOrganizationRolesId }, trx)
      })
    },
    listAffiliatesMembers: (_, { input }, { client, organizationId }) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.listAffiliatesMembers(input, { client, organizationId }, trx)
      })
    },
  },
  UserOrganizationService: {
    service: (obj) => {
      return service.getServiceById(obj.serviceId)
    },
    serviceRoles: (obj) => {
      return service.getServiceRolesByOneId(obj.serviceRolesId)
    },
    userOrganization: (obj) => {
      return OrganizationService.getUserOrganizationById(obj.usersOrganizationId)
    },
    showFirstSteps: (obj, _, { organizationId }) => {
      return service.verifyFirstSteps(obj.id, obj.bankDataId, { organizationId })
    },
    cluster: (obj, _, { organizationId }) => {
      return AppsService.getUserCluster({
        affiliateId: obj.id
      }, { organizationId })
    },
    lastGeneratedUrl: (obj) => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return UrlShortenerService.getAffiliateLastGeneratedUrl(obj.id, trx)
      })
    }
  },
  Service: {
    serviceRoles: (obj) => {
      return service.getServiceRolesById(obj.serviceRolesId)
    },
  },
}

export default resolvers
