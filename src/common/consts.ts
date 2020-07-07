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

export const PAYMENTS_URL = process.env.PAYMENTS_URL;