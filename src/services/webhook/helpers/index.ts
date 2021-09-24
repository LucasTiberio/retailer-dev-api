import Axios from 'axios'
import { WEBHOOK_URL } from '../../../common/consts'

export const fetchWebhookService = async (query: string, variables?: any) => {
  const payload = {
    query,
    variables,
  }

  console.log({ WEBHOOK_URL })

  const res = await Axios.post(String(WEBHOOK_URL), payload, {
    headers: { 'Content-Type': 'application/json' },
  })

  return res
}
