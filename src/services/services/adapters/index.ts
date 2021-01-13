import { IServiceAdaptedFromDB, IServiceRolesDB, IUsersOrganizationServiceDB } from "../types";

export const _serviceAdapter = (record: IServiceAdaptedFromDB) => {
    return {
    id: record.id,
    name: record.name,
    active: record.active,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    hasOrganization: !!record.has_organization,
    serviceRolesId: record.service_roles_id
  }};
  
  export const _serviceRolesAdapter = (record: IServiceRolesDB) => ({
    id: record.id,
    name: record.name,
    createdAt: record.created_at,
    updatedAt: record.updated_at
  });
  
  export const _usersOrganizationServiceAdapter = (record : IUsersOrganizationServiceDB) => ({
    id: record.id,
    serviceRolesId: record.service_roles_id,
    usersOrganizationId: record.users_organization_id,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    active: record.active,
    bankDataId: record.bank_data_id
  })
  
  export const _usersOrganizationServiceAdapterWithSlug = (record : IUsersOrganizationServiceDB) => ({
    id: record.id,
    serviceRolesId: record.service_roles_id,
    usersOrganizationId: record.users_organization_id,
    slug: record.slug,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    active: record.active,
    bankDataId: record.bank_data_id
  })