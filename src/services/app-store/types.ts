export type AffiliateStoreAppConfig = {
  name: string
  displayName: string
  exampleValue?: string
  type?: "Date" | "string" | "number" | "bool"
  required?: boolean;
}

export type OrganizationAffiliateStoreAppConfig = {
  key: string
  value: string
}

export type OrganizationAffiliateStoreAppRequirement = {
  id: string
  value: string
  required?: boolean
  active?: boolean
}

export type OrganizationAffiliateStoreApps = {
  affiliateStoreApp: string
  organizationId: string
  configs: OrganizationAffiliateStoreAppConfig[]
  requirements: OrganizationAffiliateStoreAppRequirement[]
}

export type InstalledAffiliateStoreApp = {
  id: any;
  affiliateStoreApp: string;
  configs: OrganizationAffiliateStoreAppConfig[];
  requirements: OrganizationAffiliateStoreAppRequirement[];
  active?: boolean;
}

export interface IAffiliateStoreApp {
  name: string
  shortDescription: string
  description: string
  tags?: string[]
  mainImage: string
  images?: string[]
  authorName: string
  authorLogo?: string
  authorUrl?: string
  configs: AffiliateStoreAppConfig[]
  plans: string[]
}