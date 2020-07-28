require("dotenv");
import knexDatabase from "../../knex-database";

import ShortenerUrlService from "../shortener-url/service";
import UserService from "../users/service";
import OrganizationService from "../organization/service";
import IntegrationService from "../integration/service";
import ServicesService from "../services/service";
import BankDataService from "../bank-data/service";

import { _usersOrganizationServiceAdapter } from "../services/adapters";

import { IUserToken } from "../authentication/types";
import { Services, ServiceRoles } from "../services/types";
import {
  IUsersOrganizationServiceRolesUrlShortenerFromDB,
  IVtexStatus,
  IOrganizationCommission,
} from "./types";
import { IUserBankValuesToInsert } from "../bank-data/types";
import { Transaction } from "knex";

import {
  MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED,
  MESSAGE_ERROR_USER_NOT_EXISTS_IN_ORGANIZATION_SERIVCE,
  MESSAGE_ERROR_USER_DOES_NOT_EXIST_IN_SYSTEM,
  MESSAGE_ERROR_USER_NOT_IN_ORGANIZATION,
  MESSAGE_ERROR_USER_DOES_NOT_HAVE_SALE_ROLE,
  SALE_VTEX_PIXEL_NAMESPACE,
  MESSAGE_ERROR_ORGANIZATION_SERVICE_DOES_NOT_EXIST,
  MESSAGE_ERROR_ORGANIZATION_DOES_NOT_HAVE_ACTIVE_INTEGRATION,
} from "../../common/consts";

import common from "../../common";
import { RedisClient } from "redis";
import Axios from "axios";
import moment from "moment";
import {
  defaultCommissionAdapter,
  timeToPayCommissionAdapter,
  organizationCommissionAdapter,
} from "./adapters";
import organization from "../organization";
import { Integrations } from "../integration/types";
import { IOrganizationAdapted } from "../organization/types";
import { buildGetCategoriesThreeVtexUrl } from "../vtex/helpers";

const ordersServiceUrl = process.env.ORDER_SERVICE_URL;

const utmSource = "plugone_affiliate";

const affiliateShorterUrlAdapter = (
  record: IUsersOrganizationServiceRolesUrlShortenerFromDB
) => ({
  id: record.id,
  usersOrganizationServiceRolesId: record.users_organization_service_roles_id,
  urlShortenId: record.url_shorten_id,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
});

const generateShortenerUrl = async (
  affiliateGenerateShortenerUrlPayload: {
    originalUrl: string;
    serviceName: Services;
  },
  context: { client: IUserToken; organizationId: string },
  trx: Transaction
) => {
  if (!context.client) throw new Error("token must be provided!");

  const { originalUrl, serviceName } = affiliateGenerateShortenerUrlPayload;

  const userOrganization = await OrganizationService.getUserOrganizationByIds(
    context.client.id,
    context.organizationId,
    trx
  );

  const [organizationService] = await ServicesService.serviceOrganizationByName(
    context.organizationId,
    serviceName,
    trx
  );

  const affiliate = await ServicesService.getServiceMemberById(
    userOrganization.id,
    organizationService.id,
    trx
  );

  if (!affiliate) throw new Error("Affiliate doesnt exists.");

  let hasQueryString = originalUrl.match(/\?/gi);

  const urlWithMemberAttached = `${originalUrl}${
    hasQueryString ? "&" : "?"
  }utm_source=${utmSource}&utm_campaign=${affiliate.id}_${
    context.organizationId
  }`;

  const shorterUrl = await ShortenerUrlService.shortenerUrl(
    urlWithMemberAttached,
    trx
  );

  const attachedShorterUrlOnAffiliate = await attachShorterUrlOnAffiliate(
    affiliate.id,
    shorterUrl.id,
    trx
  );

  return attachedShorterUrlOnAffiliate;
};

