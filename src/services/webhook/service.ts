import { IWebhookSubscriptions} from './types'
import Axios from 'axios'
import { webhooUrlCantBeVerified } from '../../common/errors'
import WebhookSubscriptionRepository from './repository'

const getAvailableWebhooks = async () => {
  return WebhookSubscriptionRepository.getAvailableWebhooks()
}

const getAllWebhookSubscriptions = async (
  input: { organizationId: string }
) => {
  return WebhookSubscriptionRepository.getAllSubscriptions(input)
}

const subscribe = async (
  input: IWebhookSubscriptions
) => {
  try {
    await Axios.post(input.url, { "ping": "pong" }, {
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
    })
    
    const payload = await WebhookSubscriptionRepository.updateSubscription(input)
    
    if (payload) return true
  
    return false
  } catch(e) {
    throw new Error(webhooUrlCantBeVerified)
  }
}

export default {
  getAvailableWebhooks,
  getAllWebhookSubscriptions,
  subscribe,
  updateSubscription
}
