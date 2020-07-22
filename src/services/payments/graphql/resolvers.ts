import { IResolvers } from "apollo-server";
import service from "../service";

const resolvers : IResolvers = {
  Query: {
    listAvailablePlans: () => {
      return service.listAvailablePlans();
    },
    listOrganizationCustomerPayment: (_, __, { organizationId }) => {
        return service.listOrganizationCustomerPayment(organizationId);
    },
    getSubscriptionByOrganizationId: (_,  __, {organizationId}) => {
      return service.getSubscriptionByOrganizationId(organizationId);
    },
  },
  Mutation: {
    createOrganizationCustomer: (_, { input }, { organizationId }) => {
      return service.createOrganizationCustomer(input, { organizationId });
    },
    editOrganizationCustomer: (_, { input }, { organizationId }) => {
      return service.editOrganizationCustomer(input, { organizationId });
    },
    createOrganizationCustomerPayment: (_, { input }, { organizationId }) => {
      return service.createOrganizationCustomerPayment(input, { organizationId });
    },
    sendRecurrencyTransaction: (_, { input }, { organizationId }) => {
      return service.sendRecurrencyTransaction(input, { organizationId });
    },
    updateRecurrencyTransaction: (_, { input }, { organizationId }) => {
      return service.updateRecurrencyTransaction(input, organizationId);
    },
    activateRecurrencyTransaction: (_, __, { organizationId }) => {
      return service.activateRecurrencyTransaction(organizationId);
    },
    cancelRecurrencyTransaction: (_, __, { organizationId }) => {
      return service.cancelRecurrencyTransaction(organizationId);
    },
    removeOrganizationCustomerPayment: (_, { input }, { organizationId }) => {
      return service.removeOrganizationCustomerPayment(input, { organizationId });
    }
  }
};

export default resolvers;
