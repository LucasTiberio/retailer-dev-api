import service from "../service";
import { IResolvers } from "apollo-server";
import knexDatabase from "../../../knex-database";
import { Transaction } from "knex";

const resolvers: IResolvers = {
  Mutation: {
    createIntegration: (_, { input }, { organizationId }) => {
      return knexDatabase.knex.transaction((trx: Transaction) => {
        return service.createIntegration(input, { organizationId }, trx);
      });
    },
  },
  Organization: {
    integration: async (obj) => {
      return service.verifyIntegration(obj.id);
    },
  },
};

export default resolvers;
