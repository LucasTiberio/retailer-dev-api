require('dotenv')
import axios from 'axios'
import { IOrganizationPayload, OrganizationRoles, OrganizationInviteStatus, IResponseInvitePayload, IFindUsersAttributes } from './types'
import { IUserToken } from '../authentication/types'
import { Transaction } from 'knex'
import database from '../../knex-database'
import MailService from '../mail/service'
import LojaIntegradaMailService from '../mail/loja-integrada'
import OrganizationRulesService from '../organization-rules/service'
import IntegrationsService from '../integration/service'
import VtexService from '../vtex/service'
import UserService from '../users/service'
import ServicesService from '../services/service'
import PaymentService from '../payments/service'
import WhiteLabelService from '../white-label/service'
import StorageService from '../storage/service'
import knexDatabase from '../../knex-database'
import common from '../../common'
import { IUserOrganizationDB, IOrganizationAdittionalInfos } from './types'
import sharp from 'sharp'
import { IPagination, IContext } from '../../common/types'
import { Services, ServiceRoles } from '../services/types'
import { RedisClient } from 'redis'
import {
  MESSAGE_ERROR_USER_NOT_IN_ORGANIZATION,
  MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED,
  FREE_TRIAL_DAYS,
  MESSAGE_ERROR_UPGRADE_PLAN,
  MESSAGE_ERROR_USER_NOT_TEAMMATE,
  MESSAGE_ERROR_ORGANIZATION_SERVICE_DOES_NOT_EXIST,
  MESSAGE_ERROR_USER_TEAMMATE,
  MESSAGE_ERROR_USER_ALREADY_REPLIED_INVITE,
  INDICAE_LI_WHITE_LABEL_DOMAIN,
} from '../../common/consts'
import { stringToSlug } from './helpers'
import { _organizationRoleAdapter, _organizationAdapter, _usersOrganizationsAdapter, _usersOrganizationsRolesAdapter } from './adapters'
import { organizationByIdLoader, organizationByUserIdLoader, organizationRoleByUserIdLoader, organizationHasMemberLoader, organizationHasAnyMemberLoader } from './loaders'
import moment from 'moment'
import { onlyCreateOrganizationWithouIntegrationWithSecret, organizationDoestNotHaveActiveIntegration, userAlreadyRegistered } from '../../common/errors'

/** Repositories */
import Repository from './repositories/organizations'

/** Clients */
import fetchVtexDomains from './clients/fetch-domains'

/** Services */
import IntegrationService from '../integration/service'
import { Integrations } from '../integration/types'
import { CREATE_ORGANIZATION_WITHOUT_INTEGRATION_SECRET } from '../../common/envs'
import { InviteStatus } from '../users-organizations/types'
import { IncomingHttpHeaders } from 'http'

const ordersServiceUrl = process.env.ORDER_SERVICE_URL

const lojaIntegradaOrgId = '7c797775-f56e-43af-98b3-13d4aa5ac6cb'

const attachOrganizationAditionalInfos = async (input: IOrganizationAdittionalInfos, trx: Transaction) => {
  const { segment, resellersEstimate, reason, plataform } = input

  const [attachedOrganizationInfosId] = await (trx || knexDatabase.knexConfig)('organization_additional_infos')
    .insert({
      segment,
      resellers_estimate: resellersEstimate,
      reason,
      plataform,
    })
    .returning('id')

  return attachedOrganizationInfosId
}

const createOrganization = async (
  createOrganizationPayload: IOrganizationPayload,
  context: { redisClient: RedisClient; client: IUserToken; createOrganizationWithoutIntegrationSecret?: string },
  trx: Transaction
) => {
  const {
    organization: { name, contactEmail, phone },
    integration,
  } = createOrganizationPayload

  try {
    const [organizationFound] = await (trx || knexDatabase.knexConfig)('organizations').where('user_id', context.client.id).select()

    // if (process.env.NODE_ENV === 'production') {
    //   if (organizationFound) {
    //     throw new Error('Only 1 organization per account an available')
    //   }
    // }

    if (
      (!context.createOrganizationWithoutIntegrationSecret && !integration) ||
      (!integration && context.createOrganizationWithoutIntegrationSecret !== CREATE_ORGANIZATION_WITHOUT_INTEGRATION_SECRET)
    ) {
      throw new Error(onlyCreateOrganizationWithouIntegrationWithSecret)
    }

    if (integration?.type && integration.secrets && integration.type === Integrations.VTEX) {
      await VtexService.verifyVtexSecrets(integration.secrets)
    } else if (integration?.type && integration.secrets && integration.type === Integrations.LOJA_INTEGRADA) {
      await IntegrationService.verifyLojaIntegradaSecrets(integration.secrets)
    }

    const attachedOrganizationInfosId = await attachOrganizationAditionalInfos(createOrganizationPayload.additionalInfos, trx)

    const [organizationCreated] = await (trx || database.knexConfig)
      .insert({
        name,
        contact_email: contactEmail,
        user_id: context.client.id,
        slug: stringToSlug(name),
        phone,
        free_trial: true,
        free_trial_expires: moment().add(FREE_TRIAL_DAYS, 'days'),
        organization_additional_infos_id: attachedOrganizationInfosId,
      })
      .into('organizations')
      .returning('*')

    if (integration && integration.secrets && integration.type) {
      await IntegrationService.createIntegration(
        {
          secrets: integration.secrets,
          type: integration.type,
        },
        {
          organizationId: organizationCreated.id,
        },
        trx
      )
    }

    await organizationRolesAttach(context.client.id, organizationCreated.id, OrganizationRoles.ADMIN, OrganizationInviteStatus.ACCEPT, trx)

    const affiliateServiceFound = await ServicesService.getServiceByName(Services.AFFILIATE, trx)

    if (!affiliateServiceFound) throw new Error('Affiliate service doesnt exists.')

    await ServicesService.createServiceInOrganization(affiliateServiceFound.id, organizationCreated.id, context.client, trx)

    await setCurrentOrganization({ organizationId: organizationCreated.id }, { client: context.client, redisClient: context.redisClient }, trx)

    return _organizationAdapter(organizationCreated)
  } catch (e) {
    throw new Error(e.message)
  }
}

