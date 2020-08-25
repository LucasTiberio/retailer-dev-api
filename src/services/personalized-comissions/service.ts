import { Transaction } from 'knex'

import PersonalizedComissionRepository from './repositories/personalized-comissions';

import { ComissionsI } from './types';

/**
 * 
 * @param context graphql context with organizationId
 * @param trx knex transaction
 */
const getOrganizationComissionOrder = async (
  context: {
    organizationId: string,
  },
  trx: Transaction
) => {
  try {
    await PersonalizedComissionRepository.getComissionOrderByOrganizationId(context.organizationId, trx);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 *
 * @param input array of ComissionI
 * @param context graphql context with organizationId
 * @param trx knex transaction
 */
const sendOrganizationComissionOrder = async (
  input: {
    comissions: ComissionsI[]
  },
  context: {
    organizationId: string
  },
  trx: Transaction
) => {
  try {
    await PersonalizedComissionRepository.findOrUpdateList(input.comissions, context.organizationId, trx);
    return true;
  } catch (error) {
    throw new Error(error.message)
  }
}

export default {
  sendOrganizationComissionOrder,
  getOrganizationComissionOrder,
}
