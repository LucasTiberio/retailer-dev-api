import service from '../service';
import { IResolvers } from 'apollo-server';
import { Transaction } from 'knex';
import database from '../../../knex-database';
import UserService from '../../users/service';
import ServicesService from '../../services/service';

const resolvers : IResolvers = {
  Mutation: {
    inviteTeammates: (_, { input }, { client, organizationId }) => {
      return database.knex.transaction((trx: Transaction) => {
        return service.inviteTeammates(input, {client, organizationId}, trx);
      });
    },
    createOrganization: (_, { input }, { client, redisClient }) => {
      return database.knex.transaction((trx: Transaction) => {
        return service.createOrganization(input, {client, redisClient}, trx);
      });
    },
    setCurrentOrganization: (_, { input }, context) => {
      return database.knex.transaction((trx: Transaction) => {
        return service.setCurrentOrganization(input, context, trx);
      });
    },
    organizationUploadImage: async (_, { input }, { client, organizationId }) => {
      const { createReadStream, filename, mimetype } = await input.data;
      return database.knex.transaction((trx: Transaction) => {
        return service.organizationUploadImage({
          imageName: filename,
          data: createReadStream(),
          mimetype,
        }, {client, organizationId}, trx);
      });
    },
    inviteUserToOrganization: (_, { input }, { client, organizationId }) => {
      return database.knex.transaction((trx: Transaction) => {
        return service.inviteUserToOrganization(input, {client, organizationId}, trx);
      });
    },
    responseOrganizationInvite: (_, { input }) => {
      return database.knex.transaction((trx: Transaction) => {
        return service.responseInvite(input, trx);
      });
    },
    inativeUsersInOrganization: (_, { input }, { client, organizationId }) => {
      return database.knex.transaction((trx: Transaction) => {
        return service.inativeUsersInOrganization(input, {client, organizationId}, trx);
      });
    },
    handleUserPermissionInOrganization: (_, { input }, { client, organizationId }) => {
      return database.knex.transaction((trx: Transaction) => {
        return service.handleUserPermissionInOrganization(input, {client, organizationId}, trx);
      });
    }
  },
  Query: {
    verifyOrganizationName: (_, { input }) => {
      return database.knex.transaction((trx: Transaction) => {
        return service.verifyOrganizationName(input.name, trx);
      });
    },
    organizationDetails: (_, __, {client, organizationId}) => {
      return database.knex.transaction((trx: Transaction) => {
        return service.organizationDetails({client, organizationId}, trx);
      });
    },
    listMyOrganizations: (_, __, { client }) => {
      return database.knex.transaction((trx: Transaction) => {
        return service.listMyOrganizations(client, trx);
      });
    },
    listUsersInOrganization: (_, { input }, { client, organizationId }) => {
      return database.knex.transaction((trx: Transaction) => {
        return service.listUsersInOrganization(input, {client, organizationId}, trx);
      });
    },
    findUsersToOrganization: (_, { input }, { client, organizationId }) => {
      return database.knex.transaction((trx: Transaction) => {
        return service.findUsersToOrganization(input, {client, organizationId}, trx);
      });
    }
  },
  Organization: {
    user: async (obj) => {
      return UserService.getUserById(obj.userId);
    },
    organizationRole: async (obj) => {
      return service.getUserOrganizationRole(obj.userOrganizationId);
    },
    services: async (obj) => {
      return ServicesService.getOrganizationServicesByOrganizationId(obj.userOrganizationId, obj.id);
    },
    hasMember: async (obj) => {
      return service.verifyOrganizationHasMember(obj.id);
    },
    showFirstSteps: async (obj) => {
      return service.verifyShowFirstSteps(obj.id);
    },
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
