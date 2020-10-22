import { UserMock } from '..'
import { Transaction } from 'knex'
import knexDatabase from '../../knex-database'

const createUserMock = async (trx?: Transaction) => {
  const userMock = UserMock()

  const [user] = await (trx || knexDatabase.knexConfig)('users')
    .insert({ ...userMock })
    .returning('*')

  return user
}

export default createUserMock
