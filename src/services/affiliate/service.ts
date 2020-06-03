import ShortenerUrlService from '../shortener-url/service';
import OrganizationService from '../organization/service';
import ServicesService from '../services/service';
import { IUserToken } from '../authentication/types';
import { Transaction } from 'knex';
import { Services } from '../services/types';

const utmSource = "plugone";

const generateShortenerUrl = async (affiliateGenerateShortenerUrlPayload: { 
  originalUrl: string
  organizationId: string,
  serviceName: Services
 } , userToken: IUserToken, trx: Transaction) => {

  if(!userToken) throw new Error('token must be provided!');

  const { originalUrl, organizationId, serviceName } = affiliateGenerateShortenerUrlPayload;

  const userOrganization = await OrganizationService.getUserOrganizationByIds(userToken.id, organizationId, trx);

  const [organizationService] = await ServicesService.serviceOrganizationByName(organizationId, serviceName, trx);

  const affiliate = await ServicesService.getServiceMemberById(userOrganization.id, organizationService.id, trx);

  if(!affiliate) throw new Error("Affiliate doesnt exists.");

  const urlWithMemberAttached = `${originalUrl}?utm_source=${utmSource}&utm_campaign=${affiliate.id}`;

  const shorterUrl = await ShortenerUrlService.shortenerUrl(urlWithMemberAttached, userToken, trx);

  return shorterUrl;

}

export default {
  generateShortenerUrl
}
