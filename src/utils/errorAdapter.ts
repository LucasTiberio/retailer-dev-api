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
  organizationDoestNotHaveActiveIntegration,
  onlyThreeBannersInAffiliateStore,
  affiliateStoreNotFound,
  organizationDoesNotExist,
  organizationDomainNotFound,
  vtexProductNotFound,
  sellerDoesNotExistInLojaIntegrada,
  lojaIntegradaProductNotFound,
  userAlreadyRegistered,
  organizationCommissionOrderDuplicated,
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
    case organizationDoestNotHaveActiveIntegration:
      return {
        code: 57,
        explication: 'Organization does not have a active plataform integration',
      }
    case vtexProductNotFound:
      return {
        code: 58,
        explication: 'Vtex product not found',
      }
    case lojaIntegradaProductNotFound:
      return {
        code: 59,
        explication: 'Loja Integrada product not found',
      }
    case sellerDoesNotExistInLojaIntegrada:
      return {
        code: 60,
        explication: 'Seller does not exist in loja integrada plataform',
      }
    case userAlreadyRegistered:
      return {
        code: 61,
        explication: 'User already registered',
      }
    case organizationCommissionOrderDuplicated:
      return {
        code: 62,
        explication: 'Organization Commission Order received are duplicated',
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
    case affiliateStoreNotFound:
      return {
        code: 12,
        explication: 'Affiliate Store not found',
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
    case organizationDoesNotExist:
      return {
        code: 3,
        explication: 'Organization not found',
      }
    case organizationDomainNotFound:
      return {
        code: 4,
        explication: 'Organization Domain not found',
      }
    case onlyThreeBannersInAffiliateStore:
      return {
        code: 11,
        explication: 'Maximum three banners in affiliate store',
      }
    default:
      return {
        code: 999,
        explication: 'Undefined error',
      }
  }
}
