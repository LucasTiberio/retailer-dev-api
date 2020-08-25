import { Transaction } from 'knex'

import { CommissionsOrder } from './types'

/** Repositories */

import PersonalizedCommissionRepository from './repositories/personalized-commissions'
import { organizationCommissionOrderDuplicated } from '../../common/errors'
import { commissionOrderAdapter } from './adapter'

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
    const commissionOrdersFound = await PersonalizedCommissionRepository.getCommissionOrderByOrganizationId(context.organizationId, trx)
    return commissionOrdersFound.length ? commissionOrdersFound.map(commissionOrderAdapter) : null
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
    const uniqueValues = new Set(input.commissions.map((v) => v.order))

    if (uniqueValues.size < input.commissions.length) {
      throw new Error(organizationCommissionOrderDuplicated)
    }

    await Promise.all(
      input.commissions.map(async (commission) => {
        await PersonalizedCommissionRepository.findOrUpdate(commission, context.organizationId, trx)
      })
    )
    return true
  } catch (error) {
    throw new Error(error.message)
  }
}

export default {
  sendOrganizationCommissionOrder,
  getOrganizationCommissionOrder,
}
