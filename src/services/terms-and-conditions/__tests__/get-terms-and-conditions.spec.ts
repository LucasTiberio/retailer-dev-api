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

  let context: IContext

  beforeEach(async () => {
    trx = await database.knex.transaction()

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
    const userTermsAndConditions = await service.getTermsAndConditions(context, trx)

    expect(userTermsAndConditions).toBeNull()

    done()
  })

  it('user should get true status terms and conditions', async (done) => {
    const [termsAndConditions] = await trx('terms_and_conditions')
      .insert({
        version: 1,
        text: 'teste',
      })
      .returning('*')

    const input = {
      termsAndConditionsId: termsAndConditions.id,
    }

    await service.sendTermsAndConditions(input, context, trx)

    const userTermsAndConditions = await service.getTermsAndConditions(context, trx)

    expect(userTermsAndConditions).toEqual(
      expect.objectContaining({
        status: true,
      })
    )

    done()
  })

  it('user should get false status terms and conditions', async (done) => {
    const [termsAndConditions] = await trx('terms_and_conditions')
      .insert({
        version: 1,
        text: 'teste',
      })
      .returning('*')

    const input = {
      termsAndConditionsId: termsAndConditions.id,
    }

    await service.sendTermsAndConditions(input, context, trx)

    const [newTerms] = await trx('terms_and_conditions')
      .insert({
        version: 2,
        text: 'teste2',
      })
      .returning('*')

    const userTermsAndConditions = await service.getTermsAndConditions(context, trx)

    expect(userTermsAndConditions).toEqual({
      status: false,
      termsAndConditionsId: newTerms.id,
      text: newTerms.text,
    })

    done()
  })
})
