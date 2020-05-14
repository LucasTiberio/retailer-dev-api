import { IResolvers } from 'apollo-server';
import knexDatabase from '../../../knex-database';
import { Transaction } from 'knex';
import service from '../service';
import { ICreateServiceInOrganization } from '../types';

const resolvers : IResolvers = {
    Mutation: {
        createServiceInOrganization: (_, attrs : ICreateServiceInOrganization, { client }) => {
            const { input } = attrs;

            return knexDatabase.knex.transaction((trx: Transaction) => {
                return service.createServiceInOrganization(input.serviceId, input.organizationId, client, trx);
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
};

export default resolvers;
