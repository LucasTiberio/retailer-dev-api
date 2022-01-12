import { Transaction } from 'knex'
import knexDatabase from '../../knex-database'
import { IGetLatestUrl, IShortenerUrlFromDB } from './types'
import shortid from 'shortid'
import store from '../../store'
import OrganizationWhiteLabelCustomization from '../white-label/repositories/organization_white_label_customization'
import OrganizationWhiteLabelCustomizationService from '../white-label/service'

const backendRedirectUrl = process.env.REDIRECT_URL

const shortUrlAdapter = (record: IShortenerUrlFromDB) => ({
  id: record.id,
  originalUrl: record.original_url,
  shortUrl: record.short_url,
  urlCode: record.url_code,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
})

const getShortenerUrlByLoader = store.registerOneToOneLoader(
  async (shortenerUrlIds: string[]) => {
    const query = await knexDatabase.knexConfig('url_shorten').whereIn('id', shortenerUrlIds).select('*')

    return query
  },
  'id',
  shortUrlAdapter
)

const shortIdGenerator = async (trx: Transaction) => {
  const shortId = shortid.generate()

  const shortIdFoundOnDb = await (trx || knexDatabase.knexConfig)('url_shorten').where('short_url', shortId).select('id')

  if (shortIdFoundOnDb.length) shortIdGenerator(trx)

  return shortId
}

const shortenerUrl = async (originalUrl: string, organizationId: string, trx: Transaction) => {
  // if(!userToken) throw new Error("token must be provided");

  const originalUrlFound = await getShortnerUrlByOriginalUrl(originalUrl, trx)

  if (!originalUrlFound) {
    const shortId = await shortIdGenerator(trx)

    const [shortIdFoundOnDb] = await (trx || knexDatabase.knexConfig)('url_shorten')
      .insert({
        original_url: originalUrl,
        short_url: `${backendRedirectUrl}/${shortId}`,
        url_code: shortId,
      })
      .returning('*')

    return shortUrlAdapter(shortIdFoundOnDb)
  }

  return originalUrlFound
}

const getExistentUrlShortenerForKlipfolioIntegration = async (affiliateId: string, trx: Transaction) => {
  const [existent] = await (trx || knexDatabase.knexConfig)('url_shorten as us')
    .innerJoin('users_organization_service_roles_url_shortener as uosrus', 'us.id', 'uosrus.url_shorten_id')
    .innerJoin('users_organization_service_roles as uosr', 'uosr.id', 'uosrus.users_organization_service_roles_id')
    .where('uosr.id', affiliateId)
    .orderBy('us.created_at', 'asc')
    .select('uosrus.*')

  return existent
}

const getShortnerUrlByOriginalUrl = async (originalUrl: string, trx: Transaction) => {
  const [shortIdFoundOnDb] = await (trx || knexDatabase.knexConfig)('url_shorten').where('original_url', originalUrl).select('*')

  return shortIdFoundOnDb ? shortUrlAdapter(shortIdFoundOnDb) : null
}

const getOriginalUrlByCode = async (urlCode: string, trx: Transaction) => {
  const [shortIdFoundOnDb] = await (trx || knexDatabase.knexConfig)('url_shorten').where('url_code', urlCode).select('original_url', 'id')

  if (!shortIdFoundOnDb) throw new Error('Shortener url doesnt exists')

  await (trx || knexDatabase.knexConfig)('url_shorten').where('id', shortIdFoundOnDb.id).increment('count', 1)

  return shortIdFoundOnDb.original_url
}

const getShortenerUrlById = async (organizationId: string, urlShortenerId: string) => {
  const userOrganizationRole = await getShortenerUrlByLoader().load(urlShortenerId)
  const whitelabel = await OrganizationWhiteLabelCustomization.getWhiteLabelInfosByOrganizationId(organizationId)

  if (whitelabel?.redirectWhiteLabel) {
    return {
      ...userOrganizationRole,
      shortUrl: `https://${whitelabel.redirectWhiteLabel}/${userOrganizationRole.urlCode}`,
    }
  }

  return userOrganizationRole
}

const getAffiliateLastGeneratedUrl = async (affiliateId: string, organizationId: string, trx: Transaction) => {
  const result = await (trx || knexDatabase.knexConfig)('url_shorten as us')
    .select('us.*')
    .innerJoin('users_organization_service_roles_url_shortener as uosr', 'uosr.url_shorten_id', 'us.id')
    .where('uosr.users_organization_service_roles_id', affiliateId)
    .orderBy('us.created_at', 'desc')
    .first()

  if (!result) return null

  const whitelabel = (await OrganizationWhiteLabelCustomizationService.getWhiteLabelInfos(organizationId, trx)) as any
  const adapted = shortUrlAdapter(result)

  console.log({ whitelabel })

  if (whitelabel?.redirectWhiteLabel) {
    return {
      ...adapted,
      shortUrl: `https://${whitelabel.redirectWhiteLabel}/${adapted.urlCode}`,
    }
  }

  return adapted
}

const getAffiliateLatestUrl = async (ctx: { userId: string; organizationId: string }, trx: Transaction) => {
  const whitelabel = (await OrganizationWhiteLabelCustomizationService.getWhiteLabelInfos(ctx.organizationId, trx)) as any
  const result: IShortenerUrlFromDB[] = await (trx || knexDatabase.knexConfig)('url_shorten as us')
    .select('u.id as user_id', 'o.id as organization_id', 'us.*')
    .innerJoin('users_organization_service_roles_url_shortener as uosr', 'uosr.url_shorten_id', 'us.id')
    .innerJoin('users_organization_service_roles as uos', 'uosr.users_organization_service_roles_id', 'uos.id')
    .innerJoin(' users_organizations as uo', 'uos.users_organization_id', 'uo.id')
    .innerJoin('users as u', 'uo.user_id', 'u.id')
    .innerJoin('organizations as o', 'uo.organization_id', 'o.id')
    .where('u.id', ctx.userId)
    .where('o.id', ctx.organizationId)
    .orderBy('us.created_at', 'desc')
    .limit(5)

  return result.map((res) => {
    const adapted = shortUrlAdapter(res)
    if (whitelabel?.redirectWhiteLabel) {
      return {
        ...adapted,
        shortUrl: `https://${whitelabel.redirectWhiteLabel}/${adapted.urlCode}`,
      }
    }

    return adapted
  })
}

export default {
  shortenerUrl,
  getExistentUrlShortenerForKlipfolioIntegration,
  getOriginalUrlByCode,
  getShortenerUrlById,
  getAffiliateLastGeneratedUrl,
  getShortnerUrlByOriginalUrl,
  getAffiliateLatestUrl,
}
