import ShortenerUrlService from '../shortener-url/service';
import OrganizationService from '../organization/service';
import ServicesService from '../services/service';
import { IUserToken } from '../authentication/types';
import { Transaction } from 'knex';
import { Services } from '../services/types';
import knexDatabase from '../../knex-database';
import { IUsersOrganizationServiceRolesUrlShortenerFromDB } from './types';

const utmSource = "plugone_affiliate";

const affiliateShorterUrlAdapter = (record: IUsersOrganizationServiceRolesUrlShortenerFromDB) => ({
  id: record.id,
  usersOrganizationServiceRolesId: record.users_organization_service_roles_id,
  urlShortenId: record.url_shorten_id,
  createdAt: record.created_at,
  updatedAt: record.updated_at
})


const generateShortenerUrl = async (affiliateGenerateShortenerUrlPayload: { 
  originalUrl: string
  serviceName: Services
 } , context: { client: IUserToken, organizationId: string }, trx: Transaction) => {

  if(!context.client) throw new Error('token must be provided!');

  const { originalUrl, serviceName } = affiliateGenerateShortenerUrlPayload;

  const userOrganization = await OrganizationService.getUserOrganizationByIds(context.client.id, context.organizationId, trx);

  const [organizationService] = await ServicesService.serviceOrganizationByName(context.organizationId, serviceName, trx);

  const affiliate = await ServicesService.getServiceMemberById(userOrganization.id, organizationService.id, trx);

  if(!affiliate) throw new Error("Affiliate doesnt exists.");

  const urlWithMemberAttached = `${originalUrl}?utm_source=${utmSource}&utm_campaign=${affiliate.id}`;

  const shorterUrl = await ShortenerUrlService.shortenerUrl(urlWithMemberAttached, context.client, trx);

  const attachedShorterUrlOnAffiliate = await attachShorterUrlOnAffiliate(affiliate.id, shorterUrl.id, trx);

  return attachedShorterUrlOnAffiliate;

}

const attachShorterUrlOnAffiliate = async (userOrganizationServiceId: string, shorterUrlId: string, trx: Transaction) => {

  const [attachedShorterUrlOnAffiliate] = await (trx || knexDatabase.knex)('users_organization_service_roles_url_shortener')
    .insert({
      users_organization_service_roles_id:userOrganizationServiceId,
      url_shorten_id:shorterUrlId
    }).returning('*')

    return attachedShorterUrlOnAffiliate ? affiliateShorterUrlAdapter(attachedShorterUrlOnAffiliate) : null

}

const getShorterUrlByUserOrganizationServiceId = async (input: { userOrganizationServiceId: string }, userToken: IUserToken, trx: Transaction) => {

  if(!userToken) throw new Error("Token must be provided");

  const { userOrganizationServiceId } = input;

  const affiliateShortenerUrls = await (trx || knexDatabase.knex)('users_organization_service_roles_url_shortener')
    .where('users_organization_service_roles_id', userOrganizationServiceId)
    .select();

  return affiliateShortenerUrls.map(affiliateShorterUrlAdapter);

}

export default {
  generateShortenerUrl,
  getShorterUrlByUserOrganizationServiceId
}
