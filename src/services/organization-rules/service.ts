import { fetchPaymentsService } from "../payments/helpers";

const getAffiliateTeammateRules = async (organizationId: string) => {

    const query = `
    query getCurrentOrganizationPlan($input: GetCurrentOrganizationPlanInput!) {
        getCurrentOrganizationPlan(input: $input){
            affiliateRules{
                maxAnalysts
                maxSales
                maxTeammates
                maxTransactionTax
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

    return res.data.data.getCurrentOrganizationPlan

  } catch (error) {
      console.log(error.response.data)
    throw new Error(error.message);
  }

}

export default {
    getAffiliateTeammateRules
}