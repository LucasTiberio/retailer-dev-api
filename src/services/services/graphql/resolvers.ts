import { IResolvers } from 'apollo-server';
import knexDatabase from '../../../knex-database';
import { Transaction } from 'knex';
import service from '../service';
import { ICreateServiceInOrganization } from '../types';
import OrganizationService from '../../organization/service';

const resolvers : IResolvers = {
    Mutation: {
        createServiceInOrganization: (_, attrs : ICreateServiceInOrganization, { client }) => {
            const { input } = attrs;
            return knexDatabase.knex.transaction((trx: Transaction) => {
                return service.createServiceInOrganization(input.serviceId, input.organizationId, client, trx);
            });
        },
        addUserInOrganizationService: (_, attrs, { client, organizationId }) => {
            const { input } = attrs;
            return knexDatabase.knex.transaction((trx: Transaction) => {
                return service.addUserInOrganizationService(input, {client, organizationId}, trx);
            });
        },
        inativeUserFromServiceOrganization: (_, attrs, { client, organizationId }) => {
            const { input } = attrs;
            return knexDatabase.knex.transaction((trx: Transaction) => {
                return service.inativeUserFromServiceOrganization(input, {client, organizationId}, trx);
            });
        },
        userInServiceHandleRole: (_, attrs, { client, organizationId }) => {
            const { input } = attrs;
            return knexDatabase.knex.transaction((trx: Transaction) => {
                return service.userInServiceHandleRole(input, {client, organizationId}, trx);
            });
        }
      },
    Query: {
        listAvailableServices: (_, __, { client, organizationId }) => {
            return knexDatabase.knex.transaction((trx: Transaction) => {
                return service.listUsedServices({client, organizationId}, trx);
            });
        },
        listAvailableUsersToService: (_, attrs, { client, organizationId }) => {
            const { input } = attrs;

            return knexDatabase.knex.transaction((trx: Transaction) => {
                return service.listAvailableUsersToService(input, {client, organizationId}, trx);
            });
        },
        getUserInOrganizationService: (_, attrs, { client }) => {
            const { input } = attrs;

            return knexDatabase.knex.transaction((trx: Transaction) => {
                return service.getUserInOrganizationService(input, {client}, trx);
            });
        },
        getUserOrganizationByServiceName: (_, attrs, { client, userServiceOrganizationRolesId }) => {
            const { input } = attrs;
            if(!userServiceOrganizationRolesId) throw new Error("user service organization role id doesnt exists!");
            return knexDatabase.knex.transaction((trx: Transaction) => {
                return service.getUserOrganizationServiceByServiceName(input, {client, userServiceOrganizationRolesId}, trx);
            });
        },
        listUsersInOrganizationService: (_, attrs, { client, organizationId }) => {
            const { input } = attrs;

            return knexDatabase.knex.transaction((trx: Transaction) => {
                return service.listUsersInOrganizationService(input, {client, organizationId}, trx);
            });
        }
      },
    UserOrganizationService: {
        service: (obj) => {
            return service.getServiceById(obj.serviceId);
        },
        serviceRoles: (obj) => {
            return service.getServiceRolesByOneId(obj.serviceRolesId);
        },
        userOrganization: (obj) => {
            return OrganizationService.getUserOrganizationById(obj.usersOrganizationId);
        },
        showFirstSteps: (obj) => {
            return service.verifyFirstSteps(obj.id, obj.bankDataId);
        }
    },
    Service: {
        serviceRoles: (obj) => {
            return service.getServiceRolesById(obj.serviceRolesId);
        },
    }
};

export default resolvers;
