import mongoose, { Schema, Document } from "mongoose";
import { IHublyInvoiceData } from "../types";

interface IHublyInvoiceDocument extends Document, IHublyInvoiceData {}

const HublyInvoiceData = new Schema<IHublyInvoiceDocument>({
  organizationId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  month: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  received: {
    type: Boolean,
    default: false
  },
})

const connection = mongoose.connection.useDb('plugone-apps')

export default connection.model<IHublyInvoiceDocument>('HublyInvoice', HublyInvoiceData, 'HublyInvoice')