export interface IUsersOrganizationServiceRolesUrlShortenerFromDB {
  id: string;
  users_organization_service_roles_id: string;
  url_shorten_id: string;
  created_at: Date;
  updated_at: Date;
}

export enum IVtexStatus {
  approved = "approved",
  canceled = "canceled",
  reproved = "reproved",
}

export interface ITimeToPayCommissionFromDB {
  id: string;
  days: string;
  type: string;
  organization_service_id: string;
  created_at: Date;
  updated_at: Date;
}
export interface IDefaultPayCommissionFromDB {
  id: string;
  percentage: number;
  organization_service_id: string;
  created_at: Date;
  updated_at: Date;
}
