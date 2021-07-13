import mongoose, { Schema, Document, Types } from 'mongoose'
import { IPlugFormData } from '../types'

interface IPlugFormDataDocument extends Document, IPlugFormData {}

const PlugFormData = new Schema<IPlugFormDataDocument>({
  organizationId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  fields: {
    type: Object,
    required: true,
  },
  installedApp: {
    type: Schema.Types.ObjectId,
    ref: 'OrganizationAffiliateStoreApps',
    required: true,
  },
})

const connection = mongoose.connection.useDb('plugone-apps')

export default connection.model<IPlugFormDataDocument>('PlugForm', PlugFormData, 'PlugForm')