const getAllOrganizationOrders = async (
  input: {
    limit?: string;
    startDate?: Date;
    endDate?: Date;
    name?: string;
    status?: IVtexStatus;
  },
  context: { client: IUserToken; organizationId: string }
) => {
  if (!context.client) throw new Error("token must be provided!");

  let limit = input?.limit || "10";

  let url = `${ordersServiceUrl}/organization/${context.organizationId}/order?limit=${limit}`;

  if (input?.startDate) {
    url += `&startDate=${input.startDate}`;
  }

  if (input?.endDate) {
    url += `&endDate=${input.endDate}`;
  }

  if (input?.name) {
    url += `&name=${input.name}`;
  }

  if (input?.status) {
    url += `&status=${input.status}`;
  }

  try {
    const { data } = await Axios.get(url);
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

const paidAffiliateCommission = async (
  input: {
    userOrganizationServiceId: string;
    orderId: string[];
  },
  context: { client: IUserToken; organizationId: string }
) => {
  if (!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED);

  let url = `${ordersServiceUrl}/organization/${context.organizationId}/order/paid`;

  try {
    const { data } = await Axios({
      method: "post",
      url: url,
      data: {
        ...input,
      },
    });

    return data.status;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getOrganizationOrdersByAffiliateId = async (
  input: {
    limit?: string;
    startDate?: Date;
    endDate?: Date;
    name?: string;
    status?: IVtexStatus;
    paid?: boolean;
  },
  context: {
    client: IUserToken;
    organizationId: string;
    userServiceOrganizationRolesId: string;
  }
) => {
  if (!context.client) throw new Error("token must be provided!");

  let limit = input?.limit || "10";

  if (!context.userServiceOrganizationRolesId) throw new Error("Not affiliate");

  let url = `${ordersServiceUrl}/organization/${context.organizationId}/${context.userServiceOrganizationRolesId}/order?limit=${limit}`;

  if (input?.paid) {
    url += `&isCommissionPaid=${input.paid}`;
  }

  if (input?.startDate) {
    url += `&startDate=${input.startDate}`;
  }

  if (input?.endDate) {
    url += `&endDate=${input.endDate}`;
  }

  if (input?.name) {
    url += `&name=${input.name}`;
  }

  if (input?.status) {
    url += `&status=${input.status}`;
  }

  try {
    const { data } = await Axios.get(url);
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

const attachShorterUrlOnAffiliate = async (
  userOrganizationServiceId: string,
  shorterUrlId: string,
  trx: Transaction
) => {
  const [shorterUrlFoundOnAffiliate] = await (trx || knexDatabase.knex)(
    "users_organization_service_roles_url_shortener"
  )
    .where("url_shorten_id", shorterUrlId)
    .returning("*");

  if (shorterUrlFoundOnAffiliate)
    return affiliateShorterUrlAdapter(shorterUrlFoundOnAffiliate);

  const [attachedShorterUrlOnAffiliate] = await (trx || knexDatabase.knex)(
    "users_organization_service_roles_url_shortener"
  )
    .insert({
      users_organization_service_roles_id: userOrganizationServiceId,
      url_shorten_id: shorterUrlId,
    })
    .returning("*");

  return attachedShorterUrlOnAffiliate
    ? affiliateShorterUrlAdapter(attachedShorterUrlOnAffiliate)
    : null;
};

const getShorterUrlByUserOrganizationServiceId = async (
  input: { userOrganizationServiceId: string },
  userToken: IUserToken,
  trx: Transaction
) => {
  if (!userToken) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED);

  const { userOrganizationServiceId } = input;

  const affiliateShortenerUrls = await (trx || knexDatabase.knex)(
    "users_organization_service_roles_url_shortener"
  )
    .where("users_organization_service_roles_id", userOrganizationServiceId)
    .select();

  return affiliateShortenerUrls.map(affiliateShorterUrlAdapter);
};

const createAffiliateBankValues = async (
  createUserBankValuesPayload: IUserBankValuesToInsert,
  context: {
    organizationId: string;
    client: IUserToken;
    userServiceOrganizationRolesId: string;
  },
  trx: Transaction
) => {
  if (!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED);

  if (!context.userServiceOrganizationRolesId)
    throw new Error(MESSAGE_ERROR_USER_NOT_EXISTS_IN_ORGANIZATION_SERIVCE);

  const [affiliateBankDataFound] = await (trx || knexDatabase.knex)(
    "users_organization_service_roles"
  )
    .where("id", context.userServiceOrganizationRolesId)
    .select("*");

  if (affiliateBankDataFound.bank_data_id) {
    await BankDataService.updateBankValues(
      {
        ...createUserBankValuesPayload,
        bankDataId: affiliateBankDataFound.bank_data_id,
      },
      context,
      trx
    );
    return ServicesService._usersOrganizationServiceAdapter(
      affiliateBankDataFound
    );
  }

  const bankData = await BankDataService.createBankValues(
    createUserBankValuesPayload,
    context,
    trx
  );

  const [affiliateBankData] = await (trx || knexDatabase.knex)(
    "users_organization_service_roles"
  )
    .update("bank_data_id", bankData.id)
    .where("id", context.userServiceOrganizationRolesId)
    .returning("*");

  return ServicesService._usersOrganizationServiceAdapter(affiliateBankData);
};

const generateSalesJWT = async (
  generateSalesJWTPayload: {
    organizationId: string;
    email: string;
    serviceName: Services;
  },
  context: { redisClient: RedisClient },
  trx: Transaction
) => {
  const { organizationId, email, serviceName } = generateSalesJWTPayload;

  const user = await UserService.getUserByEmail(email, trx);

  if (!user) throw new Error(MESSAGE_ERROR_USER_DOES_NOT_EXIST_IN_SYSTEM);

  const [
    serviceOrganizationFound,
  ] = await ServicesService.serviceOrganizationByName(
    organizationId,
    serviceName,
    trx
  );

  if (!serviceOrganizationFound)
    throw new Error(MESSAGE_ERROR_USER_NOT_EXISTS_IN_ORGANIZATION_SERIVCE);

  const userOrganization = await OrganizationService.getUserOrganizationByIds(
    user.id,
    organizationId,
    trx
  );

  if (!userOrganization)
    throw new Error(MESSAGE_ERROR_USER_NOT_IN_ORGANIZATION);

  const userRole = await ServicesService.getUserOrganizationServiceRoleName(
    userOrganization.id,
    serviceOrganizationFound.id,
    trx
  );

  if (!userRole || userRole.name !== ServiceRoles.SALE)
    throw new Error(MESSAGE_ERROR_USER_DOES_NOT_HAVE_SALE_ROLE);

  const userOrganizationServiceRoleId = userRole.id;

  const vtexSalePixelJwt = common.generateJwt(
    userOrganizationServiceRoleId,
    SALE_VTEX_PIXEL_NAMESPACE,
    "21600"
  );

  try {
    await context.redisClient.setex(
      `${SALE_VTEX_PIXEL_NAMESPACE}_${vtexSalePixelJwt}`,
      21600,
      userOrganizationServiceRoleId
    );
    return {
      salesId: userOrganizationServiceRoleId,
      vtexSalePixelJwt,
    };
  } catch (e) {
    throw new Error(e.message);
  }
};

const generateSalesShorten = async (
  generateSalesShortenPayload: {
    url: string;
  },
  context: { salesId: string },
  trx: Transaction
) => {
  const shorterUrl = await ShortenerUrlService.shortenerUrl(
    generateSalesShortenPayload.url,
    trx
  );

  await attachShorterUrlOnAffiliate(context.salesId, shorterUrl.id, trx);

  return shorterUrl;
};

const getOrganizationRevenue = async (
  input: {
    startDate: Date;
    endDate: Date;
  },
  context: { client: IUserToken; organizationId: string }
) => {
  if (!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED);

  let startDate = input?.startDate || moment("1900-01-01T00:00:00.000Z");
  let endDate = input?.endDate || moment("2200-01-01T00:00:00.000Z");

  let url = `${ordersServiceUrl}/organization/${context.organizationId}/revenue?startDate=${startDate}&endDate${endDate}`;

  try {
    const { data } = await Axios.get(url);
    return { amount: data.amount };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getOrganizationAverageTicket = async (
  input: {
    startDate: Date;
    endDate: Date;
  },
  context: { client: IUserToken; organizationId: string }
) => {
  if (!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED);

  let startDate = input?.startDate || moment("1900-01-01T00:00:00.000Z");
  let endDate = input?.endDate || moment("2200-01-01T00:00:00.000Z");

  let url = `${ordersServiceUrl}/organization/${context.organizationId}/average/ticket?startDate=${startDate}&endDate${endDate}`;

  try {
    const { data } = await Axios.get(url);
    return { amount: data.amount };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getOrganizationTotalOrders = async (
  input: {
    startDate: Date;
    endDate: Date;
  },
  context: { client: IUserToken; organizationId: string }
) => {
  if (!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED);

  let startDate = input?.startDate || moment("1900-01-01T00:00:00.000Z");
  let endDate = input?.endDate || moment("2200-01-01T00:00:00.000Z");

  let url = `${ordersServiceUrl}/organization/${context.organizationId}/order/total?startDate=${startDate}&endDate${endDate}`;

  try {
    const { data } = await Axios.get(url);
    return { amount: data.amount };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getOrganizationTotalOrdersByAffiliate = async (
  input: {
    startDate: Date;
    endDate: Date;
  },
  context: {
    client: IUserToken;
    organizationId: string;
    userServiceOrganizationRolesId: string;
  }
) => {
  if (!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED);

  if (!context.userServiceOrganizationRolesId) throw new Error("Not affiliate");

  let startDate = input?.startDate || moment("1900-01-01T00:00:00.000Z");
  let endDate = input?.endDate || moment("2200-01-01T00:00:00.000Z");

  let url = `${ordersServiceUrl}/organization/${context.organizationId}/order/total?startDate=${startDate}&endDate=${endDate}&affiliateId=${context.userServiceOrganizationRolesId}`;

  try {
    const { data } = await Axios.get(url);
    return { amount: data.amount };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getOrganizationCommissionByAffiliate = async (
  input: {
    startDate: Date;
    endDate: Date;
    paid: boolean;
  },
  context: {
    client: IUserToken;
    organizationId: string;
    userServiceOrganizationRolesId: string;
  }
) => {
  if (!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED);

  if (!context.userServiceOrganizationRolesId) throw new Error("Not affiliate");

  let startDate = input?.startDate || moment("1900-01-01T00:00:00.000Z");
  let endDate = input?.endDate || moment("2200-01-01T00:00:00.000Z");

  let url = `${ordersServiceUrl}/organization/${context.organizationId}/commission/total?startDate=${startDate}&endDate=${endDate}&affiliateId=${context.userServiceOrganizationRolesId}`;

  if (input.paid) {
    url += `&isCommissionPaid=${input?.paid}`;
  }

  try {
    const { data } = await Axios.get(url);
    return { data };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getOrganizationCommission = async (
  input: {
    startDate: Date;
    endDate: Date;
    paid: boolean;
  },
  context: { client: IUserToken; organizationId: string }
) => {
  if (!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED);

  let startDate = input?.startDate || moment("1900-01-01T00:00:00.000Z");
  let endDate = input?.endDate || moment("2200-01-01T00:00:00.000Z");

  let url = `${ordersServiceUrl}/organization/${context.organizationId}/commission/total?startDate=${startDate}&endDate${endDate}`;

  if (input.paid) {
    url += `&isCommissionPaid=${input?.paid}`;
  }

  try {
    const { data } = await Axios.get(url);
    return { data };
  } catch (error) {
    throw new Error(error.message);
  }
};

const handleTimeToPayCommission = async (
  handleTimeToPayCommissionPayload: {
    days: number;
  },
  context: { organizationId: string; client: IUserToken },
  trx: Transaction
) => {
  if (!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED);

  const { days } = handleTimeToPayCommissionPayload;

  const [organizationService] = await ServicesService.serviceOrganizationByName(
    context.organizationId,
    Services.AFFILIATE,
    trx
  );

  if (!organizationService)
    throw new Error(MESSAGE_ERROR_ORGANIZATION_SERVICE_DOES_NOT_EXIST);

  const [timeToPayCommission] = await (trx || knexDatabase.knex)(
    "organization_services_time_to_pay"
  )
    .where("organization_service_id", organizationService.id)
    .andWhere("type", "commission")
    .select("id");

  if (timeToPayCommission) {
    const [timeToPayCommissionUpdated] = await (trx || knexDatabase.knex)(
      "organization_services_time_to_pay"
    )
      .update({ days })
      .where("id", timeToPayCommission.id)
      .returning("*");

    return timeToPayCommissionAdapter(timeToPayCommissionUpdated);
  }

  const [timeToPayCommissionUpdated] = await (trx || knexDatabase.knex)(
    "organization_services_time_to_pay"
  )
    .insert({
      days,
      type: "commission",
      organization_service_id: organizationService.id,
    })
    .returning("*");

  return timeToPayCommissionAdapter(timeToPayCommissionUpdated);
};

const getTimeToPayCommission = async (
  context: { organizationId: string; client: IUserToken },
  trx: Transaction
) => {
  if (!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED);

  const [organizationService] = await ServicesService.serviceOrganizationByName(
    context.organizationId,
    Services.AFFILIATE,
    trx
  );

  if (!organizationService)
    throw new Error(MESSAGE_ERROR_ORGANIZATION_SERVICE_DOES_NOT_EXIST);

  const [timeToPayCommission] = await (trx || knexDatabase.knex)(
    "organization_services_time_to_pay"
  )
    .where("organization_service_id", organizationService.id)
    .andWhere("type", "commission")
    .select("*");

  return timeToPayCommission
    ? timeToPayCommissionAdapter(timeToPayCommission)
    : null;
};

const getTimeToPayCommissionById = async (
  input: { organizationId: string },
  trx: Transaction
) => {
  const [organizationService] = await ServicesService.serviceOrganizationByName(
    input.organizationId,
    Services.AFFILIATE,
    trx
  );

  if (!organizationService)
    throw new Error(MESSAGE_ERROR_ORGANIZATION_SERVICE_DOES_NOT_EXIST);

  const [timeToPayCommission] = await (trx || knexDatabase.knex)(
    "organization_services_time_to_pay"
  )
    .where("organization_service_id", organizationService.id)
    .andWhere("type", "commission")
    .select("*");

  return timeToPayCommission
    ? timeToPayCommissionAdapter(timeToPayCommission)
    : null;
};

const getDefaultCommissionByOrganizationServiceId = async (
  organizationServiceId: string,
  trx: Transaction
) => {
  const [defaultCommission] = await (trx || knexDatabase.knex)(
    "organization_services_def_commission"
  )
    .where("organization_service_id", organizationServiceId)
    .select("*");

  return defaultCommission ? defaultCommissionAdapter(defaultCommission) : null;
};

const getDefaultCommission = async (
  context: { organizationId: string; client: IUserToken },
  trx: Transaction
) => {
  if (!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED);

  const [organizationService] = await ServicesService.serviceOrganizationByName(
    context.organizationId,
    Services.AFFILIATE,
    trx
  );

  if (!organizationService)
    throw new Error(MESSAGE_ERROR_ORGANIZATION_SERVICE_DOES_NOT_EXIST);

  return getDefaultCommissionByOrganizationServiceId(
    organizationService.id,
    trx
  );
};

const handleDefaultommission = async (
  handleDefaultCommission: { percentage: number },
  context: { organizationId: string; client: IUserToken },
  trx: Transaction
) => {
  if (!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED);

  const { percentage } = handleDefaultCommission;

  const [organizationService] = await ServicesService.serviceOrganizationByName(
    context.organizationId,
    Services.AFFILIATE,
    trx
  );

  if (!organizationService)
    throw new Error(MESSAGE_ERROR_ORGANIZATION_SERVICE_DOES_NOT_EXIST);

  const [defaultCommission] = await (trx || knexDatabase.knex)(
    "organization_services_def_commission"
  )
    .where("organization_service_id", organizationService.id)
    .select("id");

  if (defaultCommission) {
    const [defaultCommissionUpdated] = await (trx || knexDatabase.knex)(
      "organization_services_def_commission"
    )
      .update({
        percentage,
      })
      .where("id", defaultCommission.id)
      .returning("*");

    return defaultCommissionAdapter(defaultCommissionUpdated);
  }

  const [defaultCommissionCreated] = await (trx || knexDatabase.knex)(
    "organization_services_def_commission"
  )
    .insert({
      percentage,
      organization_service_id: organizationService.id,
    })
    .returning("*");

  return defaultCommissionAdapter(defaultCommissionCreated);
};

const handleOrganizationCommission = async (
  input: {
    departmentId: string;
    commissionPercentage: number;
    active: boolean;
  },
  context: { organizationId: string },
  trx: Transaction
) => {
  const integrationType = await IntegrationService.getIntegrationByOrganizationId(
    context.organizationId,
    trx
  );

  if (!integrationType.type)
    throw new Error(
      MESSAGE_ERROR_ORGANIZATION_DOES_NOT_HAVE_ACTIVE_INTEGRATION
    );

  const comissionFound = await getOrganizationCommissionByType(
    input.departmentId,
    context.organizationId,
    integrationType.type,
    trx
  );

  if (comissionFound) {
    const organizationCommissionCreated = await updateOrganizationCommission(
      input,
      comissionFound.id,
      trx
    );
    return organizationCommissionCreated;
  } else {
    const organizationCommissionCreated = await createOrganizationCommission(
      input,
      context.organizationId,
      integrationType.type,
      trx
    );

    return organizationCommissionCreated;
  }
};

const createOrganizationCommission = async (
  input: {
    departmentId: string;
    commissionPercentage: number;
    active: boolean;
  },
  organizationId: string,
  integrationType: Integrations,
  trx: Transaction
) => {
  const [organizationCommission] = await (trx || knexDatabase.knex)(
    "organization_commission"
  )
    .insert({
      department_id: input.departmentId,
      commission_percentage: input.commissionPercentage,
      active: input.active,
      organization_id: organizationId,
      type: integrationType,
    })
    .returning("*");

  return organizationCommissionAdapter(organizationCommission);
};

const updateOrganizationCommission = async (
  input: {
    departmentId: string;
    commissionPercentage: number;
    active: boolean;
  },
  commissionId: string,
  trx: Transaction
) => {
  const [organizationCommission] = await (trx || knexDatabase.knex)(
    "organization_commission"
  )
    .update({
      department_id: input.departmentId,
      commission_percentage: input.commissionPercentage,
      active: input.active,
    })
    .where("id", commissionId)
    .returning("*");

  return organizationCommissionAdapter(organizationCommission);
};

const getOrganizationCommissionByType = async (
  departmentId: string,
  organizationId: string,
  integrationType: Integrations,
  trx: Transaction
) => {
  const organizationCommission = await (trx || knexDatabase.knex)(
    "organization_commission"
  )
    .where("organization_id", organizationId)
    .andWhere("department_id", departmentId)
    .andWhere("type", integrationType)
    .first()
    .select();

  return organizationCommission
    ? organizationCommissionAdapter(organizationCommission)
    : null;
};

const getOrganizationCommissionByOrganizationId = async (
  context: { organizationId: string },
  trx: Transaction
) => {
  const integration = await IntegrationService.getIntegrationByOrganizationId(
    context.organizationId,
    trx
  );

  if (!integration.type)
    throw new Error(
      MESSAGE_ERROR_ORGANIZATION_DOES_NOT_HAVE_ACTIVE_INTEGRATION
    );

  const organizationCommission = await (trx || knexDatabase.knex)(
    "organization_commission"
  )
    .where("organization_id", context.organizationId)
    .andWhere("type", integration.type)
    .select();

  switch (integration.type) {
    case Integrations.LOJA_INTEGRADA:
      const lojaIntegradaAttachedList = await attachLojaIntegradaCategoryName(
        organizationCommission,
        integration.identifier
      );
      return lojaIntegradaAttachedList.map(organizationCommissionAdapter);
    case Integrations.VTEX:
      const vtexAttachedList = await attachVtexCategoryName(
        organizationCommission,
        integration.secret
      );
      return vtexAttachedList.map(organizationCommissionAdapter);
    default:
      return [];
  }
};

const attachVtexCategoryName = async (
  commissionList: IOrganizationCommission[],
  secret: string
) => {
  const decode: any = await common.jwtDecode(secret);

  const vtexCategoriesData = await getVtexCategoriesCategories(
    decode.accountName
  );

  let mergedArray: any = [];

  vtexCategoriesData.map((item: { id: number; name: string }) => {
    return commissionList.some((commission) => {
      if (Number(item.id) === Number(commission.department_id)) {
        mergedArray.push({
          ...commission,
          name: item.name,
        });
      }
    });
  });

  return mergedArray;
};

const getLojaIntegradaCategories = async (identifier: string) => {
  const { data: dataLojaIntegradaCategories } = await Axios.get(
    "https://api.awsli.com.br/v1/categoria",
    {
      params: {
        chave_aplicacao: process.env.LOJA_INTEGRADA_APPLICATION_KEY,
        chave_api: identifier,
      },
    }
  );

  return dataLojaIntegradaCategories.objects;
};

const getVtexCategoriesCategories = async (accountName: string) => {
  const { data: vtexCategoriesData } = await Axios.get(
    buildGetCategoriesThreeVtexUrl(accountName),
    {
      headers: {
        "content-type": "Content-Type",
      },
    }
  );

  return vtexCategoriesData;
};

const attachLojaIntegradaCategoryName = async (
  commissionList: IOrganizationCommission[],
  identifier: string
) => {
  const dataLojaIntegradaCategories = await getLojaIntegradaCategories(
    identifier
  );

  let mergedArray: any = [];

  dataLojaIntegradaCategories.map((item: { id: number; nome: string }) => {
    return commissionList.some((commission) => {
      if (Number(item.id) === Number(commission.department_id)) {
        mergedArray.push({
          ...commission,
          name: item.nome,
        });
      }
    });
  });

  return mergedArray;
};

const getOrganizationCommissionsName = async (
  organizationId: string,
  trx: Transaction
) => {
  const integration = await IntegrationService.getIntegrationByOrganizationId(
    organizationId,
    trx
  );

  if (!integration.type)
    throw new Error(
      MESSAGE_ERROR_ORGANIZATION_DOES_NOT_HAVE_ACTIVE_INTEGRATION
    );

  switch (integration.type) {
    case Integrations.LOJA_INTEGRADA:
      const lojaIntegradaCategories = await getLojaIntegradaCategories(
        integration.identifier
      );
      return lojaIntegradaCategories.map((item: any) => ({
        name: item.nome,
        id: item.id,
      }));
    case Integrations.VTEX:
      const decode: any = await common.jwtDecode(integration.secret);
      const vtexCategories = await getVtexCategoriesCategories(
        decode?.accountName
      );
      return vtexCategories.map((item: any) => ({
        name: item.name,
        id: item.id,
      }));
    default:
      return [];
  }
};

export default {
  generateShortenerUrl,
  getOrganizationCommissionsName,
  generateSalesShorten,
  getOrganizationCommissionByOrganizationId,
  getOrganizationTotalOrders,
  getTimeToPayCommissionById,
  getDefaultCommissionByOrganizationServiceId,
  getOrganizationCommission,
  getShorterUrlByUserOrganizationServiceId,
  createAffiliateBankValues,
  generateSalesJWT,
  getAllOrganizationOrders,
  getOrganizationOrdersByAffiliateId,
  getOrganizationRevenue,
  getOrganizationAverageTicket,
  getOrganizationTotalOrdersByAffiliate,
  getOrganizationCommissionByAffiliate,
  paidAffiliateCommission,
  getDefaultCommission,
  handleTimeToPayCommission,
  handleDefaultommission,
  getTimeToPayCommission,
  handleOrganizationCommission,
};
