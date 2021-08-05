import { Transaction } from 'knex'
import { IPlugFormDataInput, IEditPlugFormInput, IUploadInvoiceInput, IGetInvoiceInput } from './types'
import AppStoreService from '../app-store/service'
import StorageService from '../storage/service'
import { getInvoicesPath } from '../../utils/get-path'
import PlugFormRepository from './repositories/plug-form-repository'
import HublyInvoiceRepository from './repositories/hubly-invoice-repository'
import moment from 'moment'
import Axios from 'axios'
import { encodeBase64 } from 'bcryptjs'

export const savePlugFormFields = (input: IPlugFormDataInput, ctx: { userId: string; organizationId: string }) => {
  return PlugFormRepository.savePlugFormFields(input, ctx)
}

export const getPlugFormFields = (ctx: { userId: string; organizationId: string }) => {
  return PlugFormRepository.getPlugFormFields(ctx)
}

export const editPlugForm = (input: IEditPlugFormInput) => {
  return PlugFormRepository.editPlugForm(input)
}

export const uploadInvoice = async (input: IUploadInvoiceInput, ctx: { userId: string; organizationId: string }, trx: Transaction) => {
  const { id, month, data, mimeType } = input
  const year = new Date().getFullYear().toString()
  const path = getInvoicesPath({
    month,
    year,
    organizationId: ctx.organizationId,
    userId: ctx.userId,
    mimeType
  })
  const stream = (await data).createReadStream()
  const { url, ...rest } = await StorageService.uploadImage(path, stream, mimeType, trx)

  console.log({url, rest})

  if (!input.id) {
    return HublyInvoiceRepository.storeInvoice({ month, invoice: url, year }, ctx )
  }

  return HublyInvoiceRepository.updateInvoice({ id, month, invoice: url, year })
}

export const getInvoice = async(ctx: { userId: string; organizationId: string }) => {
  const today = moment()
  const month = today.format('MM')
  const year = today.format('yyyy')

  return HublyInvoiceRepository.getInvoice({ month, year }, ctx)
}

export const hasFilledFields = async (ctx: { userId: string; organizationId: string }): Promise<boolean | null> => {
  const form = await PlugFormRepository.getPlugFormFields(ctx)
  const apps = await AppStoreService.getInstalledAffiliateStoreApps(ctx.organizationId)
  const plugForm = apps.find((app) => String(app.affiliateStoreApp) === '60d2193024d3230e2bdd7a5f')

  if (plugForm?.requirements?.length) {
    const fieldsValid = (form?.fields ?? []).filter((field) => !!field.value)
    const onlyActiveAndRequired = plugForm?.requirements.filter(requirement => requirement.active && requirement.required)

    return fieldsValid.length >= onlyActiveAndRequired?.length
  }

  return null
}

export const hasInvoicePending = async (ctx: { userId: string; organizationId: string }) => {
  const today = moment()
  const month = today.format('MM')
  const year = today.format('yyyy')

  const [installedApp] = await AppStoreService.getInstalledAffiliateStoreApps(ctx.organizationId, 'Hubly Invoice')

  if (!installedApp?.active) return null

  const [{ value }] = installedApp.configs
  
  const monthlyInvoice = await HublyInvoiceRepository.getInvoice({
    month,
    year
  }, ctx)

  if (!value ) return !monthlyInvoice

  const receiptDate = moment(`${year}-${month}-${value}`)
  const diff = receiptDate.diff(today, 'days')
  
  if (diff <= 5) return !monthlyInvoice

  return false
}

export const receiveInvoice = async (input: { id: string, received?: boolean }) => {
  return HublyInvoiceRepository.updateInvoice(input)
}

export default {
  savePlugFormFields,
  getPlugFormFields,
  editPlugForm,

  hasFilledFields,
  hasInvoicePending,

  uploadInvoice,
  getInvoice,
  receiveInvoice
}
