import { Transaction } from 'knex'

/** Types */
import { ICreateAffiliateStore, IAffiliateStoreAdapted } from './types'

/** Common */
import { affiliateDoesNotExist } from '../../common/errors'

/** Utils */
import removeUndefinedOfObjects from '../../utils/removeUndefinedOfObjects'

/** Repository */
import Repository from './repositories/affiliate-store'
import { affiliateStoreAdapter } from './adapters'

const handleAffiliateStore = async (
  input: ICreateAffiliateStore,
  context: {
    userServiceOrganizationRolesId: string
  },
  trx: Transaction
): Promise<IAffiliateStoreAdapted> => {
  if (!context.userServiceOrganizationRolesId) throw new Error(affiliateDoesNotExist)

  removeUndefinedOfObjects(input)

  const [affiliateStoreCreated] = await Repository.findOrUpdate(context.userServiceOrganizationRolesId, input, trx)

  return affiliateStoreAdapter(affiliateStoreCreated)
}

const getAffiliateStore = async (context: { userServiceOrganizationRolesId: string }, trx: Transaction) => {
  if (!context.userServiceOrganizationRolesId) throw new Error(affiliateDoesNotExist)

  const affiliateStore = await Repository.getById(context.userServiceOrganizationRolesId, trx)

  return affiliateStoreAdapter(affiliateStore)
}

export default {
  handleAffiliateStore,
  getAffiliateStore,
}
