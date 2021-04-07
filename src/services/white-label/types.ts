export interface IWhiteLabelInfos {
  primaryColor: string
  secondColor: string
  tertiaryColor: string
  logo: any
}

export interface IWhiteLabelInfosFromDB {
  primary_color: string
  second_color: string
  tertiary_color: string
  organization_id: string
  logo: string
  custom_domain: string
}

export interface ILogo {
  mimetype: string
  data: any
}
