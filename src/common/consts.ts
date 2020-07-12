declare var process : {
	env: {
    PAYMENTS_URL: string
	}
}

export const MESSAGE_ERROR_USER_NOT_IN_ORGANIZATION = "User does not belong to the organization";
export const MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED = "Token must be provided.";
export const MESSAGE_ERROR_USER_NOT_EXISTS_IN_ORGANIZATION_SERIVCE = "User doesnt exists on organization service.";
export const MESSAGE_ERROR_CANNOT_ADD_ADMIN_TO_SERVICES = "Cannot add admin to services";
export const MESSAGE_ERROR_USER_DOES_NOT_HAVE_SALE_ROLE = "'User doesnt have a Sale Role'";
export const MESSAGE_ERROR_USER_DOES_NOT_EXIST_IN_SYSTEM = "'User doesnt exists in system'";
export const MESSAGE_ERROR_SALE_TOKEN_INVALID = "Invalid Sale Token";
export const SALE_VTEX_PIXEL_NAMESPACE = 'sale_vtex_pixel';
export const MESSAGE_ERROR_ORGANIZATION_SERVICE_DOES_NOT_EXIST = 'Organization service does not exist';
export const MESSAGE_ERROR_USER_USED_FREE_TRIAL_TIME = 'User used free trial time.';
export const MESSAGE_ERROR_UPGRADE_PLAN = "upgrade your plan to release this action.";
export const MESSAGE_ERROR_USER_NOT_TEAMMATE = "user not teammates in organization";
export const MESSAGE_ERROR_USER_TEAMMATE = "user teammates in organization";
export const MESSAGE_ERROR_USER_NOT_ORGANIZATION_FOUNDER = "not organization founder";
export const MESSAGE_ERROR_USER_PENDENT_ORGANIZATION_INVITE = "user are pendent in organization";
export const MESSAGE_ERROR_USER_ALREADY_REPLIED_INVITE = "user has already replied to the invitation";

export const PAYMENTS_URL = process.env.PAYMENTS_URL;

export const FREE_TRIAL_DAYS = 10;