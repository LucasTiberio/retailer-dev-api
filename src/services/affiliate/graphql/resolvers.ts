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
        paidAffiliateCommission: (_, attrs, { client, organizationId }) => {
            const { input } = attrs;
            return service.paidAffiliateCommission(input, {client, organizationId});
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
        },
        getAllOrganizationOrders: (_, attrs, { client, organizationId}) => {
            const { input } = attrs;
            return service.getAllOrganizationOrders(input, {client, organizationId});
        },
        getOrganizationOrdersByAffiliateId: (_, attrs, { client, organizationId, userServiceOrganizationRolesId}) => {
            const { input } = attrs;
            return service.getOrganizationOrdersByAffiliateId(input, {client, organizationId, userServiceOrganizationRolesId});
        },
        getOrganizationRevenue: (_, attrs, { client, organizationId}) => {
            const { input } = attrs;
            return service.getOrganizationRevenue(input, {client, organizationId});
        },
        getOrganizationAverageTicket: (_, attrs, { client, organizationId}) => {
            const { input } = attrs;
            return service.getOrganizationAverageTicket(input, {client, organizationId});
        },
        getOrganizationTotalOrders: (_, attrs, { client, organizationId}) => {
            const { input } = attrs;
            return service.getOrganizationTotalOrders(input, {client, organizationId});
        },
        getOrganizationTotalOrdersByAffiliate: (_, attrs, { client, organizationId, userServiceOrganizationRolesId}) => {
            const { input } = attrs;
            return service.getOrganizationTotalOrdersByAffiliate(input, {client, organizationId, userServiceOrganizationRolesId});
        },
        getOrganizationCommissionByAffiliate: (_, attrs, { client, organizationId, userServiceOrganizationRolesId}) => {
            const { input } = attrs;
            return service.getOrganizationCommissionByAffiliate(input, {client, organizationId, userServiceOrganizationRolesId});
        },
        getOrganizationCommission: (_, attrs, { client, organizationId}) => {
            const { input } = attrs;
            return service.getOrganizationCommission(input, {client, organizationId});
        },
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
