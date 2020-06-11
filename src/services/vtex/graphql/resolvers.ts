import { IResolvers } from "apollo-server";
import { Transaction } from "knex";
import knexDatabase from "../../../knex-database";
import service from "../service";

const resolvers : IResolvers = {
  Mutation: {
    verifyAndAttachVtexSecrets: (_, { input }, { client, organizationId }) => {
        return knexDatabase.knex.transaction((trx: Transaction) => {
            return service.verifyAndAttachVtexSecrets(input, {client, organizationId}, trx);
        });
    },
    handleOrganizationVtexCommission: (_, { input }, { client, organizationId }) => {
        return knexDatabase.knex.transaction((trx: Transaction) => {
            return service.handleOrganizationVtexComission(input, {client, organizationId}, trx);
        });
    },
  },
  Query: {
    vtexDepartmentsCommissions: (_, __, { client, organizationId }) => {
        return knexDatabase.knex.transaction((trx: Transaction) => {
            return service.getVtexDepartmentsCommissions({client, organizationId}, trx);
        });
    },
    vtexAffiliateCommission: (_, {input}) => {
        return knexDatabase.knex.transaction((trx: Transaction) => {
            return service.getVtexCommissionByAffiliateIdAndDepartmentId(input, trx);
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
