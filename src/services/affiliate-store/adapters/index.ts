import { IAffiliateStore, IAffiliateProductStore, IOrganizationAffiliateStore, IOrganizationAffiliateStoreBanner } from '../types'

export const affiliateStoreAdapter = (record: IAffiliateStore) => ({
  id: record.id,
  usersOrganizationServiceRolesId: record.users_organization_service_roles_id,
  avatar: record.avatar,
  cover: record.cover,
  name: record.name,
  description: record.description,
  facebook: record.facebook,
  slug: record.slug,
  youtube: record.youtube,
  twitter: record.twitter,
  tiktok: record.tiktok,
  instagram: record.instagram,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
})

export const affiliateStoreProductAdapter = (record: IAffiliateProductStore) => ({
  id: record.id,
  affiliateStoreId: record.affiliate_store_id,
  active: record.active,
  searchable: record.searchable,
  order: record.order,
  productId: record.product_id,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
})

export const organizationAffiliateStoreAdapter = (record: IOrganizationAffiliateStore) => ({
  id: record.id,
  active: record.active,
  scriptUrl: record.script_url,
  organizationId: record.organization_id,
  shelfId: record.shelf_id,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
})

export const organizationAffiliateStoreBannerAdapter = (record: IOrganizationAffiliateStoreBanner) => ({
  id: record.id,
  url: record.url,
  organizationAffiliateStoreId: record.organization_affiliate_store_id,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
})
