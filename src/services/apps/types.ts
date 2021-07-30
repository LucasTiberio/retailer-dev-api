export interface IPlugFormData {
  organizationId: string
  userId: string
  fields: {
    label: string
    value: string
  }[]
  installedApp: string
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
  fields: {
    label: string
    value: string
  }[]
}

export interface IUploadInvoiceInput {
  id: string
  data: any;
  month: string;
  mimeType: string;
}

export interface IStoreHublyInvoice {
  month: string
  invoice: string
  year: string;
}

export interface IUpdateHublyInvoice {
  id: string
  month: string
  invoice: string
  year: string;
}

export interface IHublyInvoiceData {
  organizationId: string
  userId: string
  invoice: string
  month: string
  year: string
  received?: boolean
}

export interface IGetInvoiceInput {
  month: string
  year: string
}