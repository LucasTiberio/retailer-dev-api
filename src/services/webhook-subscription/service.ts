import WebhookSubscriptionsRepository from './repository'
import { Hooks, IWebhookSubscriptions } from './types'

export const findWebhookByHook = async (args: { organizationId: string, webhook: Hooks }): Promise<IWebhookSubscriptions | null> => {
  return WebhookSubscriptionsRepository.getWebhookByHook(args)
}