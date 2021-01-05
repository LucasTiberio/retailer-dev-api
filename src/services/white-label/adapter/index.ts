import { IWhiteLabelInfosFromDB } from '../types'

export const whiteLabelInfosAdapter = (record: IWhiteLabelInfosFromDB) => ({
  primaryColor: record.primary_color,
  secondColor: record.second_color,
  tertiaryColor: record.tertiary_color,
  logo: record.logo,
})
