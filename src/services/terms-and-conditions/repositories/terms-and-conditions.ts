import knexDatabase from '../../../knex-database'
import { Transaction } from 'knex'

const getLastTermsAndConditions = async (trx?: Transaction) => {
  return await (trx || knexDatabase.knex)('terms_and_conditions').select().orderBy('version', 'desc').first()
}

const getTermsAndConditionsByUserId = async (userId: string, trx?: Transaction) => {
  return await (trx || knexDatabase.knex)('users AS usr').innerJoin('terms_and_conditions AS tac', 'tac.id', 'usr.terms_and_conditions_id').where('usr.id', userId).first().select('tac.*')
}

const sendTermsAndConditionsByUserId = async (termsAndConditionsId: string, userId: string, trx?: Transaction) => {
  return await (trx || knexDatabase.knex)('users')
    .update({
      terms_and_conditions_id: termsAndConditionsId,
    })
    .where('id', userId)
    .returning('*')
}

export default {
  getTermsAndConditionsByUserId,
  sendTermsAndConditionsByUserId,
  getLastTermsAndConditions,
}
