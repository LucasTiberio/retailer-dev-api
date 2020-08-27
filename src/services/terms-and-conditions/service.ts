import { Transaction } from 'knex'

import TermsAndConditionsRepositories from './repositories/terms-and-conditions'
import { IContext } from '../../common/types'

/**
 * User get terms and conditions
 * @param context user id
 * @param trx knex transaction
 */
const getTermsAndConditions = async (context: IContext, trx?: Transaction) => {
  const userTermsAndConditions = await TermsAndConditionsRepositories.getTermsAndConditionsByUserId(context.client.id, trx)

  const lastTermsAndConditions = await TermsAndConditionsRepositories.getLastTermsAndConditions(trx)

  if (!userTermsAndConditions && !lastTermsAndConditions) return null

  console.log({ userTermsAndConditions })
  console.log({ lastTermsAndConditions })

  if (userTermsAndConditions?.id === lastTermsAndConditions?.id) {
    return {
      status: true,
    }
  }

  return {
    status: false,
    termsAndConditionsId: lastTermsAndConditions.id,
    text: lastTermsAndConditions.text,
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
  context: IContext,
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
