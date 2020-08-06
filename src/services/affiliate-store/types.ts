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

export interface IAvatar {
  mimetype: string
  data: any
}