const verifyOrganizationName = async (name: string, trx: Transaction) => {
  const organizationFound = await (trx || knexDatabase.knexConfig)('organizations').where('name', name).select()

  return !!organizationFound.length
}

const organizationRolesAttach = async (
  userId: string,
  organizationId: string,
  roleName: OrganizationRoles,
  inviteStatus: OrganizationInviteStatus,
  trx: Transaction,
  hashToVerify?: string,
  isRequested?: boolean
) => {
  const organizationRole = await organizationRoleByName(roleName, trx)

  if (!organizationRole) throw new Error('Organization role not found.')

  const [userOrganizationCreated] = await (trx || knexDatabase.knexConfig)('users_organizations')
    .insert({
      user_id: userId,
      organization_id: organizationId,
      invite_status: inviteStatus,
      invite_hash: hashToVerify,
      is_requested: !!isRequested,
    })
    .returning('*')

  const [organizationRoleId] = await (trx || knexDatabase.knexConfig)('users_organization_roles')
    .insert({
      users_organization_id: userOrganizationCreated.id,
      organization_role_id: organizationRole.id,
    })
    .returning('users_organization_id')

  return _usersOrganizationsAdapter({
    ...userOrganizationCreated,
    organization_role_id: organizationRoleId,
  })
}

const organizationRoleByName = async (roleName: OrganizationRoles, trx: Transaction) => {
  const [organizationRole] = await (trx || knexDatabase.knexConfig)('organization_roles').where('name', roleName).select('id')
  return organizationRole
}

const getOrganizationPaymentsDetails = async (context: { organizationId: string; client: IUserToken }, trx: Transaction) => {
  if (!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED)

  let url = `${ordersServiceUrl}/organization/${context.organizationId}/finantial-conciliation`

  try {
    const { data } = await axios.get(url)

    return data
  } catch (error) {
    console.log(error)
  }
}

const listTeammates = async (context: { organizationId: string }, trx: Transaction) => {
  const teammates = await (trx || knexDatabase.knexConfig)('users_organizations AS uo')
    .innerJoin('users_organization_roles AS uor', 'uor.users_organization_id', 'uo.id')
    .innerJoin('organization_roles AS or', 'or.id', 'uor.organization_role_id')
    .innerJoin('users AS u', 'u.id', 'uo.user_id')
    .where('or.name', OrganizationRoles.ADMIN)
    .andWhere('uo.organization_id', context.organizationId)
    // .andWhere('uo.active', true)
    .select('uo.*', 'or.id as organization_role_id')

  return teammates.map(_usersOrganizationsAdapter)
}

const userTeammatesOrganizationCount = async (organizationId: string, userId: string, emails: string[], trx: Transaction) => {
  const [userOrganizationCreatedId] = await (trx || knexDatabase.knexConfig)('users_organizations AS uo')
    .innerJoin('users_organization_roles AS uor', 'uor.users_organization_id', 'uo.id')
    .innerJoin('organization_roles AS or', 'or.id', 'uor.organization_role_id')
    .innerJoin('users AS u', 'u.id', 'uo.user_id')
    .where('or.name', OrganizationRoles.ADMIN)
    .andWhere('uo.organization_id', organizationId)
    .andWhere('uo.active', true)
    .andWhereNot('uo.user_id', userId)
    .whereNotIn('u.email', emails)
    .count()

  return userOrganizationCreatedId.count
}

const userTeammatesOrganizationCountByUserOrganizationId = async (organizationId: string, userId: string, trx: Transaction) => {
  const [userOrganizationCreatedId] = await (trx || knexDatabase.knexConfig)('users_organizations AS uo')
    .innerJoin('users_organization_roles AS uor', 'uor.users_organization_id', 'uo.id')
    .innerJoin('organization_roles AS or', 'or.id', 'uor.organization_role_id')
    .innerJoin('users AS u', 'u.id', 'uo.user_id')
    .where('or.name', OrganizationRoles.ADMIN)
    .andWhere('uo.organization_id', organizationId)
    .andWhere('uo.active', true)
    .andWhereNot('uo.user_id', userId)
    .count()

  return userOrganizationCreatedId.count
}

