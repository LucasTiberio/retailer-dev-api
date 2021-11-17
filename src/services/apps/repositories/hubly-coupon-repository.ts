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

const toggleAffiliateCoupon = async (input: { affiliateId: string, activity?: boolean }, ctx: { organizationId: string }) => {
  const query = `
    mutation ToggleAffiliateCoupon($input: ToggleAffiliateCouponInput!) {
      toggleAffiliateCoupon(input: $input)
    }
  `

  const { activity, ...inp } = input

  const variables = {
    input: {
      ...inp,
      isDisabled: activity,
      ...ctx
    }
  }

  console.log({ variables })

  const response = await fetchCouponService(query, variables)

  return response.data?.data?.toggleAffiliateCoupon
}

const getAllAffiliatesCoupon = async (ctx: { organizationId: string }) => {
  const query = `
    query GetAllAffiliatesCoupon($input: GetAllAffiliatesCouponInput!) {
      getAllAffiliatesCoupon(input: $input) {
        affiliateId
        username
        email
        document
        coupon
      }
    }
  `

  const variables = {
    input: {
      ...ctx
    }
  }

  const response = await fetchCouponService(query, variables)

  console.log(response.data?.data?.getAllAffiliatesCoupon)

  return response.data?.data?.getAllAffiliatesCoupon
}

export default {
  generateAffiliateCoupon,
  getAffiliateCoupon,
  getAllAffiliatesCoupon,
  toggleAffiliateCoupon
}