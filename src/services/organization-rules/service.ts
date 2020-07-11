import { fetchPaymentsService } from "../payments/helpers";

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
            }
          }
        }
    }`

  const variables = {
      input: {
        organizationId
      }
  };

  try {

    const res = await fetchPaymentsService(query, variables);

    if(res.data?.errors){
      throw new Error(res.data.errors[0].message)
    }

    return res.data.data.getCurrentOrganizationPlan.planRules[0].rules

  } catch (error) {
      console.log(error.response.data)
    throw new Error(error.message);
  }

}

export default {
    getAffiliateTeammateRules
}