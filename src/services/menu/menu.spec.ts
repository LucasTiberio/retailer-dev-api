process.env.NODE_ENV = 'test'
import service from './service'
import UserService from '../users/service'
import OrganizationService from '../organization/service'
import ServicesService from '../services/service'
import { createOrganizationPayload } from '../../__mocks__'
import VtexService from '../vtex/service'
import Faker from 'faker'
import database from '../../knex-database'
import { Transaction } from 'knex'
import { ISignUpAdapted } from '../users/types'
import { IUserToken } from '../authentication/types'
import { Services, IServiceAdaptedFromDB, ServiceRoles } from '../services/types'
import { IOrganizationAdapted, OrganizationInviteStatus } from '../organization/types'
import knexDatabase from '../../knex-database'
import { IContext } from '../../common/types'
import { organizationAdminMenu, organizationMemberMenu, affiliateMemberMountMenu } from './helpers'
import redisClient from '../../lib/Redis'
import { PaymentMethod } from '../payments/types'
import { Integrations } from '../integration/types'

describe('Menu', () => {
  let trx: Transaction

  let signUpCreated: ISignUpAdapted

  let signUpPayload = {
    username: Faker.name.firstName(),
    email: Faker.internet.email(),
    password: 'B8oneTeste123!',
  }

  let userToken: IUserToken
  let organizationCreated: IOrganizationAdapted
  let serviceFound: IServiceAdaptedFromDB
  let context: IContext

  beforeAll(async () => {
    trx = await database.knex.transaction()

    const [serviceFoundDB] = await (trx || knexDatabase.knex)('services').where('name', Services.AFFILIATE).select('id')
    serviceFound = serviceFoundDB
  })

  afterAll(async () => {
    await trx.rollback()
    await trx.destroy()
    return new Promise((resolve) => {
      resolve()
    })
  })

  beforeEach(async () => {
    await trx('affiliate_vtex_campaign').del()
    await trx('organization_vtex_secrets').del()
    await trx('users_organization_service_roles').del()
    await trx('users_organization_roles').del()
    await trx('users_organizations').del()
    await trx('organization_services').del()
    await trx('organizations').del()
    await trx('users').del()
    signUpCreated = await UserService.signUp(signUpPayload, trx)
    userToken = { origin: 'user', id: signUpCreated.id }
    organizationCreated = await OrganizationService.createOrganization(createOrganizationPayload(), { client: userToken, redisClient }, trx)
    const [userFromDb] = await (trx || knexDatabase.knex)('users').where('id', signUpCreated.id).select('verification_hash')
    await UserService.verifyEmail(userFromDb.verification_hash, trx)
    context = { client: userToken, organizationId: organizationCreated.id }
  })

  test('organization admin should list menu', async (done) => {
    const listServices = await service.getMenuTree(context, trx)

    expect(listServices).toEqual(organizationAdminMenu)

    done()
  })

  test('organization affiliate analyst should list menu', async (done) => {
    let otherSignUpPayload = {
      username: Faker.name.firstName(),
      email: Faker.internet.email(),
      password: 'B8oneTeste123!',
    }

    let otherSignUpCreated = await UserService.signUp(otherSignUpPayload, trx)
    let otherUserToken = { origin: 'user', id: otherSignUpCreated.id }
    const [otherUserFromDb] = await (trx || knexDatabase.knex)('users').where('id', otherSignUpCreated.id).select('verification_hash')
    await UserService.verifyEmail(otherUserFromDb.verification_hash, trx)
    let otherContext = {
      client: otherUserToken,
      organizationId: organizationCreated.id,
    }

    //add vtex secrets
    const vtexSecrets = {
      xVtexApiAppKey: 'vtexappkey-beightoneagency-NQFTPH',
      xVtexApiAppToken: 'UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO',
      accountName: 'beightoneagency',
    }

    // await VtexService.verifyAndAttachVtexSecrets(vtexSecrets,context, trx);

    const inviteAffiliatesInput = {
      users: [
        {
          email: otherSignUpCreated.email,
          role: ServiceRoles.ANALYST,
        },
      ],
    }

    await OrganizationService.inviteAffiliateServiceMembers(inviteAffiliatesInput, context, trx)

    const listServices = await service.getMenuTree(otherContext, trx)

    expect(listServices).toEqual(affiliateMemberMountMenu(ServiceRoles.ANALYST, Integrations.VTEX, 'xxx'))

    done()
  })
})