const inviteTeammates = async (
  input: {
    emails: string[]
  },
  context: { organizationId: string; client: IUserToken; headers: IncomingHttpHeaders },
  trx: Transaction
) => {
  const affiliateTeammateRules = await OrganizationRulesService.getAffiliateTeammateRules(context.organizationId)

  const maxTeammates = affiliateTeammateRules.maxTeammates

  const currentTeammates = await userTeammatesOrganizationCount(context.organizationId, context.client.id, input.emails, trx)

  const uniqueEmails = [...new Set(input.emails)]

  if (uniqueEmails.length > maxTeammates || Number(currentTeammates) + uniqueEmails.length > maxTeammates) throw new Error(MESSAGE_ERROR_UPGRADE_PLAN)

  const [organization] = await (trx || knexDatabase.knexConfig)('organizations').where('id', context.organizationId).select('name')

  if (!organization) throw new Error('Organization not found.')

  const hasFounder = await isFounderBulk(context.organizationId, input.emails, trx)

  if (hasFounder) {
    throw new Error('Founder doesnt attached a member service')
  }

  try {
    let users = await Promise.all(
      uniqueEmails.map(async (item) => {
        let hashToVerify = await common.encryptSHA256(JSON.stringify({ item, timestamp: +new Date() }))

        const userEmailFound = await UserService.getUserByEmail(item, trx)

        if (userEmailFound) {
          const usersOrganizationFound = await getUserOrganizationByIds(userEmailFound.id, context.organizationId, trx)

          if (usersOrganizationFound) {
            const [userOrganizationCreated] = await (trx || knexDatabase.knexConfig)('users_organizations')
              .update({
                invite_status: OrganizationInviteStatus.PENDENT,
                active: true,
              })
              .where('id', usersOrganizationFound.id)
              .returning('*')

            let HEADER_HOST = (context.headers.origin || '').split('//')[1].split(':')[0]
            if (INDICAE_LI_WHITE_LABEL_DOMAIN.includes(HEADER_HOST)) {
              await LojaIntegradaMailService.sendInviteUserMail({
                email: item,
                hashToVerify,
                organizationName: organization.name,
              })
            } else {
              await MailService.sendInviteUserMail({
                email: item,
                hashToVerify,
                organizationName: organization.name,
              })
            }

            const userInOrganizationService = await ServicesService.getUserInOrganizationServiceByUserOrganizationId({ usersOrganizationId: usersOrganizationFound.id }, trx)

            if (userInOrganizationService.length) {
              await ServicesService.inativeServiceMembersById(
                userInOrganizationService.map((item) => item.id),
                trx
              )

              const adminRole = await getOrganizationRoleByName(OrganizationRoles.ADMIN, trx)

              await (trx || knexDatabase.knexConfig)('users_organization_roles')
                .update({
                  organization_role_id: adminRole.id,
                })
                .where('users_organization_id', usersOrganizationFound.id)
                .returning('*')
            }

            return userOrganizationCreated
          }
        }

        let userEmail = await UserService.getUserByEmail(item, trx)

        if (!userEmail) {
          userEmail = await UserService.signUpWithEmailOnly(item, trx)
        }

        const userOrganizationCreated = await organizationRolesAttach(userEmail.id, context.organizationId, OrganizationRoles.ADMIN, OrganizationInviteStatus.PENDENT, trx, hashToVerify)

        let HEADER_HOST = (context.headers.origin || '').split('//')[1].split(':')[0]
        if (INDICAE_LI_WHITE_LABEL_DOMAIN.includes(HEADER_HOST)) {
          await LojaIntegradaMailService.sendInviteNewUserMail({
            email: userEmail.email,
            hashToVerify,
            organizationName: organization.name,
          })
        } else {
          await MailService.sendInviteNewUserMail({
            email: userEmail.email,
            hashToVerify,
            organizationName: organization.name,
          })
        }

        return userOrganizationCreated
      })
    )

    return users
  } catch (error) {
    throw new Error(error.message)
  }
}

const getUserOrganizationByUserOrganizationId = async (usersOrganizationId: string, trx: Transaction) => {
  const userInOrganizationServices = await (trx || knexDatabase.knexConfig)('users_organizations').where('id', usersOrganizationId)

  return userInOrganizationServices
}

const inviteAffiliateServiceMembers = async (
  input: {
    users: {
      email: string
      role: ServiceRoles
    }[]
  },
  context: { organizationId: string; client: IUserToken; headers: IncomingHttpHeaders },
  trx: Transaction
) => {
  const affiliateTeammateRules = await OrganizationRulesService.getAffiliateTeammateRules(context.organizationId)

  const [organization] = await (trx || knexDatabase.knexConfig)('organizations').where('id', context.organizationId).select('name')

  if (!organization) throw new Error('Organization not found.')

  const integration = await IntegrationsService.getIntegrationByOrganizationId(context.organizationId, trx)

  if (!integration || !integration.active) throw new Error('Integration not implemented')

  const [serviceOrganizationFound] = await ServicesService.serviceOrganizationByName(context.organizationId, Services.AFFILIATE, trx)

  if (!serviceOrganizationFound) throw new Error('Organization doesnt have this service')

  const hasFounder = await isFounderBulk(
    context.organizationId,
    input.users.map((item) => item.email),
    trx
  )

  if (hasFounder) {
    throw new Error('Founder doesnt attached a member service')
  }

  try {
    await ServicesService.verifyAffiliateMaxRules(input.users, affiliateTeammateRules, serviceOrganizationFound.id, trx)

    return await Promise.all(
      input.users.map(async (item) => {
        let hashToVerify = await common.encryptSHA256(JSON.stringify({ ...item, timestamp: +new Date() }))

        let userEmail = await UserService.getUserByEmail(item.email, trx)

        if (userEmail) {
          const usersOrganizationFound = await getUserOrganizationByIds(userEmail.id, context.organizationId, trx)

          if (usersOrganizationFound) {
            const [userOrganizationUpdated] = await (trx || knexDatabase.knexConfig)('users_organizations')
              .update({
                invite_status: usersOrganizationFound.invite_status === OrganizationInviteStatus.ACCEPT ? OrganizationInviteStatus.ACCEPT : OrganizationInviteStatus.PENDENT,
                active: true,
              })
              .where('id', usersOrganizationFound.id)
              .returning('id')
              .returning('*')

            if (usersOrganizationFound.invite_status !== OrganizationInviteStatus.ACCEPT) {
              let HEADER_HOST = (context.headers.origin || '').split('//')[1].split(':')[0]
              if (INDICAE_LI_WHITE_LABEL_DOMAIN.includes(HEADER_HOST)) {
                await LojaIntegradaMailService.sendInviteUserMail({
                  email: item.email,
                  hashToVerify,
                  organizationName: organization.name,
                })
              } else {
                await MailService.sendInviteUserMail({
                  email: item.email,
                  hashToVerify,
                  organizationName: organization.name,
                })
              }
            }

            const organizationAdmin = await getUserOrganizationByUserOrganizationId(usersOrganizationFound.id, trx)

            if (organizationAdmin.length) {
              await changeOrganizationAdminToMember(
                organizationAdmin.map((item) => item.id),
                trx
              )
            }

            const memberOrganizationRole = await getOrganizationRoleByName(OrganizationRoles.MEMBER, trx)

            await ServicesService.attachUserInOrganizationAffiliateService(
              {
                userOrganizationId: usersOrganizationFound.id,
                role: item.role,
                organizationId: context.organizationId,
                serviceOrganization: serviceOrganizationFound,
              },
              trx
            )

            return _usersOrganizationsAdapter({
              ...userOrganizationUpdated,
              organization_role_id: memberOrganizationRole.id,
            })
          }
        } else {
          userEmail = await UserService.signUpWithEmailOnly(item.email, trx)
        }

        const userOrganizationCreated = await organizationRolesAttach(userEmail.id, context.organizationId, OrganizationRoles.MEMBER, OrganizationInviteStatus.PENDENT, trx, hashToVerify)

        await ServicesService.attachUserInOrganizationAffiliateService(
          {
            userOrganizationId: userOrganizationCreated.id,
            role: item.role,
            organizationId: context.organizationId,
            serviceOrganization: serviceOrganizationFound,
          },
          trx
        )

        let HEADER_HOST = (context.headers.origin || '').split('//')[1].split(':')[0]
        if (INDICAE_LI_WHITE_LABEL_DOMAIN.includes(HEADER_HOST)) {
          await LojaIntegradaMailService.sendInviteNewUserMail({
            email: userEmail.email,
            hashToVerify,
            organizationName: organization.name,
          })
        } else {
          await MailService.sendInviteNewUserMail({
            email: userEmail.email,
            hashToVerify,
            organizationName: organization.name,
          })
        }

        return userOrganizationCreated
      })
    )
  } catch (error) {
    let errorMessage = error.message

    throw new Error(errorMessage)
  }
}

