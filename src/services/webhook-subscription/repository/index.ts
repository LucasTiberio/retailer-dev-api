import WebhookSubscriptions from "../models/WebhookSubscriptions"
import { Hooks } from "../types"

const getWebhookByHook = async (args: { organizationId: string, webhook: Hooks }) => {
  const payload = await WebhookSubscriptions.findOne({ ...args }).lean()
  
  if (!payload) return null
  if (payload.status === 'enabled') return payload

  return null
}

export default {
  getWebhookByHook
}