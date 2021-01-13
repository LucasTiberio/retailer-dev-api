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
  },
  User: {
    organizations: (obj, { organizationId }) => {
      return OrganizationService.getOrganizationByUserId(obj.id, organizationId)
    },
  },
}

export default resolvers