const requestAffiliateServiceMembers = async (
  body: {
    email: string
    username: string
    phone: string
  }[],
  organizationId: string,
  organizationName: string,
  organizationPublic: boolean,
  trx: Transaction
) => {
  const integration = await IntegrationsService.getIntegrationByOrganizationId(organizationId, trx)

  if (!integration || !integration.active) throw new Error('Integration not implemented')

  const [serviceOrganizationFound] = await ServicesService.serviceOrganizationByName(organizationId, Services.AFFILIATE, trx)

  if (!serviceOrganizationFound) throw new Error('Organization doesnt have this service')

  const hasFounder = await isFounderBulk(
    organizationId,
    body.map((item) => item.email),
    trx
  )

  if (hasFounder) {
    throw new Error('Founder doesnt attached a member service')
  }

  try {
    await Promise.all(
      body.map(async (item) => {
        let hashToVerify = await common.encryptSHA256(JSON.stringify({ item, timestamp: +new Date() }))

        let userEmail = await UserService.getUserByEmail(item.email, trx)

        if (userEmail) {
          const usersOrganizationFound = await getUserOrganizationByIds(userEmail.id, organizationId, trx)

          if (usersOrganizationFound) {
            return console.log('ja existe')
          }
        } else {
          userEmail = await UserService.signUpWithEmailPhoneName({ ...item }, trx)
        }

        const userOrganizationCreated = await organizationRolesAttach(
          userEmail.id,
          organizationId,
          OrganizationRoles.MEMBER,
          organizationPublic ? OrganizationInviteStatus.ACCEPT : OrganizationInviteStatus.PENDENT,
          trx,
          hashToVerify,
          true
        )

        await ServicesService.attachUserInOrganizationAffiliateService(
          {
            userOrganizationId: userOrganizationCreated.id,
            role: ServiceRoles.SALE,
            organizationId: organizationId,
            serviceOrganization: serviceOrganizationFound,
          },
          trx
        )

        if (organizationPublic) {
          if (organizationId === lojaIntegradaOrgId) {
            await LojaIntegradaMailService.sendInviteNewUserMail({
              email: userEmail.email,
              hashToVerify,
              organizationName: organizationName,
            })
          } else {
            await MailService.sendInviteNewUserMail({
              email: userEmail.email,
              hashToVerify,
              organizationName: organizationName,
            })
          }
        }

        return userOrganizationCreated
      })
    )

    trx.commit()

    return true
  } catch (error) {
    let errorMessage = error.message
    throw new Error(errorMessage)
  }
}

const getOrganizationRoleByName = async (organizationRoleName: OrganizationRoles, trx: Transaction) => {
  const [organizationRole] = await (trx || knexDatabase.knexConfig)('organization_roles').where('name', organizationRoleName).select()

  return organizationRole
}

const changeOrganizationAdminToMember = async (userOrganizationIds: string[], trx: Transaction) => {
  const memberOrganizationRole = await getOrganizationRoleByName(OrganizationRoles.MEMBER, trx)

  await (trx || knexDatabase.knexConfig)('users_organization_roles')
    .update({
      organization_role_id: memberOrganizationRole.id,
    })
    .whereIn('users_organization_id', userOrganizationIds)
}

const responseInvite = async (responseInvitePayload: IResponseInvitePayload, trx: Transaction) => {
  let isResquested = false

  const [user] = await (trx || knexDatabase.knexConfig)('users_organizations AS uo')
    .where('invite_hash', responseInvitePayload.inviteHash)
    .innerJoin('users AS usr', 'usr.id', 'uo.user_id')
    .select('usr.encrypted_password', 'usr.username', 'usr.email', 'usr.phone', 'uo.id AS user_organization_id', 'uo.invite_status', 'uo.is_requested')

  try {
    if (!user) return { status: false, message: userAlreadyRegistered }

    await (trx || knexDatabase.knexConfig)('users_organizations')
      .update({
        invite_hash: null,
        invite_status: isResquested && user.invite_status === InviteStatus.pendent ? InviteStatus.pendent : responseInvitePayload.response,
      })
      .where('invite_hash', responseInvitePayload.inviteHash)

    await (trx || knexDatabase.knexConfig)('users_organization_service_roles')
      .update({
        active: responseInvitePayload.response === OrganizationInviteStatus.ACCEPT,
      })
      .where('users_organization_id', user.user_organization_id)

    if (!user.encrypted_password) {
      return {
        status: false,
        email: user.email,
        username: user.username,
        phone: user.phone,
        requested: user.is_requested,
      }
    }

    return { status: true, requested: user.is_requested }
  } catch (e) {
    throw new Error(e.message)
  }
}

