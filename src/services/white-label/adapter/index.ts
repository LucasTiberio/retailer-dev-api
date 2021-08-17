import { IWhiteLabelInfosFromDB } from '../types'

interface IWhiteLabelInfosAdapter extends IWhiteLabelInfosFromDB {
  name: string
  redirect_whitelabel: string
  personalized_terms_and_conditions?: string
}

export const whiteLabelInfosAdapter = (record: IWhiteLabelInfosAdapter) => ({
  primaryColor: record.primary_color,
  organizationId: record.organization_id,
  secondColor: record.second_color,
  tertiaryColor: record.tertiary_color,
  logo: record.logo,
  organizationName: record.name || '',
  customDomain: record.custom_domain || '',
  redirectWhiteLabel: record.redirect_whitelabel,
  personalizedTermsAndConditions: record.personalized_terms_and_conditions || ''
})
