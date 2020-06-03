import { IResolvers } from 'apollo-server';
import { Transaction } from 'knex';
import knexDatabase from '../../../knex-database';
import service from '../service';

const resolvers : IResolvers = {
    Mutation: {
        affiliateGenerateShortenerUrl: (_, attrs, { client }) => {
            const { input } = attrs;
            return knexDatabase.knex.transaction((trx: Transaction) => {
                return service.generateShortenerUrl(input, client, trx);
            });
        }
    }
};

export default resolvers;
