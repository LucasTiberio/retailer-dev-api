export interface IWebhookSubscriptions {
  created: Date,
  updated: Date,
  organizationId: string
  description?: string,
  enabledTopics: string[]
  status: HookSubscriptionStatus,
  url: string
}

export type HookSubscriptionStatus = "enabled" | "disabled"

export type Hooks = 'orders'