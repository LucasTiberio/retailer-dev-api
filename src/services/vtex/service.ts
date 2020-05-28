import { Transaction  } from 'knex';
import knexDatabase from '../../knex-database';
import { IUserToken } from '../authentication/types';
import axios from 'axios';

const buildVerifyVtexSecretsUrl = (accountName : string) => 
  `https://${accountName}.vtexcommercestable.com.br/api/oms/pvt/orders`

const verifyAndAttachVtexSecrets = async (input : {
  xVtexApiAppKey: string
  xVtexApiAppToken: string,
  accountName: string,
  organizationId: string
}, userToken: IUserToken, trx: Transaction) => {

  if(!userToken) throw new Error("Token must be provided");

  try {

    const data = await axios.get(
      buildVerifyVtexSecretsUrl(input.accountName), 
      {
        params: {
          f_creationDate: "creationDate:[2020-01-01T02:00:00.000Z TO 2100-01-01T01:59:59.999Z]"
        },
        headers: {
          'content-type': 'Content-Type',
          'x-vtex-api-appkey': input.xVtexApiAppKey,
          'x-vtex-api-apptoken': input.xVtexApiAppToken
        }
     }
    )

    if(data.status === 200){

      await attachVtexSecrets(input, trx);
      
      return true
    }

    return false

  } catch(e) {
    throw new Error(e.response?.data?.error?.message || e.message)
  }

}

const attachVtexSecrets = async (input: {
  xVtexApiAppKey: string
  xVtexApiAppToken: string,
  accountName: string,
  organizationId: string
}, trx: Transaction) => {

  const { xVtexApiAppKey, xVtexApiAppToken, accountName, organizationId } = input;

  const [verifySecretExists] = await (trx || knexDatabase)('organization_vtex_secrets')
    .where('store_name', accountName)
    .andWhere('organization_id', organizationId)
    .select();

  if(verifySecretExists){
    const changeVtexSecrets = await (trx || knexDatabase)('organization_vtex_secrets')
      .where('id', verifySecretExists.id)
      .update({
        vtex_key: xVtexApiAppKey,
        vtex_token: xVtexApiAppToken
      }).select();

    return changeVtexSecrets;
  }
  

  const attachedVtexSecrets = await (trx || knexDatabase)('organization_vtex_secrets')
    .insert({
      organization_id: organizationId,
      store_name: accountName,
      vtex_key: xVtexApiAppKey,
      vtex_token: xVtexApiAppToken
    }).returning('*');

    return attachedVtexSecrets;

}

export default {
  verifyAndAttachVtexSecrets
}
