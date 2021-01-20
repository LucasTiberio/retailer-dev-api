export interface IAffiliateStore {
  id: string
  users_organization_service_roles_id: string
  avatar: string
  cover: string
  slug: string
  name: string
  description: string
  facebook: string
  youtube: string
  twitter: string
  tiktok: string
  instagram: string
  created_at: Date
  updated_at: Date
}

export interface IAffiliateProductStore {
  id: string
  affiliate_store_id: string
  product_id: string
  name: string
  image: string
  active: boolean
  searchable: boolean
  created_at: Date
  updated_at: Date
  order: number
}

export interface IOrganizationAffiliateStore {
  id: string
  active: boolean
  script_url: string
  organization_id: string
  shelf_id: string
  created_at: Date
  updated_at: Date
  allow_slug_edit: Boolean
}
export interface IOrganizationAffiliateStoreBanner {
  id: string
  url: boolean
  organization_affiliate_store_id: string
  created_at: Date
  updated_at: Date
}

export interface IAffiliateStoreAdapted {
  id: string
  usersOrganizationServiceRolesId: string
  avatar: string
  cover: string
  name: string
  description: string
  facebook: string
  youtube: string
  twitter: string
  tiktok: string
  instagram: string
  createdAt: Date
  updatedAt: Date
}

export interface ICreateAffiliateStore {
  avatar?: any
  avatarUrl?: string
  cover?: any
  name?: string
  description?: string
  facebook?: string
  youtube?: string
  twitter?: string
  tiktok?: string
  instagram?: string
}

export interface ICreateAffiliateStoreProduct {
  productId: string
}

export interface IAvatar {
  mimetype: string
  data: any
}
