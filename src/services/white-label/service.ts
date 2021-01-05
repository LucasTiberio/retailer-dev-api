import OrganizationRulesService from '../organization-rules/service'
import RepositoryOrganizationWhiteLabelCustomization from './repositories/organization_white_label_customization'
import { Transaction } from 'knex'
import { IWhiteLabelInfos } from './types'

const defaultWhiteLabel = {
  primaryColor: '#3B24A8',
  secondColor: '#2C1A84',
  tertiaryColor: '#1DA4C3',
  logo: 'https://plugone-production.nyc3.digitaloceanspaces.com/Captura%20de%20Tela%202021-01-05%20a%CC%80s%2018.17.52.png',
}

const getWhiteLabelInfos = async (organizationId: string, trx: Transaction) => {
  const planType = await OrganizationRulesService.getPlanType(organizationId)

  if (planType !== 'Enterprise') {
    return defaultWhiteLabel
  }

  const whiteLabelInfos = await RepositoryOrganizationWhiteLabelCustomization.getWhiteLabelInfosByOrganizationId(organizationId, trx)

  if (!whiteLabelInfos) {
    return defaultWhiteLabel
  }

  return {
    primaryColor: whiteLabelInfos.primaryColor ?? defaultWhiteLabel.primaryColor,
    secondColor: whiteLabelInfos.secondColor ?? defaultWhiteLabel.secondColor,
    tertiaryColor: whiteLabelInfos.tertiaryColor ?? defaultWhiteLabel.tertiaryColor,
    logo: whiteLabelInfos.logo ?? defaultWhiteLabel.logo,
  }
}

const sendWhiteLabelInfos = async (input: IWhiteLabelInfos, organizationId: string, trx: Transaction) => {
  try {
    return await RepositoryOrganizationWhiteLabelCustomization.sendWhiteLabelInfosByOrganizationId(input, organizationId, trx)
  } catch (error) {
    throw new Error(error.message)
  }
}

export default {
  getWhiteLabelInfos,
  sendWhiteLabelInfos,
}
