import service from '../service';
import { IResolvers } from 'apollo-server';
import { Transaction } from 'knex';
import database from '../../../knex-database';

const resolvers : IResolvers = {
  Mutation: {
    signUp: (_, { input }) => {
      return database.knex.transaction((trx: Transaction) => {
        return service.signUp(input, trx);
      });
    },
    userVerifyEmail: (_, { input }) => {
      return database.knex.transaction((trx: Transaction) => {
        return service.verifyEmail(input.verificationHash, trx);
      });
    },
    userRecoveryPassword: (_, { input }) => {
      return database.knex.transaction((trx: Transaction) => {
        return service.recoveryPassword(input.email, trx);
      });
    },
    userPasswordChange: (_, { input }) => {
      return database.knex.transaction((trx: Transaction) => {
        return service.changePassword(input, trx);
      });
    }
  },
  Query: {}
};

export default resolvers;
