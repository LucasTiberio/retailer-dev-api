import { Transaction } from "knex";
import knexDatabase from "../../knex-database";
import { IUserToken } from "../authentication/types";
import axios from "axios";
import { IVtexIntegrationAdapted, IVtexCampaign, IVtexSecrets } from "./types";
import moment from "moment";
import { mockVtexDepartments } from "../../__mocks__";
import ServicesService from "../services/service";
import AffiliateService from "../affiliate/service";
import { MESSAGE_ERROR_USER_NOT_EXISTS_IN_ORGANIZATION_SERIVCE } from "../../common/consts";
import { vtexAdapter, vtexCommissionsAdapter } from "./adapters";
import {
  ORDER_MOMENTS,
  buildVerifyVtexSecretsUrl,
  buildOrderHookVtexUrl,
  buildCreateCampaignVtexUrl,
  buildGetCategoriesThreeVtexUrl,
} from "./helpers";
import { Integrations } from "../integration/types";
import common from "../../common";

const createVtexHook = async (secrets: IVtexSecrets) => {
  const hookInput = {
    filter: {
      status: ORDER_MOMENTS,
    },
    hook: {
      url:
        "https://hook-orders-staging.plugone.io/feed/affiliate/vtex/orders/sync",
    },
    visibilityTimeoutInSeconds: 250,
    MessageRetentionPeriodInSeconds: 4000000,
  };

  const hookCreated = await axios({
    method: "post",
    url: buildOrderHookVtexUrl(secrets.accountName),
    data: JSON.stringify(hookInput),
    headers: {
      "x-vtex-api-appkey": secrets.xVtexApiAppKey,
      "x-vtex-api-apptoken": secrets.xVtexApiAppToken,
      "Content-Type": "application/json; charset=utf-8",
    },
  });

  if (hookCreated.status === 200) {
    return true;
  }
};

const verifyVtexSecrets = async (secrets: IVtexSecrets) => {
  try {
    const data = await axios.get(
      buildVerifyVtexSecretsUrl(secrets.accountName),
      {
        params: {
          f_creationDate:
            "creationDate:[2020-01-01T02:00:00.000Z TO 2100-01-01T01:59:59.999Z]",
        },
        headers: {
          "content-type": "Content-Type",
          "x-vtex-api-appkey": secrets.xVtexApiAppKey,
          "x-vtex-api-apptoken": secrets.xVtexApiAppToken,
        },
      }
    );

    if (data.status === 200) {
      return true;
    }

    return false;
  } catch (e) {
    let errorMessage = e.response?.data?.error?.message || e.message;
    if (errorMessage === "An error has occurred")
      errorMessage = "Verifique as chaves inseridas.";
    throw new Error(errorMessage);
  }
};

const attachVtexSecrets = async (
  input: {
    xVtexApiAppKey: string;
    xVtexApiAppToken: string;
    accountName: string;
  },
  organizationId: string,
  trx: Transaction
) => {
  const { xVtexApiAppKey, xVtexApiAppToken, accountName } = input;

  const [verifySecretExists] = await (trx || knexDatabase)(
    "organization_vtex_secrets"
  )
    .where("store_name", accountName)
    .andWhere("organization_id", organizationId)
    .select();

  if (verifySecretExists) {
    const changeVtexSecrets = await (trx || knexDatabase)(
      "organization_vtex_secrets"
    )
      .where("id", verifySecretExists.id)
      .update({
        vtex_key: xVtexApiAppKey,
        vtex_token: xVtexApiAppToken,
        status: true,
      })
      .select();

    return changeVtexSecrets;
  }

  const attachedVtexSecrets = await (trx || knexDatabase)(
    "organization_vtex_secrets"
  )
    .insert({
      organization_id: organizationId,
      store_name: accountName,
      vtex_key: xVtexApiAppKey,
      vtex_token: xVtexApiAppToken,
    })
    .returning("*");

  return attachedVtexSecrets;
};

