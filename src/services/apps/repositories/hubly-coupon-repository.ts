import { fetchCouponService } from "../helpers";
import HublyCouponData from "../models/HublyCouponData";

const generateAffiliateCoupon = async (input: { affiliateId: string,  }, ctx: { organizationId: string }) => {
  const query = `
    mutation GenerateAffiliateCoupon($input: GenerateCouponInput!) {
      generateCoupon(input: $input) {
        affiliateId
        organizationId
        campaignId
        coupon
        sequence
        active
      }
    }
  `

  const variables = {
    input: {
      ...input,
      ...ctx
    }
  }

  const response = await fetchCouponService(query, variables)

  return response.data?.data?.generateCoupon
}

const getAffiliateCoupon = async (input: { affiliateId: string,  }, ctx: { organizationId: string }) => {
  const query = `
    query GetAffiliateCoupon($input: GetAffiliateCouponInput!) {
      getAffiliateCoupon(input: $input) {
        affiliateId
        organizationId
        campaignId
        coupon
        sequence
        active
      }
    }
  `

  const variables = {
    input: {
      ...input,
      ...ctx
    }
  }

  console.log({variables})

  const response = await fetchCouponService(query, variables)

  return response.data?.data?.getAffiliateCoupon
}

export default {
  generateAffiliateCoupon,
  getAffiliateCoupon
}