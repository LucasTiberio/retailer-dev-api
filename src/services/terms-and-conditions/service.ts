import { Transaction } from 'knex'

import TermsAndConditionsRepositories from './repositories/terms-and-conditions'
import { IncomingHttpHeaders } from 'http'
import getHeaderDomain from '../../utils/getHeaderDomain'
import WhiteLabelService from '../white-label/service'

/**
 * User get terms and conditions
 * @param context user id
 * @param trx knex transaction
 */
const getTermsAndConditions = async (
  context: {
    client: {
      id: string
    },
    headers: IncomingHttpHeaders
  },
  trx?: Transaction
) => {
  const userTermsAndConditions = await TermsAndConditionsRepositories.getTermsAndConditionsByUserId(context.client.id, trx)

  const lastTermsAndConditions = await TermsAndConditionsRepositories.getLastTermsAndConditions(trx)

  if (!userTermsAndConditions && !lastTermsAndConditions) return null

  if (userTermsAndConditions?.id === lastTermsAndConditions?.id) {
    return {
      status: true,
    }
  }

  const origin = context.headers.origin

  const domain = getHeaderDomain(origin || '')

  const whiteLabelInfos = await WhiteLabelService.getWhiteLabelInfosByDomain(domain, trx)

  return {
    status: false,
    termsAndConditionsId: lastTermsAndConditions.id,
    text: lastTermsAndConditions.text,
    personalizedTermsAndConditions: whiteLabelInfos?.personalizedTermsAndConditions
  }
}

/**
 * user should send terms and conditions readed
 * @param input terms and conditions id
 * @param context user context id
 * @param trx knex transaction
 */
const sendTermsAndConditions = async (
  input: {
    termsAndConditionsId: string
  },
  context: {
    client: {
      id: string
    }
  },
  trx: Transaction
) => {
  try {
    await TermsAndConditionsRepositories.sendTermsAndConditionsByUserId(input.termsAndConditionsId, context.client.id, trx)

    return true
  } catch (error) {
    throw new Error(error.message)
  }
}

export default {
  getTermsAndConditions,
  sendTermsAndConditions,
}