const _usersOrganizationAdapter = (record: IUserOrganizationDB) => ({
  user: {
    id: record.id,
    username: record.username,
    email: record.email,
  },
  inviteStatus: record.invite_status,
})

const findUsersToOrganization = async (findUserAttributes: IFindUsersAttributes, context: { client: IUserToken; organizationId: string }, trx: Transaction) => {
  if (!context.client) throw new Error('token must be provided.')

  const searchTerm = findUserAttributes.name.toLowerCase()

  const userFoundWithResponses = await (trx || knexDatabase.knexConfig).raw(
    `
    SELECT usr.id, usr.username, usr.email, uo.invite_status
    FROM users AS usr
      LEFT JOIN users_organizations AS uo
        ON usr.id = uo.user_id
        AND uo.organization_id = '${context.organizationId}'
      WHERE usr.id <> '${context.client.id}' 
      AND (LOWER(usr.username) LIKE ? OR LOWER(usr.email) LIKE ?) `,
    [`%${searchTerm}%`, `%${searchTerm}%`]
  )

  return userFoundWithResponses.rows.map(_usersOrganizationAdapter)
}

const userOrganizationInviteStatus = async (userId: string, organizationId: string, trx: Transaction) => {
  const [userOrganizationInviteStatusFound] = await (trx || knexDatabase.knexConfig)('users_organizations').where('user_id', userId).andWhere('organization_id', organizationId).select()

  return _usersOrganizationsAdapter(userOrganizationInviteStatusFound)
}

const getUserOrganizationById = async (userOrganizationId: string, trx?: Transaction) => {
  const [userOrganization] = await (trx || knexDatabase.knexConfig)('users_organizations').where('id', userOrganizationId).select()

  return userOrganization ? _usersOrganizationsAdapter(userOrganization) : null
}

const getOrganizationById = async (organizationId: string, trx?: Transaction) => {
  if (trx) {
    const [organization] = await (trx || knexDatabase.knexConfig)('organizations').where('id', organizationId).select()

    return _organizationAdapter(organization)
  }

  const organizations = await organizationByIdLoader().load(organizationId)

  return organizations
}

const getOrganizationByUserId = async (userId: string, organizationId?: string) => {
  if (organizationId) {
    const organization = await knexDatabase
      .knexConfig('users_organizations AS uo')
      .innerJoin('organizations AS org', 'org.id', 'uo.organization_id')
      .where('uo.user_id', userId)
      .andWhere('uo.organization_id', organizationId)
      .select('org.*', 'uo.id AS users_organizations_id', 'uo.user_id')

    return organization.map(_organizationAdapter)
  }

  const organizations = await organizationByUserIdLoader().load(userId)

  return organizations
}

const getOrganizationByName = async (organizationName: string, trx?: Transaction) => {
  const [organization] = await (trx || knexDatabase.knexConfigTest)('organizations').where('name', organizationName).select()

  return _organizationAdapter(organization)
}

const getOrganizationRoleId = async (organizationRoleName: OrganizationRoles, trx: Transaction) => {
  const [organizationRole] = await (trx || knexDatabase.knexConfig)('organization_roles').where('name', organizationRoleName).select()

  return organizationRole
}

const getOrganizationRoleById = async (organizationRoleId: string, trx?: Transaction) => {
  const [organizationRole] = await (trx || knexDatabase.knexConfig)('organization_roles').where('id', organizationRoleId).select()

  return organizationRole
}

const listUsersInOrganization = async (
  listUsersInOrganizationPayload: {
    showActive?: boolean
    name?: string
  } & IPagination,
  context: { client: IUserToken; organizationId: string },
  trx: Transaction
) => {
  if (!context.client) throw new Error('token must be provided.')

  const { name, offset, limit, showActive } = listUsersInOrganizationPayload

  let query = (trx || knexDatabase.knexConfig)('users_organizations AS uo')
    .innerJoin('users AS usr', 'usr.id', 'uo.user_id')
    .innerJoin('users_organization_roles AS uor', 'uor.users_organization_id', 'uo.id')
    .where('uo.organization_id', context.organizationId)
    .whereNot('uo.user_id', context.client.id)

  if (showActive) {
    query.where('uo.active', true)
  }

  if (name) {
    query = query.andWhereRaw(`(LOWER(email) LIKE ? OR LOWER(username) LIKE ?)`, [`%${name.toLowerCase()}%`, `%${name.toLowerCase()}%`])
  }

  var [totalCount] = await query.clone().count()

  if (limit) {
    query = query.limit(limit)
  }

  if (offset) {
    query = query.offset(offset)
  }

  const result = await query.select('uo.*', 'uor.organization_role_id').orderBy('usr.username', 'asc')

  return {
    count: totalCount.count,
    usersOrganizations: result.map(_usersOrganizationsAdapter),
  }
}

const getUserOrganizationByIds = async (userId: string, organizationId: string, trx: Transaction) => {
  const [userOrganization] = await (trx || knexDatabase.knexConfig)('users_organizations').where('user_id', userId).andWhere('organization_id', organizationId).select()

  return userOrganization
}

const getUserOrganizationRoleById = async (userOrganizationId: string, trx: Transaction) => {
  const [userOrganizationRole] = await (trx || knexDatabase.knexConfig)('users_organization_roles').where('users_organization_id', userOrganizationId).select()

  return _usersOrganizationsRolesAdapter(userOrganizationRole)
}

const isOrganizationAdmin = async (userOrganizationId: string, trx: Transaction) => {
  const [userOrganizationRole] = await (trx || knexDatabase.knexConfig)('users_organization_roles AS uor')
    .innerJoin('organization_roles AS or', 'uor.organization_role_id', 'or.id')
    .where('uor.users_organization_id', userOrganizationId)
    .select('or.name')

  return userOrganizationRole.name === OrganizationRoles.ADMIN
}

