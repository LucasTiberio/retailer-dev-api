import { IResolvers } from "apollo-server";
import { Transaction } from 'knex'
import database from '../../../knex-database'
import service from '../service';

const resolvers: IResolvers = {
  Query: {
    getOrganizationFinantialReconciliation: (_, { }, { organizationId }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.getFinantialConciliationByOrganizationId({ organizationId }, trx);
      })
    },
  },
  Mutation: {
    handleOrganizationFinancialReconciliation: (_, { input }, { organizationId }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.handleOrganizationFinancialReconciliation(input, { organizationId }, trx);
      })
    },
  }
};

export default resolvers;
