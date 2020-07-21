export interface IVtexIntegrationFromDB {
  id: string;
  organization_id: string;
  store_name: string;
  vtex_key: string;
  vtex_token: string;
  status: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IVtexSecrets {
  xVtexApiAppKey: string;
  xVtexApiAppToken: string;
  accountName: string;
}

export interface IVtexCommissionFromDB {
  id: string;
  organization_id: string;
  vtex_department_id: string;
  active: boolean;
  vtex_commission_percentage: number;
  created_at: Date;
  updated_at: Date;
}

export interface IVtexIntegrationAdapted {
  id: string;
  organizationId: string;
  storeName: string;
  vtexKey: string;
  vtexToken: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVtexCampaign {
  beginDateUtc: string;
  endDateUtc: string;
  id: string;
  name: string;
  isActive: boolean;
  isArchived: boolean;
  targetConfigurations: ITargetConfiguration[];
}

interface ITargetConfiguration {
  featured: boolean;
  id: string;
  name: string;
  daysAgoOfPurchases: number;
  origin: string;
  idSellerIsInclusive: boolean;
  idsSalesChannel: any[];
  areSalesChannelIdsExclusive: boolean;
  marketingTags: any[];
  marketingTagsAreNotInclusive: boolean;
  paymentsMethods: any[];
  stores: any[];
  campaigns: any[];
  storesAreInclusive: boolean;
  categories: any[];
  categoriesAreInclusive: boolean;
  brands: any[];
  brandsAreInclusive: boolean;
  products: any[];
  productsAreInclusive: boolean;
  skus: any[];
  skusAreInclusive: boolean;
  utmSource: string;
  utmCampaign: string;
  collections1BuyTogether: any[];
  collections2BuyTogether: any[];
  idTypeDiscountBuyTogether: number;
  minimumQuantityBuyTogether: number;
  quantityToAffectBuyTogether: number;
  enableBuyTogetherPerSku: boolean;
  listSku1BuyTogether: any[];
  listSku2BuyTogether: any[];
  listBrand1BuyTogether: any[];
  listCategory1BuyTogether: any[];
  coupon: any[];
  totalValueFloor: number;
  totalValueCeling: number;
  totalValueIncludeAllItems: boolean;
  totalValueMode: string;
  collections: any[];
  collectionsIsInclusive: boolean;
  restrictionsBins: any[];
  cardIssuers: any[];
  totalValuePurchase: number;
  slasIds: any[];
  isSlaSelected: boolean;
  isFirstBuy: boolean;
  firstBuyIsProfileOptimistic: boolean;
  compareListPriceAndPrice: boolean;
  isDifferentListPriceAndPrice: boolean;
  zipCodeRanges: IZipCodeRanges;
  itemMaxPrice: number;
  itemMinPrice: number;
  installment: number;
  isMinMaxInstallments: boolean;
  minInstallment: number;
  maxInstallment: number;
  merchants: any[];
  clusterExpressions: any[];
  clusterOperator: string;
  paymentsRules: any[];
  giftListTypes: any[];
  productsSpecifications: any[];
  affiliates: any[];
  maxUsage: number;
  maxUsagePerClient: number;
  multipleUsePerClient: boolean;
}

interface IZipCodeRanges {
  inclusive: boolean;
}

export interface IVtexCategoryThree {
  id: number;
  name: string;
  hasChildren: boolean;
  url: string;
  children: any;
  Title: string;
  MetaTagDescription: string;
}
