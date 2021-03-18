import { IWhiteLabelInfosFromDB } from '../types'

interface IWhiteLabelInfosAdapter extends IWhiteLabelInfosFromDB {
  name: string;
}

export const whiteLabelInfosAdapter = (record: IWhiteLabelInfosAdapter) => ({
  primaryColor: record.primary_color,
  secondColor: record.second_color,
  tertiaryColor: record.tertiary_color,
  logo: record.logo,
  organizationName: record.name
})