const isFounder = async (organizationId: string, userId: string, trx: Transaction) => {
  const [organizationFound] = await (trx || knexDatabase.knexConfig)('organizations').where('id', organizationId).select('user_id')

  return organizationFound.user_id === userId
}

const isFounderBulk = async (organizationId: string, usersEmail: string[], trx: Transaction) => {
  const [founder] = await (trx || knexDatabase.knexConfig)('organizations AS org').innerJoin('users AS usr', 'usr.id', 'org.user_id').where('org.id', organizationId).select('usr.email')

  return usersEmail.includes(founder.email)
}

const handleUserPermissionInOrganization = async (
  handleUserPermissionInOrganizationPayload: {
    permission: OrganizationRoles
    userId: string
  },
  context: { organizationId: string; client: IUserToken },
  trx: Transaction
) => {
  if (!context.client) throw new Error('token must be provided.')

  const { permission, userId } = handleUserPermissionInOrganizationPayload

  if (permission === OrganizationRoles.MEMBER && !(await isFounder(context.organizationId, context.client.id, trx))) {
    throw new Error('Only founder can remove admin permission from organization.')
  }

  try {
    const userOrganization = await getUserOrganizationByIds(userId, context.organizationId, trx)

    const newPermission = await getOrganizationRoleId(permission, trx)

    if (!userOrganization) throw new Error('User not found in organization!')

    const [userPermissionUpdated] = await (trx || knexDatabase.knexConfig)('users_organization_roles')
      .update({ organization_role_id: newPermission.id })
      .where('users_organization_id', userOrganization.id)
      .returning('*')

    if (permission === OrganizationRoles.MEMBER) {
      await (trx || knexDatabase.knexConfig)('users_organization_service_roles').update({ active: true }).where('users_organization_id', userOrganization.id)
    } else if (permission === OrganizationRoles.ADMIN) {
      await (trx || knexDatabase.knexConfig)('users_organization_service_roles').update({ active: false }).where('users_organization_id', userOrganization.id)
    }

    return _usersOrganizationsRolesAdapter(userPermissionUpdated)
  } catch (e) {
    throw new Error(e.message)
  }
}

const listMyOrganizations = async (userToken: IUserToken, trx: Transaction) => {
  if (!userToken) throw new Error('token must be provided.')

  try {
    const organizations = await (trx || knexDatabase.knexConfig)('users_organizations AS uo')
      .innerJoin('organizations AS orgn', 'orgn.id', 'uo.organization_id')
      .where('uo.user_id', userToken.id)
      .andWhere('uo.active', true)
      .andWhere('uo.invite_status', InviteStatus.accept)
      .andWhere('orgn.active', true)
      .select('orgn.*', 'uo.id AS users_organizations_id')

    return organizations.map(_organizationAdapter)
  } catch (e) {
    console.log(e)
    throw new Error(e.message)
  }
}

const organizationDetails = async (context: { organizationId: string; client: IUserToken }, trx: Transaction) => {
  if (!context.client) throw new Error('token must be provided.')

  const [organizations] = await (trx || knexDatabase.knexConfig)('users_organizations AS uo')
    .innerJoin('organizations AS orgn', 'orgn.id', 'uo.organization_id')
    .where('uo.user_id', context.client.id)
    .andWhere('uo.active', true)
    .andWhere('orgn.id', context.organizationId)
    .select('orgn.*', 'uo.id AS users_organizations_id')

  return _organizationAdapter(organizations)
}

const getUserOrganizationRole = async (userOrganizationId: string) => {
  const userOrganizationRole = await organizationRoleByUserIdLoader().load(userOrganizationId)

  return userOrganizationRole
}

const verifyOrganizationHasMember = async (organizationId: string) => {
  const userOrganizationRole = await organizationHasMemberLoader().load(organizationId)

  return userOrganizationRole.length > 1
}

const organizationUploadImage = async (
  organizationUploadImagePayload: {
    imageName: string
    mimetype: string
    data: any
  },
  context: { organizationId: string; client: IUserToken },
  trx: Transaction
) => {
  if (!context.client) throw new Error('token must be provided.')

  const { mimetype, data } = organizationUploadImagePayload

  if (!mimetype.match(/\/png/gi)?.length && !mimetype.match(/\/jpg/gi)?.length && !mimetype.match(/\/jpeg/gi)?.length) {
    throw new Error('only image/png and image/jpg is supported!')
  }

  const path = common.encryptSHA256(context.organizationId)

  const pipeline = sharp().resize(248, 160, {
    fit: 'cover',
  })

  let newData

  if (process.env.NODE_ENV !== 'test') newData = await data.pipe(pipeline)

  const imageUploaded = await StorageService.uploadImage(process.env.NODE_ENV === 'test' ? `tdd/${path}` : path, process.env.NODE_ENV === 'test' ? data : newData, mimetype, trx)

  const [organizationAttachLogo] = await (trx || knexDatabase.knexConfig)('organizations')
    .where('id', context.organizationId)
    .update({
      logo: imageUploaded.url,
    })
    .returning('*')

  return _organizationAdapter(organizationAttachLogo)
}

const setCurrentOrganization = async (currentOrganizationPayload: { organizationId: string | null }, context: { client: IUserToken; redisClient: RedisClient }, trx: Transaction) => {
  if (!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED)

  if (!currentOrganizationPayload.organizationId) {
    return context.redisClient.del(context.client.id)
  }

  const isUserOrganization = await getUserOrganizationByIds(context.client.id, currentOrganizationPayload.organizationId, trx)

  if (!isUserOrganization) throw new Error(MESSAGE_ERROR_USER_NOT_IN_ORGANIZATION)

  try {
    const currentOrganization = await context.redisClient.setAsync(context.client.id, currentOrganizationPayload.organizationId)
    return currentOrganization === 'OK'
  } catch (e) {
    throw new Error(e.message)
  }
}