const getSecretsByOrganizationId = async (
  organizationId: string,
  trx: Transaction
) => {
  const [verifySecretExists] = await (trx || knexDatabase)(
    "organization_integration_secrets AS ois"
  )
    .innerJoin(
      "integration_secrets AS is",
      "is.id",
      "ois.integration_secrets_id"
    )
    .where("organization_id", organizationId)
    .andWhere("type", Integrations.VTEX)
    .select("is.secret", "ois.active", "ois.organization_id");

  if (!verifySecretExists) return null;

  const decode: any = await common.jwtDecode(verifySecretExists.secret);

  return {
    organizationId: verifySecretExists.organization_id,
    storeName: decode.accountName,
    vtexKey: decode.xVtexApiAppKey,
    vtexToken: decode.xVtexApiAppToken,
    status: verifySecretExists.active,
  };
};

const createUserVtexCampaign = async (
  userOrganizationServiceId: string,
  vtexSecrests: {
    organizationId: string;
    storeName: string;
    vtexKey: string;
    vtexToken: string;
    status: boolean;
  },
  trx: Transaction
) => {
  if (process.env.NODE_ENV === "test") return true;

  const name = `plugone_${userOrganizationServiceId}`;

  const campaignInput = {
    beginDateUtc: moment().toISOString(),
    endDateUtc: "2200-07-01T00:00:00Z",
    id: "8099fd94-72ff-4802-8017-4e3367eb32e7",
    name: name,
    isActive: true,
    isArchived: false,
    targetConfigurations: [
      {
        featured: false,
        id: "8099fd94-72ff-4802-8017-4e3367eb32e7",
        name: name,
        daysAgoOfPurchases: 0,
        origin: "Marketplace",
        idSellerIsInclusive: false,
        idsSalesChannel: [],
        areSalesChannelIdsExclusive: false,
        marketingTags: [],
        marketingTagsAreNotInclusive: false,
        paymentsMethods: [],
        stores: [],
        campaigns: [],
        storesAreInclusive: false,
        categories: [],
        categoriesAreInclusive: true,
        brands: [],
        brandsAreInclusive: true,
        products: [],
        productsAreInclusive: false,
        skus: [],
        skusAreInclusive: true,
        utmSource: "plugone",
        utmCampaign: userOrganizationServiceId,
        collections1BuyTogether: [],
        collections2BuyTogether: [],
        idTypeDiscountBuyTogether: "2",
        minimumQuantityBuyTogether: 1,
        quantityToAffectBuyTogether: 0,
        enableBuyTogetherPerSku: false,
        listSku1BuyTogether: [],
        listSku2BuyTogether: [],
        listBrand1BuyTogether: [],
        listCategory1BuyTogether: [],
        coupon: [],
        totalValueFloor: 0.0,
        totalValueCeling: 0.0,
        totalValueIncludeAllItems: false,
        totalValueMode: "IncludeMatchedItems",
        collections: [],
        collectionsIsInclusive: true,
        restrictionsBins: [],
        cardIssuers: [],
        totalValuePurchase: 0.0,
        slasIds: [],
        isSlaSelected: false,
        isFirstBuy: false,
        firstBuyIsProfileOptimistic: false,
        compareListPriceAndPrice: false,
        isDifferentListPriceAndPrice: false,
        zipCodeRanges: [
          {
            inclusive: true,
          },
        ],
        itemMaxPrice: 0.0,
        itemMinPrice: 0.0,
        installment: 0,
        isMinMaxInstallments: false,
        minInstallment: 0,
        maxInstallment: 0,
        merchants: [],
        clusterExpressions: [],
        clusterOperator: "all",
        paymentsRules: [],
        giftListTypes: [],
        productsSpecifications: [],
        affiliates: [],
        maxUsage: 0,
        maxUsagePerClient: 0,
        multipleUsePerClient: false,
      },
    ],
  };

  const { data, status }: { data: IVtexCampaign; status: number } = await axios(
    {
      method: "post",
      url: buildCreateCampaignVtexUrl(vtexSecrests.storeName),
      data: JSON.stringify(campaignInput),
      headers: {
        "x-vtex-api-appkey": vtexSecrests.vtexKey,
        "x-vtex-api-apptoken": vtexSecrests.vtexToken,
        "Content-Type": "application/json; charset=utf-8",
      },
    }
  );

  if (status !== 200) {
    await (trx || knexDatabase)("organization_vtex_secrets")
      .where("store_name", vtexSecrests.storeName)
      .update({ status: false });
    throw new Error(
      "Fail attach affiliate on vtex campaign view your vtex secrets!"
    );
  }

  const attachedVtexSecrets = await (trx || knexDatabase)(
    "affiliate_vtex_campaign"
  )
    .insert({
      vtex_campaign_id: data.id,
      vtex_campaign_target_configuration_id: data.targetConfigurations[0].id,
      users_organization_service_roles_id: userOrganizationServiceId,
    })
    .returning("*");

  return attachedVtexSecrets;
};

