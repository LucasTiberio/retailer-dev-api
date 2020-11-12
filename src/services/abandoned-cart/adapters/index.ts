import { AbandonedCartFromDB } from '../types'

export const abandonedCartAdapter = (record: AbandonedCartFromDB) => ({
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
})
