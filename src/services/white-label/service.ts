import OrganizationRulesService from '../organization-rules/service'
import RepositoryOrganizationWhiteLabelCustomization from './repositories/organization_white_label_customization'
import { Transaction } from 'knex'
import { ILogo, IWhiteLabelInfos } from './types'
import { onlyPnhAndJpgIsSupported } from '../../common/errors'
import StorageService from '../storage/service'
import common from '../../common'
import sharp from 'sharp'

const defaultWhiteLabel = {
  primaryColor: '#DB0046',
  secondColor: '#111111',
  tertiaryColor: '#EEEEEE',
  logo: 'https://plugone-production.nyc3.digitaloceanspaces.com/assets/logo.png',
}

const getWhiteLabelInfos = async (organizationId: string, trx: Transaction) => {
  const planType = await OrganizationRulesService.verifyPlanType(organizationId)

  if (!planType || planType !== 'Enterprise') {
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

const getWhiteLabelColorOptions = async (trx: Transaction) => {
  const colorOptions = ['#D70000', '#ED8E00', '#95B221', '#00830D', '#00B3BE', '#0030D9', '#7E00BA', '#DB287E', '#111111']

  return colorOptions
}

const getWhiteLabelInfosByDomain = async (domain: string, trx: Transaction) => {
  const whiteLabelInfos = await RepositoryOrganizationWhiteLabelCustomization.getWhiteLabelInfosByOrganizationId(undefined, trx, domain)

  if (!whiteLabelInfos) {
    return defaultWhiteLabel
  }

  let isWhiteLabel = false
  if (whiteLabelInfos.primaryColor || whiteLabelInfos.secondColor || whiteLabelInfos.tertiaryColor || whiteLabelInfos.logo) {
    isWhiteLabel = true
  }

  return {
    primaryColor: whiteLabelInfos.primaryColor ?? defaultWhiteLabel.primaryColor,
    secondColor: whiteLabelInfos.secondColor ?? defaultWhiteLabel.secondColor,
    tertiaryColor: whiteLabelInfos.tertiaryColor ?? defaultWhiteLabel.tertiaryColor,
    logo: whiteLabelInfos.logo ?? defaultWhiteLabel.logo,
    organizationName: whiteLabelInfos.organizationName ?? '',
    isWhiteLabel,
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
    background: { r: 0, g: 0, b: 0, alpha: 0 },
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
  getWhiteLabelInfosByDomain,
  getWhiteLabelColorOptions,
}
