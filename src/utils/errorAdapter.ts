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
  userDoesNotAcceptTermsAndConditions,
  commissionBonificationWithouRules,
  commissionBonificationPastDate,
  commissionBonificationWithFinalPeriodBeforeStartPeriod,
  commissionBonificationOnlyWithTwoDates,
  commissionBonificationRulesWithWrongTargets,
  userOnlyChangeToSameIntegrationType,
  onlyCreateOrganizationWithouIntegrationWithSecret,
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
    case commissionBonificationWithouRules:
      return {
        code: 63,
        explication: 'Commission bonifications only be created with rules',
      }
    case commissionBonificationPastDate:
      return {
        code: 64,
        explication: 'Only create commission bonification in future dates',
      }
    case commissionBonificationWithFinalPeriodBeforeStartPeriod:
      return {
        code: 65,
        explication: 'Only create commission bonification with end date past start date',
      }
    case commissionBonificationOnlyWithTwoDates:
      return {
        code: 66,
        explication: 'Commission bonification only with start and end date',
      }
    case commissionBonificationRulesWithWrongTargets:
      return {
        code: 67,
        explication: 'Commission bonification with wrong rules targets sent',
      }
    case userOnlyChangeToSameIntegrationType:
      return {
        code: 68,
        explication: 'Organization only change integration to same integration type. Eg: Vtex to Vtex, Loja Integrada to Loja Integrada',
      }
    case onlyCreateOrganizationWithouIntegrationWithSecret:
      return {
        code: 69,
        explication: 'Only create organization without integration with secret',
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
    case userDoesNotAcceptTermsAndConditions:
      return {
        code: 3,
        explication: 'User doest not accept last terms and conditions',
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
