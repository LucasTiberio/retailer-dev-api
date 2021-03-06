import { ISimpleUser } from '../users/types'
import { ISimpleService } from '../services/types'
import { Integrations } from '../integration/types'

export interface IOrganizationPayload {
  organization: {
    name: string
    contactEmail: string
    phone: string
    document: string
    address: {
      cep: string
      address: string
      number: string
      complement?: string
      neighbourhood: string
      city: string
      state: string
    }
  }
  integration?: {
    secrets: any
    type: Integrations
  }
  additionalInfos: IOrganizationAdittionalInfos
  teammates: {
    emails: string[]
  }
}

export interface IOrganizationAdittionalInfos {
  segment: string
  resellersEstimate: number
  reason: string
  plataform: string
}

export interface IOrganizationAdapted {
  id: string
  userId: string
  active: boolean
  phone: string
  updatedAt: Date
  createdAt: Date
}

export interface IOrganizationFromDB {
  id: string
  name: string
  contact_email: string
  free_trial: boolean
  free_trial_expires?: Date
  phone: string
  user_id: string
  domain: string
  active: boolean
  slug: string
  updated_at: Date
  created_at: Date
  users_organizations_id: string
  logo?: string
  api_key?: string
  public: boolean
  show_gamification: boolean
}

export interface IOrganizationRoleFromDb {
  id: string
  name: string
  updated_at: Date
  created_at: Date
}

export enum OrganizationRoles {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum OrganizationInviteStatus {
  REFUSED = 'refused',
  PENDENT = 'pendent',
  ACCEPT = 'accept',
}

export interface IOrganizationRoleResponse {
  name: string
}

export interface IInviteUserToOrganizationPayload {
  users: IInviteUserToOrganizationData[]
}

export interface IOrganizationSimple {
  id: string
  name: string
}

export interface IInviteUserToOrganizationData {
  email: string
  role?: OrganizationRoles
  services?: ISimpleService[]
}

export interface IResponseInvitePayload {
  inviteHash: string
  response: OrganizationInviteStatus
}

export interface IFindUsersAttributes {
  name: string
}

export interface IUserOrganizationDB extends ISimpleUser {
  invite_status?: string
  users_organizations_id?: string
}

export interface IUserOrganizationAdaptedFromDB {
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

export interface IUserOrganizationRolesFromDB {
  id: string
  users_organization_id: string
  created_at: Date
  updated_at: Date
  organization_role_id: string
}

export interface IUserOrganizationAdapted {
  id: string
  userId: string
  organizationId: string
  inviteStatus: OrganizationInviteStatus
  inviteHash?: string
  createdAt: Date
  updatedAt: Date
}
