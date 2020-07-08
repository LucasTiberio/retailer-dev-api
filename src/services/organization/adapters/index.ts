import { IOrganizationFromDB, IUserOrganizationAdaptedFromDB, IUserOrganizationRolesFromDB } from "../types";

export const _organizationAdapter = (record: IOrganizationFromDB) => ({
    id: record.id,
    name: record.name,
    contactEmail: record.contact_email,
    slug: record.slug,
    userId: record.user_id,
    active: record.active,
    freeTrial: record.free_trial,
    freeTrialExpires: record.free_trial_expires,
    phone: record.phone,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    userOrganizationId: record.users_organizations_id,
    logo: record.logo ? `${record.logo}?${+new Date()} ` : null
  });
  
  export const _organizationRoleAdapter = (record: IOrganizationFromDB) => ({
    id: record.id,
    name: record.name,
    updatedAt: record.updated_at,
    createdAt: record.created_at
  })
  
  export const _usersOrganizationsAdapter = (record: IUserOrganizationAdaptedFromDB) => ({
      id: record.id,
      userId: record.user_id,
      organizationId: record.organization_id,
      inviteStatus: record.invite_status,
      inviteHash: record.invite_hash,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      active: record.active,
      organizationRoleId: record.organization_role_id
  })
  
  export const _usersOrganizationsRolesAdapter = (record: IUserOrganizationRolesFromDB) => ({
    id: record.id,
    userOrganizationId: record.users_organization_id,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    organizationRoleId: record.organization_role_id
  })