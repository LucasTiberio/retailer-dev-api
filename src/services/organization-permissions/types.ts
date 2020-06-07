import { OrganizationRoles } from "../organization/types";

export interface IPermissionFromDB {
    id: string
    permission_name: PermissionName
    organization_role_name: OrganizationRoles
    grant: PermissionGrant
}

export enum PermissionName{
    settings = 'settings',
    members = 'members',
    integrations = 'integrations',
    affiliate = 'affiliate'
}

export enum PermissionGrant{
    write = 'write',
    read = 'read',
    hide = 'hide'
}