import { ServiceRoles } from "../services/types";

export interface IPermissionFromDB {
    id: string
    permission_name: ServicePermissionName
    service_role_name: ServiceRoles
    grant: PermissionGrant
    service_id: string
}

export enum ServicePermissionName{
    commission = 'commission',
    orders = 'orders',
    generateLink = 'generateLink'
}

export enum PermissionGrant{
    write = 'write',
    read = 'read',
    hide = 'hide'
}