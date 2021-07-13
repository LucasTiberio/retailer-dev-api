import PlugFormRepository from './repositories/plug-form-repository'
import AppStoreService from '../app-store/service'
import { IPlugFormDataInput, IEditPlugFormInput } from './types'

export const savePlugFormFields = (input: IPlugFormDataInput, ctx: { userId: string; organizationId: string }) => {
  return PlugFormRepository.savePlugFormFields(input, ctx)
}

export const getPlugFormFields = (ctx: { userId: string; organizationId: string }) => {
  return PlugFormRepository.getPlugFormFields(ctx)
}

export const editPlugForm = (input: IEditPlugFormInput) => {
  return PlugFormRepository.editPlugForm(input)
}

export const hasFilledFields = async (ctx: { userId: string; organizationId: string }): Promise<boolean | null> => {
  const form = await PlugFormRepository.getPlugFormFields(ctx)
  const apps = await AppStoreService.getInstalledAffiliateStoreApps(ctx.organizationId)
  const plugForm = apps.find((app) => String(app.affiliateStoreApp) === '60d2193024d3230e2bdd7a5f')

  if (plugForm?.requirements?.length) {
    const fieldsValid = (form?.fields ?? []).filter((field) => !!field.value)

    return fieldsValid.length === plugForm?.requirements?.length
  }

  return null
}

export default {
  savePlugFormFields,
  getPlugFormFields,
  editPlugForm,
  hasFilledFields,
}
