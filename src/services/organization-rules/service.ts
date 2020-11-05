import { fetchPaymentsService } from '../payments/helpers'
import knexDatabase from '../../knex-database'
import moment from 'moment'
import { Transaction } from 'knex'

const getAffiliateTeammateRules = async (organizationId: string, trx?: Transaction, needReturn?: boolean) => {
  const query = `
    query getCurrentOrganizationPlan($input: GetCurrentOrganizationPlanInput!) {
        getCurrentOrganizationPlan(input: $input){
          planRules{
            serviceName
            rules{
              maxTransactionTax
              maxTeammates
              maxAnalysts
              maxSales
              support
              training
              affiliateStore
              sso
              providers{
                name
                status
              }
            }
          }
        }
    }`

  const [organizationFound] = await (trx || knexDatabase.knexConfig)('organizations').where('id', organizationId).select('free_trial', 'free_trial_expires', 'free_plan')

  const variables = {
    input: {
      organizationId,
      freeTrial: organizationFound.free_trial && moment(organizationFound.free_trial_expires).isAfter(moment()),
      freePlan: organizationFound.free_plan,
    },
  }

  try {
    const res = await fetchPaymentsService(query, variables)

    if (res.data?.errors) {
      throw new Error(res.data.errors[0].message)
    }

    return res.data.data.getCurrentOrganizationPlan.planRules[0].rules
  } catch (error) {
    if (needReturn) {
      return false
    }
    let message = error.response?.data?.errors[0]?.message
    throw new Error(message ?? error.message)
  }
}

export default {
  getAffiliateTeammateRules,
}
