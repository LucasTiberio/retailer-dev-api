import mongoose, { Schema, Document, Types } from 'mongoose'
import { IAffiliateStoreApp } from '../types'

interface IAffiliateStoreAppsDocument extends IAffiliateStoreApp, Document {}

const AffiliateStoreApps = new Schema<IAffiliateStoreAppsDocument>({
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

export default mongoose.model<IAffiliateStoreAppsDocument>('AffiliateStoreApps', AffiliateStoreApps, 'AffiliateStoreApps')
