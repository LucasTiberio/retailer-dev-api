export enum InviteStatus {
  accept = 'accept',
  pendent = 'pendent',
  refused = 'refused',
  exited = 'exited',
}

export enum ResponseStatus {
  accept = 'accept',
  refused = 'refused',
}

export type UserOrganizationAdaptedFromDB = {
  id: string
  user_id: string
  organization_id: string
  invite_status: InviteStatus
  invite_hash: string
  created_at: string
  updated_at: string
  active: boolean
  is_requested: boolean
}
