import { IResolvers } from 'apollo-server';
import { Transaction } from 'knex';
import knexDatabase from '../../../knex-database';
import service from '../service';
import ShortenerUrlService from '../../shortener-url/service';

const resolvers : IResolvers = {
    Mutation: {
        affiliateGenerateShortenerUrl: (_, attrs, { client }) => {
            const { input } = attrs;
            return knexDatabase.knex.transaction((trx: Transaction) => {
                return service.generateShortenerUrl(input, client, trx);
            });
        }
    },
    UserOrganizationServiceRolesUrlShortener: {
        shortenerUrl: async (obj) => {
            return ShortenerUrlService.getShortenerUrlById(obj.urlShortenId);
        },
    }
};

export default resolvers;
