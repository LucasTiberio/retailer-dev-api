import { IResolvers } from "apollo-server";
import knexDatabase from "../../../knex-database";
import { Transaction } from "knex";
import service from '../service';

const resolvers : IResolvers = {
  Query: {
    getBrazilBanks: async (_, { input }, { client })  => {
      return knexDatabase.knexConfig.transaction((trx: Transaction) => {
        return service.getBrazilBanks(input, {client}, trx);
      });
    }
  },
  UserOrganizationService: {
    bankData: async (obj) => {
      return service.getBankDataById(obj.bankDataId);
    },
  },
  UserBankValues: {
    brazilBank: async (obj) => {
      return service.getBrazilBankById(obj.brazilBankId);
    },
  }
};

export default resolvers;
