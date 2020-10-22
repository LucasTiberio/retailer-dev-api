process.env.NODE_ENV = 'test'
import service from '../service'
import database from '../../../knex-database'
import { Transaction } from 'knex'
import createOrganizationMock from '../../../__mocks__/full/create-organization-mock'
import { IOrganizationFromDB } from '../../organization/types'

describe('Send affiliate specialist mail (Inside-Sales)', () => {
  let trx: Transaction

  let organizationInserted: IOrganizationFromDB

  beforeEach(async () => {
    trx = await database.knexConfig.transaction()

    organizationInserted = await createOrganizationMock(trx)
  })

  afterEach(async () => {
    await trx.rollback()
    await trx.destroy()
    return new Promise((resolve) => {
      resolve()
    })
  })

  it('should send an email to the desired specialist', async (done) => {
    const input = {
      email: 'spam@spam.com',
    }

    const sendEmailToSpecialist = await service.sendAffiliateInsideSalesSpecialistMail(input, {organizationId: organizationInserted.id}, trx);

    expect(sendEmailToSpecialist).toBeTruthy();
    done();
  });
})
