import { IResolvers } from "apollo-server";
import { Transaction } from "knex";
import knexDatabase from "../../../knex-database";
import service from "../service";

const resolvers : IResolvers = {
  Mutation: {
    verifyAndAttachVtexSecrets: (_, { input }, { client }) => {
        return knexDatabase.knex.transaction((trx: Transaction) => {
            return service.verifyAndAttachVtexSecrets(input, client, trx);
        });
    },
    handleOrganizationVtexCommission: (_, { input }, { client }) => {
        return knexDatabase.knex.transaction((trx: Transaction) => {
            return service.handleOrganizationVtexComission(input, client, trx);
        });
    },
  },
  Query: {
    vtexDepartmentsCommissions: (_, { input }, { client }) => {
        return knexDatabase.knex.transaction((trx: Transaction) => {
            return service.getVtexDepartmentsCommissions(input, client, trx);
        });
    },
  },
  Organization: {
    vtexIntegration: async (obj) => {
      return service.verifyIntegration(obj.id);
    }
  },
};

export default resolvers;
