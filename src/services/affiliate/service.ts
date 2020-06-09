import ShortenerUrlService from '../shortener-url/service';
import OrganizationService from '../organization/service';
import ServicesService from '../services/service';
import BankDataService from '../bank-data/service';
import { IUserToken } from '../authentication/types';
import { Transaction } from 'knex';
import { Services } from '../services/types';
import knexDatabase from '../../knex-database';
import { IUsersOrganizationServiceRolesUrlShortenerFromDB } from './types';
import { IUserBankValuesToInsert } from '../bank-data/types';
import { MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED, MESSAGE_ERROR_USER_NOT_EXISTS_IN_ORGANIZATION_SERIVCE } from '../../common/consts';

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

  if(!userToken) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED);

  const { userOrganizationServiceId } = input;

  const affiliateShortenerUrls = await (trx || knexDatabase.knex)('users_organization_service_roles_url_shortener')
    .where('users_organization_service_roles_id', userOrganizationServiceId)
    .select();

  return affiliateShortenerUrls.map(affiliateShorterUrlAdapter);

}

const createAffiliateBankValues = async (
  createUserBankValuesPayload: IUserBankValuesToInsert, 
  context: { organizationId: string, client: IUserToken, userServiceOrganizationRolesId: string }, 
  trx: Transaction) => {

    if(!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED);

    if(!context.userServiceOrganizationRolesId) throw new Error(MESSAGE_ERROR_USER_NOT_EXISTS_IN_ORGANIZATION_SERIVCE);

    const [affiliateBankDataFound] = await (trx || knexDatabase.knex)('users_organization_service_roles').where('id', context.userServiceOrganizationRolesId).select('*');

    if(affiliateBankDataFound.bank_data_id){
      await BankDataService.updateBankValues({...createUserBankValuesPayload, bankDataId: affiliateBankDataFound.bank_data_id}, context, trx);
      return ServicesService.usersOrganizationServiceAdapter(affiliateBankDataFound);
    }

    const bankData = await BankDataService.createBankValues(createUserBankValuesPayload, context, trx);

    const [affiliateBankData] = await (trx || knexDatabase.knex)('users_organization_service_roles').update('bank_data_id', bankData.id).where('id', context.userServiceOrganizationRolesId).returning('*');

    return ServicesService.usersOrganizationServiceAdapter(affiliateBankData);

}

export default {
  generateShortenerUrl,
  getShorterUrlByUserOrganizationServiceId,
  createAffiliateBankValues
}
