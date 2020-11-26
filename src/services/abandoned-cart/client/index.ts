import Axios from 'axios'
import { buildGetOrderById } from '../../vtex/helpers'

export const getVtexOrderById = async (secret: any, orderId: string) => {
  try {
    const { data } = await Axios.get(buildGetOrderById(secret.accountName, orderId), {
      headers: {
        'content-type': 'Content-Type',
        'x-vtex-api-appkey': secret.xVtexApiAppKey,
        'x-vtex-api-apptoken': secret.xVtexApiAppToken,
      },
    })

    return data
  } catch (e) {
    return false
  }
}