const setCurrentOrganizationReturnInfos = async (currentOrganizationPayload: { organizationId: string | null }, context: { client: IUserToken; redisClient: RedisClient }, trx: Transaction) => {
  if (!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED)

  if (!currentOrganizationPayload.organizationId) {
    return context.redisClient.del(context.client.id)
  }

  const isUserOrganization = await getUserOrganizationByIds(context.client.id, currentOrganizationPayload.organizationId, trx)

  console.log({ isUserOrganization })

  if (!isUserOrganization) throw new Error(MESSAGE_ERROR_USER_NOT_IN_ORGANIZATION)

  try {
    const currentOrganization = await context.redisClient.setAsync(context.client.id, isUserOrganization.organization_id)

    const organization = await organizationDetails({ client: context.client, organizationId: isUserOrganization.organization_id }, trx)

    const getOrganizationWhiteLabelInfos = await WhiteLabelService.getWhiteLabelInfos(isUserOrganization.organization_id, trx)

    getOrganizationWhiteLabelInfos

    if (currentOrganization !== 'OK') {
      return null
    }

    return {
      organization,
      whiteLabelInfos: getOrganizationWhiteLabelInfos,
    }
  } catch (e) {
    throw new Error(e.message)
  }
}

const verifyShowFirstSteps = async (organizationId: string) => {
  const members = await organizationHasAnyMemberLoader().load(organizationId)

  const vtexIntegration = await IntegrationsService.verifyIntegration(organizationId)

  const hasMember = members.length > 1

  return !(vtexIntegration?.status && hasMember)
}

const handleServiceMembersActivity = async (
  inativeServiceMembersInput: {
    userOrganizationId: string
    activity: boolean
    service: Services
  },
  context: { organizationId: string },
  trx: Transaction
) => {
  const { userOrganizationId, activity, service } = inativeServiceMembersInput

  try {
    const organizationService = await ServicesService.getOrganizationServiceByServiceName({ service, organizationId: context.organizationId }, trx)

    if (!organizationService) throw new Error(MESSAGE_ERROR_ORGANIZATION_SERVICE_DOES_NOT_EXIST)

    const userOrganizationServiceRoleFound = await (trx || knexDatabase.knexConfig)('users_organization_service_roles AS uosr')
      .innerJoin('service_roles AS sr', 'sr.id', 'uosr.service_roles_id')
      .where('uosr.id', userOrganizationId)
      .andWhere('uosr.organization_services_id', organizationService.id)
      .first()
      .select('uosr.*', 'sr.name AS service_role_name')

    if (activity) {
      const affiliateTeammateRules = await OrganizationRulesService.getAffiliateTeammateRules(context.organizationId)

      await ServicesService._verifyAffiliateMaxRulesByUserOrganizationServiceId(
        {
          role: userOrganizationServiceRoleFound.service_role_name,
          serviceOrganizationId: organizationService.id,
          userOrganizationServiceRoleId: userOrganizationServiceRoleFound.id,
        },
        affiliateTeammateRules,
        trx
      )
    }

    await (trx || knexDatabase.knexConfig)('users_organization_service_roles').update({ active: activity }).where('id', userOrganizationServiceRoleFound.id)

    const hasMoreServices = await ServicesService.getUserInOrganizationServiceByUserOrganizationId(
      {
        usersOrganizationId: userOrganizationId,
        activity: true,
      },
      trx
    )

    if (!hasMoreServices.length) {
      await _handleMemberActivity(
        {
          userOrganizationId: userOrganizationServiceRoleFound.users_organization_id,
          activity: false,
        },
        trx
      )
    }

    if (activity) {
      await _handleMemberActivity(
        {
          userOrganizationId: userOrganizationServiceRoleFound.users_organization_id,
          activity: true,
        },
        trx
      )
    }

    return true
  } catch (error) {
    throw new Error(error.message)
  }
}

const getUserByUserOrganizationId = async (userOrganizationId: string, trx: Transaction) => {
  const user = await (trx || knexDatabase.knexConfig)('users_organizations AS uo').innerJoin('users AS usr', 'usr.id', 'uo.user_id').where('uo.id', userOrganizationId).first().select('usr.*')

  return user
}

const handleTeammatesActivity = async (input: { userOrganizationId: string; activity: boolean }, context: { organizationId: string; client: IUserToken }, trx: Transaction) => {
  const { userOrganizationId, activity } = input

  const user = await getUserByUserOrganizationId(userOrganizationId, trx)

  const founder = await isFounder(context.organizationId, user.id, trx)

  if (founder) {
    throw new Error('Doesnt handle founder activity')
  }

  const organizationAdmin = await isOrganizationAdmin(userOrganizationId, trx)

  if (!organizationAdmin) throw new Error(MESSAGE_ERROR_USER_NOT_TEAMMATE)

  if (activity) {
    const affiliateTeammateRules = await OrganizationRulesService.getAffiliateTeammateRules(context.organizationId)

    const maxTeammates = affiliateTeammateRules.maxTeammates

    const currentTeammates = await userTeammatesOrganizationCountByUserOrganizationId(context.organizationId, context.client.id, trx)

    if (Number(currentTeammates) >= maxTeammates) {
      throw new Error(MESSAGE_ERROR_UPGRADE_PLAN)
    }
  }

  const [userOrganizationInatived] = await (trx || knexDatabase.knexConfig)('users_organizations').update({ active: activity }).where('id', userOrganizationId).returning('*')

  return _usersOrganizationsAdapter(userOrganizationInatived)
}

const _handleMemberActivity = async (input: { userOrganizationId: string; activity: boolean }, trx: Transaction) => {
  const { userOrganizationId, activity } = input

  const organizationAdmin = await isOrganizationAdmin(userOrganizationId, trx)

  if (organizationAdmin) throw new Error(MESSAGE_ERROR_USER_TEAMMATE)

  const [userOrganizationInatived] = await (trx || knexDatabase.knexConfig)('users_organizations').update({ active: activity }).where('id', userOrganizationId).returning('*')

  return _usersOrganizationsAdapter(userOrganizationInatived)
}

