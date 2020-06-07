import service from '../service';
import { IResolvers } from 'apollo-server';
import knexDatabase from '../../../knex-database';
import { Transaction } from 'knex';
import ServicesService from '../../services/service';

const resolvers : IResolvers = {
    Query: {
        userServicePermissions: (_, { input }, { client, organizationId, isOrganizationAdmin }) => {
            return knexDatabase.knex.transaction((trx: Transaction) => {
                return service.userServicePermissions(input, {client, organizationId, isOrganizationAdmin}, trx);
            });
        }
    },
    ServicePermissions: {
        service: (obj) => {
            return ServicesService.getServiceById(obj.serviceId);
        },
    }
};

export default resolvers;
