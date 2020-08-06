import { IResolvers } from 'apollo-server'
import { Transaction } from 'knex'
import knexDatabase from '../../../knex-database'
import service from '../service'

const resolvers: IResolvers = {
  Mutation: {
    handleAffiliateStore: async (_, { input }, { userServiceOrganizationRolesId }) => {
      if (input.cover) {
        const { createReadStream: coverCreateReadStream, mimetype: coverMimetype } = await input.cover.data
        input.cover = {
          data: coverCreateReadStream(),
          mimetype: coverMimetype,
        }
      }

      if (input.avatar) {
        const { createReadStream: avatarCreateReadStream, mimetype: avatarMimetype } = await input.avatar.data
        input.avatar = {
          data: avatarCreateReadStream(),
          mimetype: avatarMimetype,
        }
      }

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
