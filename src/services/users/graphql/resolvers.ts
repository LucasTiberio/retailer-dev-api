import service from '../service'
import { IResolvers } from 'apollo-server'
import { Transaction } from 'knex'
import database from '../../../knex-database'
import OrganizationService from '../../organization/service'

const resolvers: IResolvers = {
  Mutation: {
    signUp: (_, { input }, { headers }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.signUp(input, { headers }, trx)
      })
    },
    resendConfirmationEmail: (_, __, { client }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.resendConfirmationEmail(client.id, trx)
      })
    },
    signUpWithOrganization: (_, { input }, { redisClient, headers }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.signUpWithOrganization(
          input,
          {
            redisClient,
            headers,
          },
          trx
        )
      })
    },
    userVerifyEmail: (_, { input }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.verifyEmail(input.verificationHash, trx)
      })
    },
    userRecoveryPassword: (_, { input }, { headers }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.recoveryPassword(input.email, { headers }, trx)
      })
    },
    userPasswordChange: (_, { input }, { headers }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.changePassword(input, { headers }, trx)
      })
    },
  },
  Query: {
    getUser: (_, __, { client }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.getUser(client, trx)
      })
    },
    isUserVerified: (_, __, { client }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.isUserVerified(client, trx)
      })
    },
    getUserPendencies: (_, __, { organizationId, organizationRoles, client: { id: userId } }) => {
      return service.getUserPendencies({ organizationId, userId, organizationRoles })
    },
  },
  User: {
    organizations: (obj, { organizationId }) => {
      return OrganizationService.getOrganizationByUserId(obj.id, organizationId)
    },
  },
  UserPendenciesWithMetadata: {
    metadata: (obj, _, { organizationId }) => {
      return service.getPendencyMetadata(obj.pendency, { organizationId })
    },
  }
}

export default resolvers
