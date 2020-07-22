import { Transaction } from 'knex';
import knexDatabase from "../../knex-database";
import { IUserToken } from "../authentication/types";
import { MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED } from '../../common/consts';
import { IBrazilBanksFromDb, IUserBankValuesFromDb, IUserBankValuesToInsert } from './types';
import store from '../../store';

const brazilBanksAdapter = (record : IBrazilBanksFromDb) => ({
  id: record.id,
  name: record.name,
  code: record.code,
  createdAt: record.created_at,
  updatedAt: record.updated_at
})

const userBanksValuesAdapter = (record : IUserBankValuesFromDb) => ({
  id: record.id,
  name: record.name,
  agency: record.agency,
  account: record.account,
  accountDigit: record.account_digit,
  document: record.document,
  brazilBankId: record.brazil_bank_id,
  createdAt: record.created_at,
  updatedAt: record.updated_at
})

const bankDataByIdLoader = store.registerOneToOneLoader(
  async (bankDataIds : string[]) => {
    const query = await knexDatabase.knex('banks_data')
    .whereIn('id', bankDataIds)
    .select('*');
    return query;
  },
    'id',
    userBanksValuesAdapter
);

const brazilBankByIdLoader = store.registerOneToOneLoader(
  async (brazilBankIds : string[]) => {
    const query = await knexDatabase.knex('brazil_banks')
    .whereIn('id', brazilBankIds)
    .select('*');
    return query;
  },
    'id',
    brazilBanksAdapter
);

const getBankDataById = async (bankDataId: string) => {

  if(!bankDataId) return null;
  
  const bankData = await bankDataByIdLoader().load(bankDataId);

  return bankData;

}

const getBrazilBankById = async (brazilBankId: string) => {
  
  const brazilBank = await brazilBankByIdLoader().load(brazilBankId);

  return brazilBank;

}

const getBrazilBanks = async (input: {name?: string} ,context: { client: IUserToken }, trx: Transaction) => {

  if(!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED);

  const query = (trx || knexDatabase)('brazil_banks').select();
  
  if(input && input.name){
    query.whereRaw(`LOWER(name) LIKE ?`, [`%${input.name.toLowerCase()}%`])
    query.orWhereRaw(`LOWER(code) LIKE ?`, [`%${input.name.toLowerCase()}%`])
  }

  const result = await query.select('*')

  return result.map(brazilBanksAdapter);
}

const createBankValues = async (
    createUserBankValuesPayload : IUserBankValuesToInsert, 
    context: { client: IUserToken }, 
    trx: Transaction
  ) => {

    if(!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED);

    const [bankValuesInserted] = await (trx || knexDatabase)('banks_data').insert({
      agency: createUserBankValuesPayload.agency,
      account: createUserBankValuesPayload.account,
      account_digit: createUserBankValuesPayload.accountDigit,
      document: createUserBankValuesPayload.document,
      name: createUserBankValuesPayload.name,
      brazil_bank_id: createUserBankValuesPayload.brazilBankId
    }).returning('*');

    return userBanksValuesAdapter(bankValuesInserted);

}

const updateBankValues = async (
    createUserBankValuesPayload : IUserBankValuesToInsert & { bankDataId: string }, 
    context: { client: IUserToken }, 
    trx: Transaction
  ) => {

    if(!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED);

    const [bankValuesInserted] = await (trx || knexDatabase)('banks_data').update({
      agency: createUserBankValuesPayload.agency,
      account: createUserBankValuesPayload.account,
      account_digit: createUserBankValuesPayload.accountDigit,
      document: createUserBankValuesPayload.document,
      name: createUserBankValuesPayload.name,
      brazil_bank_id: createUserBankValuesPayload.brazilBankId
    }).where('id', createUserBankValuesPayload.bankDataId).returning('*');

    return userBanksValuesAdapter(bankValuesInserted);

}


export default {
  getBrazilBanks,
  createBankValues,
  updateBankValues,
  getBankDataById,
  getBrazilBankById
};
