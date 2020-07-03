import { IResolvers } from "apollo-server";
import service from "../service";

const resolvers : IResolvers = {
  Query: {
    listAvailablePlans: () => {
      return service.listAvailablePlans();
    },
    listCardsByOrganizationId: (_, __, { organizationId }) => {
        return service.listCardsByOrganizationId(organizationId);
    },
    getSubscriptionByOrganizationId: (_,  __, {organizationId}) => {
      return service.getSubscriptionByOrganizationId(organizationId);
    },
    getSubscriptionTransactions: (_,  __, {organizationId}) => {
      return service.getSubscriptionTransactions(organizationId);
    },
  },
  Mutation: {
    saveOrganizationCreditCard: (_, { input }, { organizationId }) => {
      return service.saveOrganizationCreditCard(input, { organizationId });
    },
    createOrganizationSubscribe: (_, { input }, { organizationId }) => {
      return service.createOrganizationSubscribe(input, { organizationId });
    },
    updateRecurrencyTransaction: (_, { input }, { organizationId }) => {
      return service.updateRecurrencyTransaction(input, { organizationId });
    },
    removeCardById: (_, { input }, { organizationId }) => {
      return service.removeCardById(input, { organizationId });
    }
  }
};

export default resolvers;
