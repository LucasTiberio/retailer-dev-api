import { Transaction } from 'knex';
import knexDatabase from "../../knex-database";
import { IShortenerUrlFromDB } from "./types";
import shortid from 'shortid';
import store from '../../store';
import OrganizationWhiteLabelCustomization from '../white-label/repositories/organization_white_label_customization';

const backendRedirectUrl = process.env.REDIRECT_URL;

const shortUrlAdapter = (record : IShortenerUrlFromDB) => ({
  id: record.id,
  originalUrl: record.original_url,
  shortUrl: record.short_url,
  urlCode: record.url_code,
  createdAt: record.created_at,
  updatedAt: record.updated_at
})


const getShortenerUrlByLoader = store.registerOneToOneLoader(
  async (shortenerUrlIds : string[]) => {
    const query = await knexDatabase.knexConfig('url_shorten')
    .whereIn('id', shortenerUrlIds)
    .select('*')

    return query
  },
    'id',
    shortUrlAdapter
);

const shortIdGenerator = async (trx: Transaction) => {

  const shortId = shortid.generate();

  const shortIdFoundOnDb = await (trx || knexDatabase.knexConfig)('url_shorten')
    .where('short_url', shortId)
    .select('id');

  if(shortIdFoundOnDb.length) shortIdGenerator(trx);

  return shortId
}

const shortenerUrl = async (originalUrl: string, organizationId: string, trx: Transaction) => {

  // if(!userToken) throw new Error("token must be provided");

    const originalUrlFound = await getShortnerUrlByOriginalUrl(originalUrl, trx);

    if(!originalUrlFound) {

      const shortId = await shortIdGenerator(trx);

      const [shortIdFoundOnDb] = await (trx || knexDatabase.knexConfig)('url_shorten')
        .insert({
          original_url: originalUrl,
          short_url: `${backendRedirectUrl}/${shortId}`,
          url_code: shortId
        })
        .returning('*');
    
      return shortUrlAdapter(shortIdFoundOnDb);
    };

    return originalUrlFound

}

const getShortnerUrlByOriginalUrl = async (originalUrl: string, trx: Transaction) => {

  const [shortIdFoundOnDb] = await (trx || knexDatabase.knexConfig)('url_shorten')
    .where('original_url', originalUrl)
    .select('*');

  return shortIdFoundOnDb ? shortUrlAdapter(shortIdFoundOnDb) : null;

}

const getOriginalUrlByCode = async (urlCode: string ,trx: Transaction) => {

  const [shortIdFoundOnDb] = await (trx || knexDatabase.knexConfig)('url_shorten')
  .where('url_code', urlCode)
  .select('original_url', 'id');

  if(!shortIdFoundOnDb) throw new Error("Shortener url doesnt exists");

  await (trx || knexDatabase.knexConfig)('url_shorten')
  .where('id', shortIdFoundOnDb.id)
  .increment('count', 1)

  return shortIdFoundOnDb.original_url;

}

const getShortenerUrlById = async (organizationId: string, urlShortenerId: string) => {
  const userOrganizationRole = await getShortenerUrlByLoader().load(urlShortenerId);
  const whitelabel = await OrganizationWhiteLabelCustomization.getWhiteLabelInfosByOrganizationId(organizationId)  

  if (whitelabel?.redirectWhiteLabel) {
    return {
      ...userOrganizationRole,
      shortUrl: `https://${whitelabel.redirectWhiteLabel}/${userOrganizationRole.urlCode}`
    }
  }

  return userOrganizationRole;

}

export default {
  shortenerUrl,
  getOriginalUrlByCode,
  getShortenerUrlById
};