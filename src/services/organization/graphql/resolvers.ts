import service from '../service';
import { IResolvers } from 'apollo-server';
import { Transaction } from 'knex';
import database from '../../../knex-database';
import UserService from '../../users/service';

const resolvers : IResolvers = {
  Mutation: {
    createOrganization: (_, { input }, { client }) => {
      return database.knex.transaction((trx: Transaction) => {
        return service.createOrganization(input, client, trx);
      });
    }
  },
  Organization: {
    user: async (obj) => {
      return UserService.getUserById(obj.userId);
    }
  }
};

export default resolvers;
