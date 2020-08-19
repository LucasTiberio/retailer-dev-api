import { IResolvers } from "apollo-server";
import { Transaction } from 'knex'
import service from "../service";
import database from '../../../knex-database'

const resolvers: IResolvers = {
  Mutation: {
    sendAffiliateInsideSalesSpecialistMail: (_, { input }, { organizationId }) => {
      return database.knex.transaction((trx: Transaction) => {
        return service.sendAffiliateInsideSalesSpecialistMail(input, { organizationId }, trx)
      })
    },
  },
};

export default resolvers;
