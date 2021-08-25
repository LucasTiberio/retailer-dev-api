import { INDICAE_LI_WHITE_LABEL_DOMAIN } from "../../../common/consts"

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