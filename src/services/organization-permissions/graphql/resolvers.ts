import service from '../service';
import { IResolvers } from 'apollo-server';
import knexDatabase from '../../../knex-database';
import { Transaction } from 'knex';

const resolvers : IResolvers = {
    Query: {
        userOrganizationPermissions: (_, { input }, { client, organizationId }) => {
            return knexDatabase.knex.transaction((trx: Transaction) => {
                return service.userOrganizationPermissions(input, {client, organizationId}, trx);
            });
        }
    }
};

export default resolvers;
