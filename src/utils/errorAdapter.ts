import {
  createVtexCampaignFail,
  integrationTypeShortenerGeneratorNotFound,
  organizationDoesNotHaveActiveIntegration,
  affiliateDoesNotExist,
  tokenMustBeProvided,
} from "../common/errors";

export default (message: string) => {
  switch (message) {
    case createVtexCampaignFail:
      return {
        code: 50,
        explication: "Error on create vtex campaign for the new affiliate",
      };
    case integrationTypeShortenerGeneratorNotFound:
      return {
        code: 51,
        explication: "Integration provider doesnt have shortener generator",
      };
    case organizationDoesNotHaveActiveIntegration:
      return {
        code: 52,
        explication: "Current organization doesnt have active integration",
      };
    case affiliateDoesNotExist:
      return {
        code: 10,
        explication: "Affiliate doesnt exists",
      };
    case tokenMustBeProvided:
      return {
        code: 1,
        explication: "Token must be provided",
      };
    default:
      return {
        code: 999,
        explication: "Undefined error",
      };
  }
};
