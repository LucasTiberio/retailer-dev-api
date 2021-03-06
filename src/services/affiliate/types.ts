export interface IUsersOrganizationServiceRolesUrlShortenerFromDB {
  id: string
  users_organization_service_roles_id: string
  url_shorten_id: string
  created_at: Date
  updated_at: Date
}

export enum OrganizationCommissionIdentifiers {
  Affiliate = 'affiliate',
  Product = 'product',
  Seller = 'seller',
  Category = 'category',
  Department = 'department',
}

export interface IOrganizationCommission {
  id: string
  organization_id: string
  identifier_id: string
  identifier: string
  name: string
  active: boolean
  type: string
  commission_percentage: number
  created_at: Date
  updated_at: Date
}

export enum IVtexStatus {
  approved = 'approved',
  canceled = 'canceled',
  reproved = 'reproved',
}

export interface ITimeToPayCommissionFromDB {
  id: string
  days: string
  type: string
  organization_service_id: string
  created_at: Date
  updated_at: Date
}
export interface IDefaultPayCommissionFromDB {
  id: string
  percentage: number
  organization_service_id: string
  created_at: Date
  updated_at: Date
}
