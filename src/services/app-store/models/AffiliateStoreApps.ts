import mongoose, { Schema, Document, Types } from 'mongoose'
import { AffiliateStoreAppConfig } from '../types'

interface IAffiliateStoreApps extends Document {
  name: string
  shortDescription: string
  description: string
  tags?: string[]
  mainImage: string
  images?: string[]
  authorName: string
  authorLogo?: string
  authorUrl?: string
  configs: AffiliateStoreAppConfig[]
  plans: string[]
}

const AffiliateStoreApps = new Schema<IAffiliateStoreApps>({
  name: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
  },
  mainImage: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
  },
  authorName: {
    type: String,
    required: true,
  },
  authorLogo: {
    type: String,
  },
  authorUrl: {
    type: String,
  },
  configs: {
    type: [Object],
    default: [],
    required: true,
  },
  plans: {
    type: [String],
    default: [],
    required: true,
  },
})

export default mongoose.model<IAffiliateStoreApps>('AffiliateStoreApps', AffiliateStoreApps, 'AffiliateStoreApps')
