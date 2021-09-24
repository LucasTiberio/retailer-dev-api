export interface IWebhookSubscriptions {
  type: Hooks,
  created: Date,
  organizationId: string
  description: string,
  enabledTopics: string[]
  status: HookSubscriptionStatus,
  url: string
}

export type Hooks = 'orders'

export type HookSubscriptionStatus = "enabled" | "disabled"