import mongoose, { Schema, Document } from "mongoose";
import { IHublyClusterData } from "../types";

interface IHublyClusterDocument extends Document, IHublyClusterData {}

const HublyClusterData = new Schema<IHublyClusterDocument>({
  organizationId: {
    type: String,
    required: true,
  },
  affiliateId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ""
  },
})

const connection = mongoose.connection.useDb('plugone-apps')

export default connection.model<IHublyClusterDocument>('HublyCluster', HublyClusterData, 'HublyCluster')