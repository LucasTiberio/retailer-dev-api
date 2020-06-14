import { IResolvers } from 'apollo-server';
import { Transaction } from 'knex';
import knexDatabase from '../../../knex-database';
import service from '../service';
import ShortenerUrlService from '../../shortener-url/service';
import ServicesService from '../../services/service';

const resolvers : IResolvers = {
    Mutation: {
        affiliateGenerateShortenerUrl: (_, attrs, { client, organizationId }) => {
            const { input } = attrs;
            return knexDatabase.knex.transaction((trx: Transaction) => {
                return service.generateShortenerUrl(input, {client, organizationId}, trx);
            });
        },
        generateSalesShorten: (_, attrs, {salesId}) => {
            const { input } = attrs;
            return knexDatabase.knex.transaction((trx: Transaction) => {
                return service.generateSalesShorten(input, {salesId}, trx);
            });
        },
        generateSalesJwt: (_, attrs, { redisClient }) => {
            const { input } = attrs;
            return knexDatabase.knex.transaction((trx: Transaction) => {
                return service.generateSalesJWT(input, {redisClient}, trx);
            });
        },
        createAffiliateBankValues: (_, attrs, { client, organizationId, userServiceOrganizationRolesId }) => {
            const { input } = attrs;
            return knexDatabase.knex.transaction((trx: Transaction) => {
                return service.createAffiliateBankValues(input, {
                    userServiceOrganizationRolesId,
                    client,
                    organizationId
                }, trx);
            });
        }
    },
    Query: {
        listAffiliateShorterUrl: (_, attrs, { client }) => {
            const { input } = attrs;
            return knexDatabase.knex.transaction((trx: Transaction) => {
                return service.getShorterUrlByUserOrganizationServiceId(input, client, trx);
            });
        }
    },
    UserOrganizationServiceRolesUrlShortener: {
        shortenerUrl: async (obj) => {
            return ShortenerUrlService.getShortenerUrlById(obj.urlShortenId);
        },
        userOrganizationService: async (obj) => {
            return ServicesService.getOrganizationServicesById(obj.usersOrganizationServiceRolesId);
        },
    }
};

export default resolvers;
