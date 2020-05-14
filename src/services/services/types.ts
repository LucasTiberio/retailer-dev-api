export enum Services {
    AFFILIATE = 'affiliate'
}

export interface IServiceAdaptedFromDB {
    id: string
    name: string
    active: boolean
    updated_at: Date
    created_at: Date
}

export interface IServiceAdapted {
    id: string
    name: string
    active: boolean
    updatedAt: Date
    createdAt: Date
}

export interface ICreateServiceInOrganization{
    input: ICreateServiceInOrganizationInput
}

interface ICreateServiceInOrganizationInput{
    serviceId: string
    organizationId: string
}