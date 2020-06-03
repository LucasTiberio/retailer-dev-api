import { IResolvers } from 'apollo-server';
import knexDatabase from '../../../knex-database';
import { Transaction } from 'knex';
import service from '../service';

const resolvers : IResolvers = {
    Query: {
        getOriginalUrlByCode: (_, attrs) => {
            const { input } = attrs;
            return knexDatabase.knex.transaction((trx: Transaction) => {
                return service.getOriginalUrlByCode(input.urlCode, trx);
            });
        }
    }
};

export default resolvers;
