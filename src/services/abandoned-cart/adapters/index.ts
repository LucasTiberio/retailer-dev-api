import { checkCartReadOnly, getPreviousCarts } from '../helpers'
import { AbandonedCartFromDB } from '../types'

export const responseAbandonedCartAdapter = async (record: AbandonedCartFromDB): Promise<any> => {
  if (!record._id) return null

  let children = await getPreviousCarts(record._id)
  let readOnly = await checkCartReadOnly(record._id)
  let isChildren = false
  return {
    id: record._id,
    organizationId: record.organizationId,
    orderFormId: record.orderFormId,
    orderId: record.orderId,
    email: record.email,
    phone: record.phone,
    provider: record.provider,
    items: record.items,
    status: record.status,
    lastAssistantAffiliateId: record.lastAssistantAffiliateId,
    lastAssistanceDate: record.lastAssistanceDate,
    currentAssistantAffiliateId: record.currentAssistantAffiliateId,
    observations: record.observations,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    readOnly,
    children,
    isChildren,
    hasChildren: !!children.length,
  }
}

export const abandonedCartAdapter = async (record: AbandonedCartFromDB, isOwner?: boolean): Promise<any> => {
  if (!record._id) {
    return null
  }

  return {
    id: record._id,
    organizationId: record.organizationId,
    orderFormId: record.orderFormId,
    orderId: record.orderId,
    email: record.email,
    phone: record.phone,
    provider: record.provider,
    items: record.items,
    status: record.status,
    lastAssistantAffiliateId: record.lastAssistantAffiliateId,
    lastAssistanceDate: record.lastAssistanceDate,
    observations: record.observations,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    readOnly: await checkCartReadOnly(record._id),
    children: [],
    isOwner,
    isChildren: true,
    hasChildren: false,
  }
}
