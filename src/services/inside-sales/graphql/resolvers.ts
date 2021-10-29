import { IResolvers } from "apollo-server";
import { Transaction } from 'knex'
import service from "../service";
import database from '../../../knex-database'

const resolvers: IResolvers = {
  Query: {
    getAllVtexProducts: (_, { input }, { secret, userServiceOrganizationRolesId, organizationId }) => {
      return service.getAllVtexProducts(input, { secret, userServiceOrganizationRolesId, organizationId })
    },
    getCategoriesVtex: (_, __, { secret }) => {
      return service.getCategoriesVtex({ secret })
    }
  },
  Mutation: {
    sendAffiliateInsideSalesSpecialistMail: (_, { input }, { organizationId }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.sendAffiliateInsideSalesSpecialistMail(input, { organizationId }, trx)
      })
    },
  },
};

export default resolvers;
