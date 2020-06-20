import ShortenerUrlService from '../shortener-url/service';
import UserService from '../users/service';
import OrganizationService from '../organization/service';
import ServicesService from '../services/service';
import BankDataService from '../bank-data/service';
import { IUserToken } from '../authentication/types';
import { Transaction } from 'knex';
import { Services, ServiceRoles } from '../services/types';
import knexDatabase from '../../knex-database';
import { IUsersOrganizationServiceRolesUrlShortenerFromDB, IVtexStatus } from './types';
import { IUserBankValuesToInsert } from '../bank-data/types';
import { MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED, MESSAGE_ERROR_USER_NOT_EXISTS_IN_ORGANIZATION_SERIVCE, MESSAGE_ERROR_USER_DOES_NOT_EXIST_IN_SYSTEM, MESSAGE_ERROR_USER_NOT_IN_ORGANIZATION, MESSAGE_ERROR_USER_DOES_NOT_HAVE_SALE_ROLE, SALE_VTEX_PIXEL_NAMESPACE } from '../../common/consts';
import common from '../../common';
import { RedisClient } from 'redis';
import Axios from 'axios';
import moment from 'moment';

const ordersServiceUrl = `https://f54c3ff994cb.ngrok.io`

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

const getAllOrganizationOrders = async (input: { 
  limit?: string
  startDate?: Date
  endDate?: Date
  name?: string
  status?: IVtexStatus
 } , context: { client: IUserToken, organizationId: string }) => {

  if(!context.client) throw new Error('token must be provided!');

  let limit = input?.limit || "10";
  
  let url = `${ordersServiceUrl}/organization/${context.organizationId}/order?limit=${limit}`;

  if(input?.startDate){
    url += `&startDate=${input.startDate}`
  }

  if(input?.endDate){
    url += `&endDate=${input.endDate}`
  }

  if(input?.name){
    url += `&name=${input.name}`
  }

  if(input?.status){
    url += `&status=${input.status}`
  }

  try {    
    const { data } = await Axios.get(url);
    return data;
  } catch (error) {
    throw new Error(error.message);
  }


}

