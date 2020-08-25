import { Transaction } from 'knex'

import { CommissionsOrder } from './types'

/** Repositories */

import PersonalizedCommissionRepository from './repositories/personalized-commissions'
import { organizationCommissionOrderDuplicated } from '../../common/errors'

/**
 *
 * @param context graphql context with organizationId
 * @param trx knex transaction
 */
const getOrganizationCommissionOrder = async (
  context: {
    organizationId: string
  },
  trx: Transaction
) => {
  try {
    await PersonalizedCommissionRepository.getCommissionOrderByOrganizationId(context.organizationId, trx)
  } catch (error) {
    throw new Error(error.message)
  }
}

/**
 *
 * @param input array of CommissionI
 * @param context graphql context with organizationId
 * @param trx knex transaction
 */
const sendOrganizationCommissionOrder = async (
  input: {
    commissions: CommissionsOrder[]
  },
  context: {
    organizationId: string
  },
  trx: Transaction
) => {
  try {
    await Promise.all(
      input.commissions.map(async (commission) => {
        await PersonalizedCommissionRepository.findOrUpdate(commission, context.organizationId, trx)
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
  sendOrganizationCommissionOrder,
  getOrganizationCommissionOrder,
}
