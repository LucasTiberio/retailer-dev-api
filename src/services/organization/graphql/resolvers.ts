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
    },
    inviteUserToOrganization: (_, { input }, { client }) => {
      return database.knex.transaction((trx: Transaction) => {
        return service.inviteUserToOrganization(input, client, trx);
      });
    },
    responseOrganizationInvite: (_, { input }) => {
      return database.knex.transaction((trx: Transaction) => {
        return service.responseInvite(input, trx);
      });
    }
  },
  Query: {
    verifyOrganizationName: (_, { input }) => {
      return database.knex.transaction((trx: Transaction) => {
        return service.verifyOrganizationName(input.name, trx);
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
