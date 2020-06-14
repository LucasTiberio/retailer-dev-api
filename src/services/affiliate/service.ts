import ShortenerUrlService from '../shortener-url/service';
import UserService from '../users/service';
import OrganizationService from '../organization/service';
import ServicesService from '../services/service';
import BankDataService from '../bank-data/service';
import { IUserToken } from '../authentication/types';
import { Transaction } from 'knex';
import { Services, ServiceRoles } from '../services/types';
import knexDatabase from '../../knex-database';
import { IUsersOrganizationServiceRolesUrlShortenerFromDB } from './types';
import { IUserBankValuesToInsert } from '../bank-data/types';
import { MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED, MESSAGE_ERROR_USER_NOT_EXISTS_IN_ORGANIZATION_SERIVCE, MESSAGE_ERROR_USER_DOES_NOT_EXIST_IN_SYSTEM, MESSAGE_ERROR_USER_NOT_IN_ORGANIZATION, MESSAGE_ERROR_USER_DOES_NOT_HAVE_SALE_ROLE, SALE_VTEX_PIXEL_NAMESPACE } from '../../common/consts';
import common from '../../common';
import { RedisClient } from 'redis';

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

  const urlWithMemberAttached = `${originalUrl}?utm_source=${utmSource}&utm_campaign=${affiliate.id}_${organizationService.id}`;

  const shorterUrl = await ShortenerUrlService.shortenerUrl(urlWithMemberAttached, trx);

  const attachedShorterUrlOnAffiliate = await attachShorterUrlOnAffiliate(affiliate.id, shorterUrl.id, trx);

  return attachedShorterUrlOnAffiliate;

}

const attachShorterUrlOnAffiliate = async (userOrganizationServiceId: string, shorterUrlId: string, trx: Transaction) => {

  const [shorterUrlFoundOnAffiliate] = await (trx || knexDatabase.knex)('users_organization_service_roles_url_shortener')
  .where(
    'url_shorten_id', shorterUrlId
  ).returning('*')

  if(shorterUrlFoundOnAffiliate) return affiliateShorterUrlAdapter(shorterUrlFoundOnAffiliate);


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

const generateSalesJWT = async (generateSalesJWTPayload : {
  organizationId: string,
  email: string,
  serviceName: Services
}, context: { redisClient: RedisClient }, trx: Transaction) => {

  const { organizationId, email, serviceName } = generateSalesJWTPayload;

  const user = await UserService.getUserByEmail(email, trx);

  if(!user) throw new Error(MESSAGE_ERROR_USER_DOES_NOT_EXIST_IN_SYSTEM);

  const [serviceOrganizationFound] = await ServicesService.serviceOrganizationByName(organizationId, serviceName, trx);

  if(!serviceOrganizationFound) throw new Error(MESSAGE_ERROR_USER_NOT_EXISTS_IN_ORGANIZATION_SERIVCE);

  const userOrganization = await OrganizationService.getUserOrganizationByIds(user.id, organizationId, trx);

  if(!userOrganization) throw new Error(MESSAGE_ERROR_USER_NOT_IN_ORGANIZATION);

  const userRole = await ServicesService.getUserOrganizationServiceRoleName(userOrganization.id, serviceOrganizationFound.id, trx);

  if(!userRole || userRole.name !== ServiceRoles.SALE) throw new Error(MESSAGE_ERROR_USER_DOES_NOT_HAVE_SALE_ROLE);

  const userOrganizationServiceRoleId = userRole.id;

  const vtexSalePixelJwt = common.generateJwt(userOrganizationServiceRoleId, SALE_VTEX_PIXEL_NAMESPACE, '21600');

  try {
    await context.redisClient.setex(`${SALE_VTEX_PIXEL_NAMESPACE}_${vtexSalePixelJwt}`, 21600, userOrganizationServiceRoleId);
    return vtexSalePixelJwt;
  } catch(e){
    throw new Error(e.message)
  }


}

const generateSalesShorten = async (generateSalesShortenPayload: {
  url: string
}, context: {salesId: string}, trx: Transaction) => {

  const shorterUrl = await ShortenerUrlService.shortenerUrl(
    generateSalesShortenPayload.url, 
    trx);

  await attachShorterUrlOnAffiliate(context.salesId, shorterUrl.id, trx);

  return shorterUrl;
  
}

export default {
  generateShortenerUrl,
  generateSalesShorten,
  getShorterUrlByUserOrganizationServiceId,
  createAffiliateBankValues,
  generateSalesJWT
}