const getOrganizationOrdersByAffiliateId = async (input: { 
  limit?: string
  startDate?: Date
  endDate?: Date
  name?: string
  status?: IVtexStatus
  paid?: boolean
 } , context: { client: IUserToken, organizationId: string, userServiceOrganizationRolesId: string }) => {

  if(!context.client) throw new Error('token must be provided!');

  let limit = input?.limit || "10";

  if(!context.userServiceOrganizationRolesId) throw new Error("Not affiliate");

  let url = `${ordersServiceUrl}/organization/${context.organizationId}/${context.userServiceOrganizationRolesId}/order?limit=${limit}`;

  if(input?.paid){
    url += `&isCommissionPaid=${input.paid}`
  }

  if(input?.startDate){
    url += `&startDate=${input.startDate}`
  }

  if(input?.endDate){
    url += `&endDate=${input.endDate}`
  }

  if(input?.name){
    url += `&name=${input.name}`
  }

  if(input?.status){
    url += `&status=${input.status}`
  }

  try {    
    const { data } = await Axios.get(url);
    return data;
  } catch (error) {
    throw new Error(error.message);
  }

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

const getOrganizationRevenue = async (input : {
  startDate: Date,
  endDate: Date
},
  context: {client: IUserToken, organizationId: string}
   ) => {

  if(!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED);

  let startDate = input?.startDate || moment("1900-01-01T00:00:00.000Z");
  let endDate = input?.endDate || moment("2200-01-01T00:00:00.000Z");

  let url = `${ordersServiceUrl}/organization/${context.organizationId}/revenue?startDate=${startDate}&endDate${endDate}`;

  try {    
    const { data } = await Axios.get(url);
    console.log(data)
    return {amount: data.amount};
  } catch (error) {
    throw new Error(error.message);
  }
  
}

const getOrganizationAverageTicket = async (input : {
  startDate: Date,
  endDate: Date
},
  context: {client: IUserToken, organizationId: string}
   ) => {

  if(!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED);

  let startDate = input?.startDate || moment("1900-01-01T00:00:00.000Z");
  let endDate = input?.endDate || moment("2200-01-01T00:00:00.000Z");

  let url = `${ordersServiceUrl}/organization/${context.organizationId}/average/ticket?startDate=${startDate}&endDate${endDate}`;

  try {    
    const { data } = await Axios.get(url);
    return {amount: data.amount};
  } catch (error) {
    throw new Error(error.message);
  }
  
}

const getOrganizationTotalOrders = async (input : {
  startDate: Date,
  endDate: Date
},
  context: {client: IUserToken, organizationId: string}
   ) => {

  if(!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED);

  let startDate = input?.startDate || moment("1900-01-01T00:00:00.000Z");
  let endDate = input?.endDate || moment("2200-01-01T00:00:00.000Z");

  let url = `${ordersServiceUrl}/organization/${context.organizationId}/order/total?startDate=${startDate}&endDate${endDate}`;

  try {    
    const { data } = await Axios.get(url);
    return {amount: data.amount};
  } catch (error) {
    throw new Error(error.message);
  }
  
}

const getOrganizationTotalOrdersByAffiliate = async (input : {
  startDate: Date,
  endDate: Date
},
  context: {client: IUserToken, organizationId: string, userServiceOrganizationRolesId: string}
   ) => {

  if(!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED);

  if(!context.userServiceOrganizationRolesId) throw new Error("Not affiliate");

  let startDate = input?.startDate || moment("1900-01-01T00:00:00.000Z");
  let endDate = input?.endDate || moment("2200-01-01T00:00:00.000Z");

  let url = `${ordersServiceUrl}/organization/${context.organizationId}/order/total?startDate=${startDate}&endDate=${endDate}&affiliateId=${context.userServiceOrganizationRolesId}`;

  try {    
    const { data } = await Axios.get(url);
    return {amount: data.amount};
  } catch (error) {
    throw new Error(error.message);
  }
  
}

const getOrganizationCommissionByAffiliate = async (input : {
  startDate: Date,
  endDate: Date
  paid: boolean
},
  context: {client: IUserToken, organizationId: string, userServiceOrganizationRolesId: string}
   ) => {

  if(!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED);

  if(!context.userServiceOrganizationRolesId) throw new Error("Not affiliate");

  let startDate = input?.startDate || moment("1900-01-01T00:00:00.000Z");
  let endDate = input?.endDate || moment("2200-01-01T00:00:00.000Z");

  let url = `${ordersServiceUrl}/organization/${context.organizationId}/commission/total?startDate=${startDate}&endDate=${endDate}&affiliateId=${context.userServiceOrganizationRolesId}&isCommissionPaid=${input?.paid || false}`;

  try {    
    const { data } = await Axios.get(url);
    return {data};
  } catch (error) {
    throw new Error(error.message);
  }
  
}

const getOrganizationCommission = async (input : {
  startDate: Date,
  endDate: Date,
  paid: boolean
},
  context: {client: IUserToken, organizationId: string}
   ) => {

  if(!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED);

  let startDate = input?.startDate || moment("1900-01-01T00:00:00.000Z");
  let endDate = input?.endDate || moment("2200-01-01T00:00:00.000Z");

  let url = `${ordersServiceUrl}/organization/${context.organizationId}/commission/total?startDate=${startDate}&endDate${endDate}&isCommissionPaid=${input?.paid || true}`;

  try {    
    const { data } = await Axios.get(url);
    return {data};
  } catch (error) {
    throw new Error(error.message);
  }
  
}

export default {
  generateShortenerUrl,
  generateSalesShorten,
  getOrganizationTotalOrders,
  getOrganizationCommission,
  getShorterUrlByUserOrganizationServiceId,
  createAffiliateBankValues,
  generateSalesJWT,
  getAllOrganizationOrders,
  getOrganizationOrdersByAffiliateId,
  getOrganizationRevenue,
  getOrganizationAverageTicket,
  getOrganizationTotalOrdersByAffiliate,
  getOrganizationCommissionByAffiliate
}
