import { Transaction } from 'knex'

/** Types */
import { ICreateAffiliateStore, IAffiliateStoreAdapted, IAvatar } from './types'

/** Common */
import { affiliateDoesNotExist, onlyPnhAndJpgIsSupported } from '../../common/errors'

/** Utils */
import removeUndefinedOfObjects from '../../utils/removeUndefinedOfObjects'

/** Services */
import StorageService from '../storage/service'

/** Repository */
import Repository from './repositories/affiliate-store'
import { affiliateStoreAdapter } from './adapters'
import common from '../../common'
import sharp from 'sharp'

const handleAffiliateStore = async (
  input: ICreateAffiliateStore,
  context: {
    userServiceOrganizationRolesId: string
  },
  trx: Transaction
): Promise<IAffiliateStoreAdapted> => {
  if (!context.userServiceOrganizationRolesId) throw new Error(affiliateDoesNotExist)

  removeUndefinedOfObjects(input)

  if (input.avatar) {
    const url = await handleAffiliateStoreImages(192, 192, 'avatar', input.avatar, context.userServiceOrganizationRolesId, trx)
    input.avatar = url
  }

  if (input.cover) {
    const url = await handleAffiliateStoreImages(1120, 130, 'cover', input.cover, context.userServiceOrganizationRolesId, trx)
    input.cover = url
  }

  const [affiliateStoreCreated] = await Repository.findOrUpdate(context.userServiceOrganizationRolesId, input, trx)

  return affiliateStoreAdapter(affiliateStoreCreated)
}

const getAffiliateStore = async (context: { userServiceOrganizationRolesId: string }, trx: Transaction) => {
  if (!context.userServiceOrganizationRolesId) throw new Error(affiliateDoesNotExist)

  const affiliateStore = await Repository.getById(context.userServiceOrganizationRolesId, trx)

  return affiliateStoreAdapter(affiliateStore)
}

const handleAffiliateStoreImages = async (width: number, height: number, type: string, input: IAvatar, affiliateId: string, trx: Transaction) => {
  let { mimetype, data } = input

  if (!mimetype.match(/\/png/gi)?.length && !mimetype.match(/\/jpg/gi)?.length && !mimetype.match(/\/jpeg/gi)?.length) {
    throw new Error(onlyPnhAndJpgIsSupported)
  }

  const path = common.encryptSHA256(affiliateId)

  const pipeline = sharp().resize(width, height, {
    fit: 'contain',
  })

  let newData

  if (process.env.NODE_ENV !== 'test') {
    newData = await data.pipe(pipeline)
  }

  const imageUploaded = await StorageService.uploadImage(
    process.env.NODE_ENV === 'test' ? `tdd/affiliate-store/${type}/${path}` : `affiliatestore/${type}/${path}`,
    process.env.NODE_ENV === 'test' ? data : newData,
    mimetype,
    trx
  )

  return imageUploaded.url
}

export default {
  handleAffiliateStore,
  getAffiliateStore,
}
