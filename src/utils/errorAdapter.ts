import {
  createVtexCampaignFail,
  integrationTypeShortenerGeneratorNotFound,
  organizationDoesNotHaveActiveIntegration,
  affiliateDoesNotExist,
  tokenMustBeProvided,
  upgradeYourPlan,
  minThreeLetters,
  onlyVtexIntegrationFeature,
  affiliateStoreHasThisProduct,
  maxAffiliateStoreProductLength,
} from '../common/errors'

export default (message: string) => {
  switch (message) {
    case createVtexCampaignFail:
      return {
        code: 50,
        explication: 'Error on create vtex campaign for the new affiliate',
      }
    case integrationTypeShortenerGeneratorNotFound:
      return {
        code: 51,
        explication: 'Integration provider doesnt have shortener generator',
      }
    case onlyVtexIntegrationFeature:
      return {
        code: 54,
        explication: 'This feature is only for accounts with vtex integration',
      }
    case minThreeLetters:
      return {
        code: 53,
        explication: 'Minimum three letters for this search',
      }
    case organizationDoesNotHaveActiveIntegration:
      return {
        code: 52,
        explication: 'Current organization doesnt have active integration',
      }
    case affiliateStoreHasThisProduct:
      return {
        code: 55,
        explication: 'Affiliate store has this product',
      }
    case maxAffiliateStoreProductLength:
      return {
        code: 56,
        explication: 'Affiliate store has maximum products added',
      }
    case affiliateDoesNotExist:
      return {
        code: 10,
        explication: 'Affiliate doesnt exists',
      }
    case tokenMustBeProvided:
      return {
        code: 1,
        explication: 'Token must be provided',
      }
    case upgradeYourPlan:
      return {
        code: 8,
        explication: 'Upgrade your plan to use this feature',
      }
    case upgradeYourPlan:
      return {
        code: 9,
        explication: 'Only image/png and image/jpg is supported!',
      }
    default:
      return {
        code: 999,
        explication: 'Undefined error',
      }
  }
}
