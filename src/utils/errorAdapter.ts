import { createVtexCampaignFail } from "../common/errors";

export default (message: string) => {
  switch (message) {
    case createVtexCampaignFail:
      return {
        code: 50,
        explication: "Error on create vtex campaign for the new affiliate",
      };
    default:
      return {
        code: 999,
        explication: "Undefined error",
      };
  }
};
