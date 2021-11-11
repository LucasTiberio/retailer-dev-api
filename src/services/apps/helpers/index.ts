import Axios from "axios"
import { COUPON_URL, INDICAE_LI_WHITE_LABEL_DOMAIN } from "../../../common/consts"

const lojaIntegradaNames = {
  'Hubly Invoice': 'Nota Fiscal',
  'Hubly Cluster': 'Tipos de Parceiro',
} as {[key: string]: string}

export const parseAppName = (name: string, domain: string): string | undefined => {
  if (INDICAE_LI_WHITE_LABEL_DOMAIN.includes(domain)) {
    return lojaIntegradaNames[name]
  }
  
  const names = {
    'Plug Form': 'Formulários'
  } as {[key: string]: string}

  return names[name]
}

export const fetchCouponService = async (query: string, variables?: any) => {
  const payload = {
    query,
    variables,
  }

  console.log({ COUPON_URL })

  const res = await Axios.post(String(COUPON_URL), payload, {
    headers: { 'Content-Type': 'application/json' },
  })

  return res
}