const reinviteServiceMember = async (
  input: {
    userOrganizationId: string
  },
  context: { headers: IncomingHttpHeaders },
  trx: Transaction
) => {
  try {
    const usersOrganizationFound = await (trx || knexDatabase.knexConfig)('users_organizations AS uo')
      .innerJoin('users AS usr', 'usr.id', 'uo.user_id')
      .innerJoin('organizations AS org', 'org.id', 'uo.organization_id')
      .where('uo.id', input.userOrganizationId)
      .first()
      .select()

    if (!usersOrganizationFound.invite_hash) throw new Error(MESSAGE_ERROR_USER_ALREADY_REPLIED_INVITE)

    let HEADER_HOST = (context.headers.origin || '').split('//')[1].split(':')[0]
    if (INDICAE_LI_WHITE_LABEL_DOMAIN.includes(HEADER_HOST)) {
      await LojaIntegradaMailService.sendInviteNewUserMail({
        email: usersOrganizationFound.email,
        hashToVerify: usersOrganizationFound.invite_hash,
        organizationName: usersOrganizationFound.name,
      })
    } else {
      await MailService.sendInviteNewUserMail({
        email: usersOrganizationFound.email,
        hashToVerify: usersOrganizationFound.invite_hash,
        organizationName: usersOrganizationFound.name,
      })
    }

    return true
  } catch (error) {
    throw new Error(error.message)
  }
}

const teammatesCapacities = async (context: { organizationId: string }, trx: Transaction) => {
  const organizationAdminRole = await getOrganizationRoleByName(OrganizationRoles.ADMIN, trx)

  let [query] = await (trx || knexDatabase.knexConfig)('users_organizations AS uo')
    .innerJoin('users_organization_roles AS uor', 'uor.users_organization_id', 'uo.id')
    .where('organization_id', context.organizationId)
    .andWhere('active', true)
    .andWhere('organization_role_id', organizationAdminRole.id)
    .count()

  const affiliateTeammateRules = await OrganizationRulesService.getAffiliateTeammateRules(context.organizationId)

  return {
    teammates: {
      total: affiliateTeammateRules.maxTeammates,
      used: Number(query.count) - 1,
    },
  }
}

const organizationHasBillingPendency = async (organizationId: string) => {
  try {
    const paymentServiceStatus = await PaymentService.getSubscriptionByOrganizationId(organizationId)
    const organizationFound = await knexDatabase.knexConfig('organizations').where('id', organizationId).first().select()
    if (organizationFound.free_plan) {
      return false
    } else if (organizationFound.free_trial) {
      return null
    } else if (moment(paymentServiceStatus.expiresAt).isAfter(moment())) {
      return false
    } else if (moment(organizationFound.free_trial_expires).isAfter(moment())) {
      return false
    }
    return true
  } catch (error) {
    return true
  }
}

const handleOrganizationDomain = async (
  input: {
    domain: string
  },
  context: { organizationId: string },
  trx: Transaction
) => {
  const organizationHandled = await Repository.handleOrganizationDomainById(input.domain, context.organizationId, trx)

  return _organizationAdapter(organizationHandled)
}

const fetchOrganizationDomain = async (
  context: {
    organizationId: string
  },
  trx: Transaction
) => {
  const integration = await IntegrationService.getIntegrationByOrganizationId(context.organizationId, trx)

  if (!integration) throw new Error(organizationDoestNotHaveActiveIntegration)

  const decoded: any = await common.jwtDecode(integration.secret)

  if (integration.type === Integrations.LOJA_INTEGRADA) {
    return []
  }

  const domains = await fetchVtexDomains(decoded)

  return domains.reduce((acc: string[], current: { id: number; name: string; hosts: string[] }) => {
    return acc.concat(current.hosts)
  }, [])
}

const getOrganizationApiKey = async (
  context: {
    organizationId: string
  },
  trx: Transaction
) => {
  const organization = await Repository.getOrganizationById(context.organizationId, trx)

  let apiKey = organization?.apiKey
  if (!apiKey) {
    let newApiKey = common.encryptSHA256(`${organization?.id}${+new Date()}`)
    const dbObject = await Repository.updateApiKeyByOrganizationId(newApiKey, context.organizationId, trx)
    apiKey = dbObject.api_key
  }
  return apiKey
}

const handlePublicOrganization = async (
  input: {
    public: boolean
  },
  context: {
    organizationId: string
  },
  trx: Transaction
) => {
  try {
    return await Repository.updatePublicOrganization(input.public, context.organizationId, trx)
  } catch (error) {
    throw new Error(error.message)
  }
}

export default {
  organizationHasBillingPendency,
  fetchOrganizationDomain,
  reinviteServiceMember,
  handleServiceMembersActivity,
  listUsersInOrganization,
  getOrganizationByName,
  verifyShowFirstSteps,
  organizationDetails,
  organizationUploadImage,
  getUserOrganizationRole,
  setCurrentOrganization,
  verifyOrganizationHasMember,
  listMyOrganizations,
  getOrganizationByUserId,
  handleUserPermissionInOrganization,
  createOrganization,
  getUserOrganizationRoleById,
  handleTeammatesActivity,
  verifyOrganizationName,
  responseInvite,
  getOrganizationRoleById,
  isFounder,
  getUserOrganizationByIds,
  getOrganizationRoleId,
  _organizationAdapter,
  getOrganizationById,
  findUsersToOrganization,
  userOrganizationInviteStatus,
  getUserOrganizationById,
  isOrganizationAdmin,
  inviteTeammates,
  inviteAffiliateServiceMembers,
  listTeammates,
  teammatesCapacities,
  getOrganizationRoleByName,
  handleOrganizationDomain,
  getOrganizationPaymentsDetails,
  getOrganizationApiKey,
  handlePublicOrganization,
  requestAffiliateServiceMembers,
  organizationRolesAttach,
  setCurrentOrganizationReturnInfos,
}
