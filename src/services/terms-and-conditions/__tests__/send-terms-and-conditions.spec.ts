process.env.NODE_ENV = 'test'
import service from '../service'
import database from '../../../knex-database'
import { Transaction } from 'knex'
import createUserMock from '../../../__mocks__/full/create-user-mock'
import { IUserToken } from '../../authentication/types'
import { IContext } from '../../../common/types'
import knexDatabase from '../../../knex-database'

describe('Organization', () => {
  let trx: Transaction

  let userToken: IUserToken

  let context: {
    client: {
      id: string
    }
  }

  beforeEach(async () => {
    trx = await database.knexConfig.transaction()

    let signUpCreated = await createUserMock(trx)

    userToken = { origin: 'user', id: signUpCreated.id }

    context = { client: userToken }
  })

  afterEach(async () => {
    await trx.rollback()
    await trx.destroy()
    return new Promise((resolve) => {
      resolve()
    })
  })

  it('user should get nullable terms and conditions', async (done) => {
    const [termsAndConditions] = await trx('terms_and_conditions')
      .insert({
        version: 1,
        text: 'teste',
      })
      .returning('*')

    const input = {
      termsAndConditionsId: termsAndConditions.id,
    }

    const userTermsAndConditions = await service.sendTermsAndConditions(input, context, trx)

    expect(userTermsAndConditions).toBeTruthy()

    done()
  })
})
