import { Transaction } from 'knex'
import { Integrations, ILojaIntegradaSecrets, IIntegration } from './types'
import common from '../../common'
import VtexService from '../vtex/service'
import OrganizationRulesService from '../organization-rules/service'
import { IVtexSecrets } from '../vtex/types'
import knexDatabase from '../../knex-database'
import { organizationServicesByOrganizationIdLoader } from './loaders'
import Axios from 'axios'
import { upgradeYourPlan, userOnlyChangeToSameIntegrationType } from '../../common/errors'
import { createOrganizationWithIntegrationLojaIntegradaPayload } from '../../__mocks__'

const _secretToJwt = (obj: object) => {
  return common.jwtEncode(obj)
}

const createKlipfolioIntegration = async (appKey: string, organizationId: string, trx: Transaction) => {
  // const affiliateRules = await OrganizationRulesService.getAffiliateTeammateRules(organizationId, trx)

  // if (!affiliateRules.providers.some((item: { name: Integrations; status: boolean }) => item.name === Integrations.KLIPFOLIO && item.status)) {
  //   throw new Error(upgradeYourPlan)
  // }

  const integrationFound = await getIntegrationByOrganizationId(organizationId, trx)

  if (integrationFound && integrationFound.type !== Integrations.KLIPFOLIO) {
    throw new Error(userOnlyChangeToSameIntegrationType)
  }

  try {
    await verifyKlipfolioSecrets(appKey)
    const jwtSecret = await _secretToJwt({
      appKey,
    })
    await attachIntegration(organizationId, jwtSecret, Integrations.KLIPFOLIO, appKey, trx)
    return true
  } catch (error) {
    throw new Error(error.message)
  }
}

const createIuguIntegration = async (
  input: {
    secrets: {
      appKey: string
    }
  },
  context: { organizationId: string },
  trx: Transaction
) => {
  const affiliateRules = await OrganizationRulesService.getAffiliateTeammateRules(context.organizationId, trx)

  if (!affiliateRules.providers.some((item: { name: Integrations; status: boolean }) => item.name === Integrations.IUGU && item.status)) {
    throw new Error(upgradeYourPlan)
  }

  const integrationFound = await getIntegrationByOrganizationId(context.organizationId, trx)

  if (integrationFound && integrationFound.type !== Integrations.IUGU) {
    throw new Error(userOnlyChangeToSameIntegrationType)
  }

  try {
    await verifyIuguSecrets(input.secrets.appKey)
    const jwtSecret = await _secretToJwt(input.secrets)
    await attachIntegration(context.organizationId, jwtSecret, Integrations.IUGU, input.secrets.appKey, trx)
    return true
  } catch (error) {
    throw new Error(error.message)
  }
}

const createIntegration = async (
  input: {
    secrets: any
    type: Integrations
  },
  context: { organizationId: string },
  trx: Transaction
) => {
  const { secrets, type } = input

  const affiliateRules = await OrganizationRulesService.getAffiliateTeammateRules(context.organizationId, trx)

  if (!affiliateRules.providers.some((item: { name: Integrations; status: boolean }) => item.name === type && item.status)) {
    throw new Error(upgradeYourPlan)
  }

  const integrationFound = await getIntegrationByOrganizationId(context.organizationId, trx)

  if (integrationFound && integrationFound.type !== input.type) {
    throw new Error(userOnlyChangeToSameIntegrationType)
  }

  try {
    switch (type) {
      case Integrations.VTEX:
        if (secrets.xVtexApiAppKey && secrets.xVtexApiAppToken && secrets.accountName) {
          console.log('VtexService.verifyVtexSecrets')
          await VtexService.verifyVtexSecrets(secrets)
          console.log('VtexService.createVtexHook')
          await VtexService.createVtexHook(secrets)
          console.log('attachIntegration')
          const jwtSecret = await _secretToJwt(input.secrets)
          await attachIntegration(context.organizationId, jwtSecret, type, input.secrets.xVtexApiAppKey, trx)
          return true
        }
        throw new Error('Vtex integration need other keys.')
      case Integrations.LOJA_INTEGRADA:
        if (secrets.appKey) {
          await verifyLojaIntegradaSecrets(secrets)
          const jwtSecret = await _secretToJwt(input.secrets)
          await attachIntegration(context.organizationId, jwtSecret, type, secrets.appKey, trx)
          return true
        }
        throw new Error('Loja integrada integration need other keys.')
      default:
        return
    }
  } catch (error) {
    console.log(error?.response?.data || error.message)
    throw new Error(error.message)
  }
}

