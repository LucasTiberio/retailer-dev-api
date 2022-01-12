import { IWebhookSubscriptions} from './types'
import Axios from 'axios'
import { webhooUrlCantBeVerified } from '../../common/errors'
import WebhookSubscriptionRepository from './repository'
import { HUBLY_WEBHOOK_HEADER } from '../../common/consts'

const getAvailableWebhooks = async () => {
  return WebhookSubscriptionRepository.getAvailableWebhooks()
}

const getAllWebhookSubscriptions = async (
  input: { organizationId: string }
) => {
  return WebhookSubscriptionRepository.getAllSubscriptions(input)
}

const getAllExecutions = async (input: { offset: number, limit: number }, ctx: { organizationId: string }) => {
  return WebhookSubscriptionRepository.getAllExecutions(input, ctx)
}

const subscribe = async (
  input: IWebhookSubscriptions
) => {
  try {
    await Axios.post(input.url, { "ping": "pong" }, {
      headers: {
        'Content-Type': 'application/json',
        [HUBLY_WEBHOOK_HEADER]: input.apiKey
      },
    })

    return WebhookSubscriptionRepository.createSubscription(input)
  } catch (e) {
    console.log(e.message, e?.response?.data)
    throw new Error(webhooUrlCantBeVerified)
  }
}

const updateSubscription = async (
  input: IWebhookSubscriptions
) => {
  try {
    await Axios.post(input.url, { "ping": "pong" }, {
      headers: { 
        'Content-Type': 'application/json',
        [HUBLY_WEBHOOK_HEADER]: input.apiKey
      },
    })
    
    const payload = await WebhookSubscriptionRepository.updateSubscription(input)
    
    if (payload) return true
  
    return false
  } catch(e) {
    throw new Error(webhooUrlCantBeVerified)
  }
}

const triggerManualSend = async (
  input: { executionId: string }
) => {
  return WebhookSubscriptionRepository.triggerManualSend(input)
}

export default {
  getAvailableWebhooks,
  getAllWebhookSubscriptions,
  getAllExecutions,
  subscribe,
  updateSubscription,
  triggerManualSend
}
