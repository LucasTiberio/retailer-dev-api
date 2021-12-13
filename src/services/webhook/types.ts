export interface IWebhookSubscriptions {
  created: Date,
  updated: Date,
  apiKey: string,
  organizationId: string
  description?: string,
  enabledTopics: string[]
  status: HookSubscriptionStatus,
  url: string
}

export type HookSubscriptionStatus = "enabled" | "disabled"

export type Hooks = 'orders'