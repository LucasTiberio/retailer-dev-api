import { Transaction } from 'knex'
import { IPlugFormDataInput, IEditPlugFormInput, IUploadInvoiceInput,IGetInvoiceInput, IGetInvoicesInput } from './types'
import AppStoreService from '../app-store/service'
import StorageService from '../storage/service'
import { getInvoicesPath } from '../../utils/get-path'
import PlugFormRepository from './repositories/plug-form-repository'
import HublyInvoiceRepository from './repositories/hubly-invoice-repository'
import HublyClusterRepository from './repositories/hubly-cluster-repository'
import moment from 'moment'
import { cacheManager } from '../../utils/cache'

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
  const { id, month, year, data, mimeType } = input
  const path = getInvoicesPath({
    month,
    year,
    organizationId: ctx.organizationId,
    userId: ctx.userId,
    mimeType
  })
  const stream = (await data).createReadStream()
  const { url, ...rest } = await StorageService.uploadImage(path, stream, mimeType, trx)

  if (!input.id) {
    return HublyInvoiceRepository.storeInvoice({ month, url, year }, ctx )
  }

  return HublyInvoiceRepository.updateInvoice({ id, month, url, year })
}

export const getInvoice = async(input: IGetInvoiceInput, ctx: { userId: string; organizationId: string }) => {
  return HublyInvoiceRepository.getInvoice(input, ctx)
}

export const getInvoices = async(input: IGetInvoicesInput, ctx: { userId: string; organizationId: string }) => {
  return HublyInvoiceRepository.getInvoices(input, ctx)
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

const getInvoiceDayFromCache = async (organizationId: string) => {
  const data = await cacheManager({
    key: `receipt_date_${organizationId}`,
  })

  if (data) return data;
  
  const [installedApp] = await AppStoreService.getInstalledAffiliateStoreApps(organizationId, 'Hubly Invoice')
  const [{ value: receiptDay }] = installedApp.configs

  return cacheManager({
    key: `receipt_date_${organizationId}`,
    data: {
      receiptDay,
      isAppActive: installedApp.active
    },
    shouldCacheIfEmpty: true
  })
}

export const getMemberInvoice = async (ctx: { userId: string, organizationId: string }) => {
  const data = await getInvoiceDayFromCache(ctx.organizationId) as {
    receiptDay?: string,
    isAppActive: boolean
  }
  
  if (data.isAppActive) {
    const today = moment();
    const day = today.format('DD')
    const month = today.subtract('1', 'month').format('MM')
    const year = today.format('yyyy')
    const { receiptDay } = data

    const response = await HublyInvoiceRepository.getInvoice({
      month,
      year,
    }, ctx)

    return {
      url: response?.url,
      isLastDay: receiptDay ? receiptDay === day : false,
      isFirstDay: day === today.startOf('month').format('DD'),
      receiptDay: receiptDay ? receiptDay : null
    }
  }

  return null
}

export const changeDefaultCluster = async (input: { cluster: string }, ctx: { organizationId: string }) => {
  await cacheManager({
    key: `default_cluster_${ctx.organizationId}`,
    data: input.cluster,
    replace: true,
    shouldCacheIfEmpty: true
  })

  return true
}

const getDefaultCluster = async (ctx: { organizationId: string }) => {
  const key = `default_cluster_${ctx.organizationId}`

  const defaultCluster = await cacheManager({
    key,
  })

  if (defaultCluster) return defaultCluster

  const [installedApp] = await AppStoreService.getInstalledAffiliateStoreApps(ctx.organizationId, 'Hubly Cluster')

  if (!installedApp || !installedApp.active) return null

  const requirement = installedApp.requirements.find(requirement => {
    return requirement.additionalFields ? JSON.parse(requirement.additionalFields)?.isDefault : false
  })

  await cacheManager({
    key,
    data: requirement?.value,
    shouldCacheIfEmpty: true
  })

  return requirement?.value;
}

export const getUserCluster = async (input: { affiliateId: string,  }, ctx: { organizationId: string }) => {
  const defaultCluster = await getDefaultCluster(ctx)

  if (!defaultCluster) return null;
  
  const cluster = await HublyClusterRepository.getClusterByUserId(input, ctx)

  if (cluster) {
    return {
      ...cluster,
      name: cluster?.name || defaultCluster
    }
  }

  return {
    ...input,
    ...ctx,
    name: defaultCluster,
  }
}

export const updateUserCluster = async (input: { affiliateId: string, cluster: string  }[], ctx: { organizationId: string }) => {
  const defaultCluster = await getDefaultCluster(ctx);

  for (const clusterData of input) {
    const data = {
      ...clusterData,
      cluster: clusterData.cluster === defaultCluster ? '' : clusterData.cluster
    }
    const payload = await HublyClusterRepository.updateUserCluster(data, ctx)

    if (!payload) await HublyClusterRepository.saveUserInCluster(data, ctx)
  }

  return true
}

export default {
  savePlugFormFields,
  getPlugFormFields,
  editPlugForm,

  hasFilledFields,
  hasInvoicePending,

  uploadInvoice,
  getInvoice,
  getInvoices,
  receiveInvoice,
  getMemberInvoice,

  changeDefaultCluster,
  updateUserCluster,
  getUserCluster
}
