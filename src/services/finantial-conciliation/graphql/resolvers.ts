import { IResolvers } from "apollo-server";
import { Transaction } from 'knex'
import database from '../../../knex-database'
import service from '../service';

const resolvers: IResolvers = {
  Query: {
    getOrganizationFinantialConciliation: (_, { }, { organizationId }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.getFinantialConciliationConfigurationByOrganizationId({ organizationId }, trx);
      })
    },
  },
  Mutation: {
    handleOrganizationFinantialConciliationConfiguration: (_, { input }, { organizationId }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.handleOrganizationFinantialConciliationConfiguration(input, { organizationId }, trx);
      })
    },
  }
};

export default resolvers;
