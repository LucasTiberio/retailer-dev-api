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
  }
};

export default resolvers;
