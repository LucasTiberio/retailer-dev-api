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
    },
    inativeUserInOrganization: (_, { input }, { client }) => {
      return database.knex.transaction((trx: Transaction) => {
        return service.inativeUserInOrganization(input, client, trx);
      });
    },
    handleUserPermissionInOrganization: (_, { input }, { client }) => {
      return database.knex.transaction((trx: Transaction) => {
        return service.handleUserPermissionInOrganization(input, client, trx);
      });
    }
  },
  Query: {
    verifyOrganizationName: (_, { input }) => {
      return database.knex.transaction((trx: Transaction) => {
        return service.verifyOrganizationName(input.name, trx);
      });
    },
    listUsersInOrganization: (_, { input }, { client }) => {
      return database.knex.transaction((trx: Transaction) => {
        return service.listUsersInOrganization(input, client, trx);
      });
    },
    findUsersToOrganization: (_, { input }, { client }) => {
      return database.knex.transaction((trx: Transaction) => {
        return service.findUsersToOrganization(input, client, trx);
      });
    }
  },
  Organization: {
    user: async (obj) => {
      return UserService.getUserById(obj.userId);
    }
  },
  UserOrganizationRole: {
    userOrganization: async (obj) => {
      return service.getUserOrganizationById(obj.userOrganizationId);
    }
  },
  UserOrganization: {
    user: async (obj) => {
      return UserService.getUserById(obj.userId);
    },
    organization: async (obj) => {
      return service.getOrganizationById(obj.organizationId);
    },
    organizationRole: async (obj) => {
      return service.getOrganizationRoleById(obj.organizationRoleId)
    }
  }
};

export default resolvers;
