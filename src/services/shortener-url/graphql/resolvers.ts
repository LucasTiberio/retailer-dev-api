import { IResolvers } from 'apollo-server';
import knexDatabase from '../../../knex-database';
import { Transaction } from 'knex';
import service from '../service';

const resolvers : IResolvers = {
    Query: {
        getOriginalUrlByCode: (_, attrs) => {
            const { input } = attrs;
            return knexDatabase.knexConfig.transaction((trx: Transaction) => {
                return service.getOriginalUrlByCode(input.urlCode, trx);
            });
        },
        getLatestUrl: (_, __, { organizationId, client: { id: userId } }) => {
            return knexDatabase.knexConfig.transaction(async (trx: Transaction) => {
              const list = await service.getAffiliateLatestUrl({ organizationId, userId }, trx)
              return list
            })
        },
    }
};

export default resolvers;