const verifyIuguSecrets = async (appKey: string) => {
  const listWebHooksIugu = await Axios.get('https://api.iugu.com/v1/web_hooks', {
    params: {
      api_token: appKey,
    },
  })

  if (listWebHooksIugu.status === 200) {
    return true
  }

  throw new Error('fail in Iugu app key verification.')
}

const verifyKlipfolioSecrets = async (appKey: string) => {
  const { data: getKlipfolioClient } = await Axios.get('https://app.klipfolio.com/api/1/clients', {
    headers: {
      'kf-api-key': appKey,
    },
  })

  if (getKlipfolioClient.meta.success === true && getKlipfolioClient.meta.status === 200) {
    return true
  }

  throw new Error('fail in Klipfolio app key verification.')
}

const verifyLojaIntegradaSecrets = async (secrets: ILojaIntegradaSecrets) => {
  const lojaIntegradaOrders = await Axios.get('https://api.awsli.com.br/v1/pedido/search', {
    params: {
      chave_aplicacao: process.env.LOJA_INTEGRADA_APPLICATION_KEY,
      chave_api: secrets.appKey,
    },
  })

  if (lojaIntegradaOrders.status === 200) {
    return true
  }

  throw new Error('fail in loja integrada app key verification.')
}

const attachIntegration = async (organizationId: string, jwtSecret: string, type: Integrations, identifier: string, trx: Transaction) => {
  const organizationIntegrationFound = await getIntegrationByOrganizationIdAndType(organizationId, type, trx)

  let secret = await getIntegrationSecretByJwtSecret(jwtSecret, trx)

  if (!secret) {
    secret = await createIntegrationSecret(jwtSecret, trx)
  }

  // await inactiveOtherIntegrationsByOrganizationId(organizationId, type, trx)

  if (organizationIntegrationFound) {
    await updateOrganizationSecret(secret.id, organizationIntegrationFound.id, identifier, trx)
  } else {
    await createOrganizationSecret(secret.id, organizationId, type, identifier, trx)
  }
}

const inactiveOtherIntegrationsByOrganizationId = async (organizationId: string, type: Integrations, trx: Transaction) => {
  await (trx || knexDatabase)('organization_integration_secrets')
    .update({
      active: false,
    })
    .where('organization_id', organizationId)
    .andWhereNot('type', type)
}

const createIntegrationSecret = async (jwtSecret: string, trx: Transaction) => {
  const [secretCreated] = await (trx || knexDatabase)('integration_secrets')
    .insert({
      secret: jwtSecret,
    })
    .returning('*')

  return secretCreated
}

const updateOrganizationSecret = async (secretId: string, organizationIntegrationId: string, identifier: string, trx: Transaction) => {
  await (trx || knexDatabase)('organization_integration_secrets')
    .update({
      integration_secrets_id: secretId,
      identifier,
      active: true,
    })
    .where('id', organizationIntegrationId)
    .returning('*')
}

const createOrganizationSecret = async (secretId: string, organizationId: string, type: Integrations, identifier: string, trx: Transaction) => {
  await (trx || knexDatabase)('organization_integration_secrets')
    .insert({
      integration_secrets_id: secretId,
      organization_id: organizationId,
      type,
      identifier: identifier,
      active: true,
    })
    .returning('*')
}

const getIntegrationSecretByJwtSecret = async (jwtSecret: string, trx: Transaction) => {
  const secretFound = await (trx || knexDatabase)('integration_secrets').where('secret', jwtSecret).first().select()

  return secretFound
}

const getIntegrationByOrganizationIdAndType = async (organizationId: string, type: Integrations, trx: Transaction) => {
  const organizationIntegrationFound = await (trx || knexDatabase)('organization_integration_secrets').where('organization_id', organizationId).andWhere('type', type).first().select()

  return organizationIntegrationFound
}

const verifyIntegration = async (organizationId: string) => {
  const integration = await organizationServicesByOrganizationIdLoader().load(organizationId)

  return integration
    ? {
        type: integration.type,
        status: integration.active,
        asSaas: integration.type === Integrations.KLIPFOLIO || integration.type === Integrations.IUGU,
        createdAt: integration.createdAt,
        updatedAt: integration.updatedAt,
      }
    : null
}

const getIntegrationByOrganizationId = async (organizationId: string, trx?: Transaction) => {
  const integration = await (trx || knexDatabase.knexConfig)('organization_integration_secrets AS ois')
    .innerJoin('integration_secrets AS is', 'is.id', 'ois.integration_secrets_id')
    .where('ois.organization_id', organizationId)
    .andWhere('active', true)
    .first()
    .select('*')

  return integration
}

export default {
  createIntegration,
  verifyIntegration,
  getIntegrationByOrganizationId,
  verifyLojaIntegradaSecrets,
  createIuguIntegration,
  createKlipfolioIntegration,
}
