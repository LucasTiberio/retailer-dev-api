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
