export interface IPlugFormData {
  organizationId: string
  userId: string
  user?: {
    username: string
    email: string
    document: string
  }
  fields: {
    label: string
    value: string
  }[]
  installedApp: string
  validated?: boolean
}

export interface IPlugFormDataInput {
  fields: {
    label: string
    value: string
  }[]
  installedApp: string
}

export interface IGetPlugFormInput {
  installedAppId: string
}

export interface IEditPlugFormInput {
  id: string
  fields?: {
    label: string
    value: string
  }[]
  validated?: boolean
}

export interface IUploadInvoiceInput {
  id: string
  data: any;
  month: string;
  mimeType: string;
  year: string
}

export interface IStoreHublyInvoice {
  month: string
  url: string
  year: string;
}

export interface IUpdateHublyInvoice {
  id: string
  month?: string
  url?: string
  year?: string;
  received?: boolean;
}

export interface IHublyInvoiceData {
  organizationId: string
  userId: string
  url: string
  month: string
  year: string
  received?: boolean
}

export interface IGetInvoiceInput {
  month: string
  year: string
}

export interface IGetInvoicesInput {
  month?: string
  year: string
}

export interface IHublyClusterData {
  organizationId: string
  affiliateId: string
  name: string
}