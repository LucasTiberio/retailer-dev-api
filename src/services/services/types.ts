export enum Services {
    AFFILIATE = 'affiliate'
}

export enum ServiceRoles {
    ADMIN = 'ADMIN',
    ANALYST = 'ANALYST',
    RESPONSIBLE = 'RESPONSIBLE'
}

export interface IServiceAdaptedFromDB {
    id: string
    name: string
    active: boolean
    updated_at: Date
    created_at: Date
    has_organization: boolean
    service_roles_id: string
}

export interface IServiceAdapted {
    id: string
    name: string
    active: boolean
    updatedAt: Date
    createdAt: Date
    hasOrganization: Boolean
}

export interface ICreateServiceInOrganization{
    input: ICreateServiceInOrganizationInput
}

interface ICreateServiceInOrganizationInput{
    serviceId: string
    organizationId: string
}

export interface IUsersOrganizationServiceDB{
    id: string
    service_roles_id: string
    users_organization_id: string
    created_at: Date
    updated_at: Date
    active: boolean
}

export interface IServiceRolesAdapted{
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
}

export interface IServiceRolesDB{
    id: string
    name: string
    created_at: Date
    updated_at: Date
}

export interface ISimpleOrganizationServicePayload{
    organizationId: string
    serviceName: Services
}

export interface IListAvailableUsersToServicePayload{
    name: string
    serviceName: Services
}