const getVtexDepartments = async (
  getVtexDepartmentsPayload: { organizationId: string },
  userToken: IUserToken,
  trx: Transaction
) => {
  if (process.env.NODE_ENV === "test") return mockVtexDepartments;

  if (!userToken) throw new Error("Token must be provided");

  const { organizationId } = getVtexDepartmentsPayload;

  const storeSecrets = await getSecretsByOrganizationId(organizationId, trx);

  if (!storeSecrets) throw new Error("Store integrations doesnt exists.");

  const response = await axios.get(
    buildGetCategoriesThreeVtexUrl(storeSecrets?.storeName),
    {
      headers: {
        "content-type": "Content-Type",
      },
    }
  );

  return response.data;
};

const getVtexDepartmentsCommissions = async (
  context: { organizationId: string; client: IUserToken },
  trx: Transaction
) => {
  if (!context.client) throw new Error("Token must be provided");

  const vtexDepartments = await getVtexDepartments(
    { organizationId: context.organizationId },
    context.client,
    trx
  );

  const commissionsDepartmentsRegistered = await getComissionsDepartmentsByOrganizationId(
    context.organizationId,
    trx
  );

  const comissionsAttacheds = vtexDepartments.map(
    (item: { id: number; name: string; url: string }) => {
      const comissionFound = commissionsDepartmentsRegistered.filter(
        (comissionDepartment) =>
          Number(comissionDepartment.vtexDepartmentId) === item.id
      );

      return {
        id: item.id,
        name: item.name,
        url: item.url,
        active: comissionFound.length ? comissionFound[0].active : false,
        percentage: comissionFound.length
          ? comissionFound[0].vtexCommissionPercentage
          : null,
      };
    }
  );

  return comissionsAttacheds;
};

const getComissionsDepartmentsByOrganizationId = async (
  organizationId: string,
  trx: Transaction
) => {
  const vtexComissions = await (trx || knexDatabase)(
    "organization_vtex_comission"
  )
    .where("organization_id", organizationId)
    .select();

  return vtexComissions.map(vtexCommissionsAdapter);
};

const getComissionsDepartmentsByOrganizationIdAndVtexDepartmentId = async (
  organizationId: string,
  vtexDepartmentsIds: string[],
  trx: Transaction
) => {
  const vtexComissions = await (trx || knexDatabase)(
    "organization_vtex_comission"
  )
    .where("organization_id", organizationId)
    .whereIn("vtex_department_id", vtexDepartmentsIds)
    .andWhere("active", true)
    .select();

  return vtexDepartmentsIds.map((vtexDepartmentId) => {
    let itemFound = vtexComissions.filter((item) => {
      return item.vtex_department_id === vtexDepartmentId;
    });

    return {
      vtexDepartmentId: vtexDepartmentId,
      percentage: itemFound.length
        ? itemFound[0].vtex_commission_percentage
        : null,
    };
  });
};

