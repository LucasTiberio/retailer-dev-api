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
        addUserInOrganizationService: (_, attrs, { client }) => {
            const { input } = attrs;
            return knexDatabase.knex.transaction((trx: Transaction) => {
                return service.addUserInOrganizationService(input, client, trx);
            });
        }
      },
    Query: {
        listAvailableServices: (_, attrs, { client }) => {
            const { input } = attrs;

            return knexDatabase.knex.transaction((trx: Transaction) => {
                return service.listUsedServices(input.organizationId, client, trx);
            });
        }
      },
    UserOrganizationService: {
        service: (obj) => {
            return service.getServiceById(obj.serviceId);
        },
        serviceRoles: (obj) => {
            return service.getServiceRolesById(obj.serviceRolesId);
        },
        userOrganization: (obj) => {
            return OrganizationService.getUserOrganizationById(obj.usersOrganizationId);
        }
      },
};

export default resolvers;
