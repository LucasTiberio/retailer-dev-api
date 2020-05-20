import { ISimpleUser } from "../users/types";

export interface IOrganizationPayload{
    name: string
    contactEmail: string
}

export interface IOrganizationAdapted extends IOrganizationPayload{
    id: string
    userId: string
    active: boolean
    updatedAt: Date
    createdAt: Date
}

export interface IOrganizationFromDB{
    id: string
    name: string
    contact_email: string
    user_id: string
    active: boolean
    updated_at: Date
    created_at: Date
}

export enum OrganizationRoles {
    ADMIN = 'ADMIN',
    MEMBER = 'MEMBER'
}

export enum OrganizationInviteStatus {
    REFUSED = 'refused',
    PENDENT = 'pendent',
    ACCEPT = 'accept'
}

export interface IOrganizationRoleResponse {
    name: string
}

export interface IInviteUserToOrganizationPayload {
    organizationId: string
    users: IInviteUserToOrganizationData[]
}

export interface IOrganizationSimple{
    id: string
    name: string
}

export interface IInviteUserToOrganizationData{
    id?: string
    email: string
}

export interface IResponseInvitePayload{
    inviteHash: string,
    response: OrganizationInviteStatus
}

export interface IFindUsersAttributes{
    name: string
    organizationId: string
}

export interface IUserOrganizationDB extends ISimpleUser{
    invite_status?: string
    users_organizations_id?: string
}

export interface IUserOrganizationAdaptedFromDB{
    id: string
    user_id: string
    organization_id: string
    invite_status: OrganizationInviteStatus
    invite_hash?: string
    created_at: Date
    updated_at: Date
    active: boolean
    organization_role_id?: string
}

export interface IUserOrganizationAdapted{
    id: string
    userId: string
    organizationId: string
    inviteStatus: OrganizationInviteStatus
    inviteHash?: string
    createdAt: Date
    updatedAt: Date
}