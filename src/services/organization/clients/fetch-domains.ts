import { buildGetDomainVtexUrl } from '../../vtex/helpers'
import Axios from 'axios'

const fetchVtexDomains = async (secret: { accountName: string; xVtexApiAppKey: string; xVtexApiAppToken: string }) => {
  buildGetDomainVtexUrl

  const { data: vtexDomains } = await Axios.get(buildGetDomainVtexUrl(secret.accountName), {
    headers: {
      'content-type': 'Content-Type',
      'x-vtex-api-appkey': secret.xVtexApiAppKey,
      'x-vtex-api-apptoken': secret.xVtexApiAppToken,
    },
  })

  return vtexDomains
}

export default fetchVtexDomains
