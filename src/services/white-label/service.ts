import OrganizationRulesService from '../organization-rules/service'
import RepositoryOrganizationWhiteLabelCustomization from './repositories/organization_white_label_customization'
import { Transaction } from 'knex'
import { ILogo, IWhiteLabelInfos } from './types'
import { onlyPnhAndJpgIsSupported } from '../../common/errors'
import StorageService from '../storage/service'
import common from '../../common'
import sharp from 'sharp'

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
    if (input.logo) {
      const { createReadStream: logoCreateReadStream, mimetype: logoMimetype } = await input.logo
      const logoImageData = {
        data: logoCreateReadStream(),
        mimetype: logoMimetype,
      }
      const imageUrl = await handleWhiteLabelLogoImage(130, 36, logoImageData, organizationId, trx)
      input.logo = imageUrl
    }

    return await RepositoryOrganizationWhiteLabelCustomization.sendWhiteLabelInfosByOrganizationId(input, organizationId, trx)
  } catch (error) {
    throw new Error(error.message)
  }
}

const handleWhiteLabelLogoImage = async (width: number, height: number, input: ILogo, organizationId: string, trx: Transaction) => {
  let { mimetype, data } = input

  if (!mimetype.match(/\/png/gi)?.length && !mimetype.match(/\/jpg/gi)?.length && !mimetype.match(/\/jpeg/gi)?.length) {
    throw new Error(onlyPnhAndJpgIsSupported)
  }

  const path = common.encryptSHA256(organizationId)

  const pipeline = sharp().resize(width, height, {
    fit: 'contain',
  })

  let newData

  if (process.env.NODE_ENV !== 'test') {
    newData = await data.pipe(pipeline)
  }

  const imageUploaded = await StorageService.uploadImage(`white-label/logo/${path}`, newData, mimetype, trx)

  return imageUploaded.url
}

export default {
  getWhiteLabelInfos,
  sendWhiteLabelInfos,
}