const handleOrganizationVtexComission = async (
  handleOrganizationVtexComissionPayload: {
    vtexDepartmentId: string;
    vtexCommissionPercentage: number;
    active?: boolean;
  },
  context: { organizationId: string; client: IUserToken },
  trx: Transaction
) => {
  if (!context.client) throw new Error("Token must be provided");

  const {
    vtexDepartmentId,
    vtexCommissionPercentage,
    active,
  } = handleOrganizationVtexComissionPayload;

  const [organizationVtexCommissionFound] = await (trx || knexDatabase.knex)(
    "organization_vtex_comission"
  )
    .where("organization_id", context.organizationId)
    .andWhere("vtex_department_id", vtexDepartmentId)
    .select("id", "active");

  if (!organizationVtexCommissionFound) {
    const [organizationVtexCommission] = await (trx || knexDatabase.knex)(
      "organization_vtex_comission"
    )
      .insert({
        organization_id: context.organizationId,
        vtex_department_id: vtexDepartmentId,
        vtex_commission_percentage: vtexCommissionPercentage,
        active: active ?? true,
      })
      .returning("*");

    return vtexCommissionsAdapter(organizationVtexCommission);
  }

  const [organizationVtexCommissionUpdated] = await (trx || knexDatabase.knex)(
    "organization_vtex_comission"
  )
    .update({
      organization_id: context.organizationId,
      vtex_department_id: vtexDepartmentId,
      vtex_commission_percentage: vtexCommissionPercentage,
      active: active ?? organizationVtexCommissionFound.active,
    })
    .where("id", organizationVtexCommissionFound.id)
    .returning("*");

  return vtexCommissionsAdapter(organizationVtexCommissionUpdated);
};

const getVtexCommissionInfosByAffiliateIdAndDepartmentId = async (
  vtexComissionsByAffiliateIdAndDepartmentIdPayload: {
    vtexDepartmentsIds: string[];
    affiliateId: string;
  },
  trx: Transaction
) => {
  const {
    vtexDepartmentsIds,
    affiliateId,
  } = vtexComissionsByAffiliateIdAndDepartmentIdPayload;

  const userOrganizationService = await ServicesService.getOrganizationIdByUserOrganizationServiceRoleId(
    affiliateId,
    trx
  );

  if (!userOrganizationService)
    throw new Error(MESSAGE_ERROR_USER_NOT_EXISTS_IN_ORGANIZATION_SERIVCE);

  const vtexCommissionPayDay = await AffiliateService.getTimeToPayCommissionById(
    { organizationId: userOrganizationService.organizationId },
    trx
  );

  const vtexCommission = await getComissionsDepartmentsByOrganizationIdAndVtexDepartmentId(
    userOrganizationService.organizationId,
    vtexDepartmentsIds,
    trx
  );

  if (vtexCommission.find((item) => item.percentage === null)) {
    const defaultCommission = await AffiliateService.getDefaultCommissionByOrganizationServiceId(
      userOrganizationService.organizationServiceId,
      trx
    );
    return vtexCommission.map((item) => ({
      ...item,
      percentage: item.percentage
        ? item.percentage
        : defaultCommission?.percentage ?? null,
      payDay: vtexCommissionPayDay?.days ?? null,
    }));
  } else {
    return vtexCommission.map((item) => ({
      ...item,
      payDay: vtexCommissionPayDay?.days ?? null,
    }));
  }
};

export default {
  getSecretsByOrganizationId,
  createUserVtexCampaign,
  getVtexCommissionInfosByAffiliateIdAndDepartmentId,
  getVtexDepartments,
  getVtexDepartmentsCommissions,
  handleOrganizationVtexComission,
  createVtexHook,
  verifyVtexSecrets,
};
