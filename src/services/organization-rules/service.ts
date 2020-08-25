import { fetchPaymentsService } from '../payments/helpers'
import knexDatabase from '../../knex-database'
import moment from 'moment'

const getAffiliateTeammateRules = async (organizationId: string) => {
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
              sso
              providers{
                name
                status
              }
            }
          }
        }
    }`

  const [organizationFound] = await knexDatabase.knex('organizations').where('id', organizationId).select('free_trial', 'free_trial_expires')

  const variables = {
    input: {
      organizationId,
      freeTrial: organizationFound.free_trial && moment(organizationFound.free_trial_expires).isAfter(moment()),
    },
  }

  try {
    const res = await fetchPaymentsService(query, variables)

    if (res.data?.errors) {
      throw new Error(res.data.errors[0].message)
    }

    return res.data.data.getCurrentOrganizationPlan.planRules[0].rules
  } catch (error) {
    throw new Error(error.message)
  }
}

export default {
  getAffiliateTeammateRules,
}
