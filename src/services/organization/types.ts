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
    ADMIN = 'ADMIN'
}

export interface IOrganizationRoleResponse {
    name: string
}