import { IDocumentType } from "../users/types";

export enum PlugOneAffiliateStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Reproved = 'Reproved',
}

export enum PlugoneSaasCommissionStatus {
  approved = 'approved',
  pendent = 'pendent',
  reproved = 'reproved',
}

export interface IGetAffiliatesFilter {
  documentType?: IDocumentType
  document?: string
}

export interface IAffiliate {
  organization_id: string
  affiliate_id: string
  username: string
  email: string
  document: string
  phone: string
  utm: string
}