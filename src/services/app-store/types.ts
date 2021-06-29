export type AffiliateStoreAppConfig = {
  name: string
  displayName: string
  exampleValue?: string
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
