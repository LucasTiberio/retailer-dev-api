import service from '../service';
import { IResolvers } from 'apollo-server';
import { Transaction } from 'knex';
import database from '../../../knex-database';

const resolvers : IResolvers = {
  Mutation: {
    signIn: (_, { input }) => {
      return database.knexConfig.transaction((trx: Transaction) => {
        return service.signIn(input, trx);
      });
    },
  },
};

export default resolvers;
