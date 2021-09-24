import mongoose, { Schema, Document } from 'mongoose'
import { IWebhookSubscriptions } from '../types'

interface IWebhookSubscriptionsDocument extends IWebhookSubscriptions, Document {}

const WebhookSubscriptions = new Schema<IWebhookSubscriptionsDocument>({
  description: {
    type: String
  },
  enabledTopics: {
    type: [String],
    required: false,
    default: []
  },
  created: {
    type: Date,
    required: true
  },
  organizationId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
})

export default mongoose.model<IWebhookSubscriptionsDocument>('WebhookSubscriptions', WebhookSubscriptions, 'WebhookSubscriptions')
