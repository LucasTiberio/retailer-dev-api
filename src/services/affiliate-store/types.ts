export interface IAffiliateStore {
  id: string
  users_organization_service_roles_id: string
  avatar: string
  cover: string
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
  active: boolean
  searchable: boolean
  created_at: Date
  updated_at: Date
  order: number
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
