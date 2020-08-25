import { Transaction } from 'knex'

import { ComissionsOrder } from './types'

/** Repositories */

import PersonalizedComissionRepository from './repositories/personalized-comissions'
import { organizationCommissionOrderDuplicated } from '../../common/errors'

/**
 *
 * @param context graphql context with organizationId
 * @param trx knex transaction
 */
const getOrganizationComissionOrder = async (
  context: {
    organizationId: string
  },
  trx: Transaction
) => {
  try {
    await PersonalizedComissionRepository.getComissionOrderByOrganizationId(context.organizationId, trx)
  } catch (error) {
    throw new Error(error.message)
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
    comissions: ComissionsOrder[]
  },
  context: {
    organizationId: string
  },
  trx: Transaction
) => {
  try {
    await Promise.all(
      input.comissions.map(async (commission) => {
        await PersonalizedComissionRepository.findOrUpdate(commission, context.organizationId, trx)
      })
    )
    return true
  } catch (error) {
    if (error.message.includes('organization_commission_order_organization_id_order_unique')) {
      throw new Error(organizationCommissionOrderDuplicated)
    }

    throw new Error(error.message)
  }
}

export default {
  sendOrganizationComissionOrder,
  getOrganizationComissionOrder,
}
