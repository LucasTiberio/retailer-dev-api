import common from '../../common'
import MailService from '../mail/service'
import LojaIntegradaMailService from '../mail/loja-integrada'
import MadesaMailService from '../mail/madesa'
import { ISignUp, IChangePassword, ISignUpFromDB, EUserPendencies, UserPendencies, IDocumentType, AgideskAuthenticateResponse, AgideskCreateUserPayload, IUpdateUserInformationPayload } from './types'
import { Transaction } from 'knex'
import database from '../../knex-database'
import knexDatabase from '../../knex-database'
import { IUserToken } from '../authentication/types'
import OrganizationService from '../organization/service'
import ServicesService from '../services/service'
import WhiteLabelService from '../white-label/service'
import UserOrganizationsService from '../users-organizations/service'
import { RedisClient } from 'redis'
import { AGIDESK_PASSWORD, AGIDESK_URL, AGIDESK_USER, CREATE_ORGANIZATION_WITHOUT_INTEGRATION_SECRET } from '../../common/envs'
import { IncomingHttpHeaders } from 'http'
import { DEFAULT_DOMAINS, INDICAE_LI_WHITE_LABEL_DOMAIN, MADESA_WHITE_LABEL_DOMAIN } from '../../common/consts'
import getHeaderDomain from '../../utils/getHeaderDomain'
import { OrganizationInviteStatus, OrganizationRoles } from '../organization/types'
import { ServiceRoles, Services } from '../services/types'
import AppsService from '../apps/service'
import AppsStoreService from '../app-store/service'
import { IBaseMail } from '../mail/types'
import GrowPowerMailService from '../mail/grow-power'
import { GROW_POWER_WHITE_LABEL_DOMAIN } from '../../common/consts'
import { InviteStatus } from '../users-organizations/types'
import moment from 'moment'
import Axios from 'axios'
import getWithEncodedParameters from '../../utils/getWithEncodedParameters'
import redisClient from '../../lib/Redis'
import generateRandomNumber from '../../utils/generate-random-number'

const _signUpAdapter = (record: ISignUpFromDB) => ({
  username: record.username,
  email: record.email,
  id: record.id,
  document: record.document,
  documentType: record.document_type,
  phone: record.phone,
  gender: record.gender,
  birthDate: record.birth_date,
  position: record.position
})


const signUpWithEmailOnly = async (email: string, trx: Transaction) => {
  const [partialSignUpCreated] = await (trx || database.knexConfig)
    .insert({
      email: email.toLowerCase(),
    })
    .into('users')
    .returning('*')

  return partialSignUpCreated
}

const signUpWithEmailPhoneNameDocument = async (
  infos: {
    email: string
    phone: string
    username: string
    document: string
    documentType: IDocumentType
  },
  trx: Transaction
) => {
  const [partialSignUpCreated] = await (trx || database.knexConfig)
    .insert({
      email: infos.email.toLowerCase(),
      phone: infos.phone,
      username: infos.username,
      document: infos.document,
      document_type: infos.documentType,
    })
    .into('users')
    .returning('*')

  return partialSignUpCreated
}

const resendConfirmationEmail = async (userId: string, context: { headers: IncomingHttpHeaders }, trx: Transaction) => {
  const user = await getUserById(userId, trx)

  if (!user) throw new Error('user_not_found')

  const { email, username, verification_hash } = user

  try {
    const whiteLabelInfo = await WhiteLabelService.getWhiteLabelInfosDomain(context, trx)
    await MailService.sendSignUpMail({ email, username, hashToVerify: verification_hash, whiteLabelInfo })

    return true
  } catch (error) {
    throw new Error(error.message)
  }
}

const signUp = async (attrs: ISignUp, context: { headers: IncomingHttpHeaders }, trx: Transaction) => {
  const { username, password, email, document, documentType, phone, birthDate: rawBirthDate, gender, position } = attrs

  if (!document) {
    throw new Error('document_is_required')
  }

  if (!documentType) {
    throw new Error('documentType_is_required')
  }
  
  if (!email) {
    throw new Error('username_is_required')
  }

  if (!common.verifyPassword(password))
    throw new Error(`Password must contain min ${common.PASSWORD_MIN_LENGTH} length and max ${common.PASSWORD_MAX_LENGTH} length, uppercase, lowercase, special caracter and number.`)

  const [userPreAddedFound] = await (trx || knexDatabase.knexConfig)('users').whereRaw('LOWER(email) = LOWER(?)', email).select('id', 'encrypted_password', 'username')

  if (userPreAddedFound && userPreAddedFound.encrypted_password) throw new Error('user already registered.')

  let organizationIdFoundByDomain

  const origin = context.headers.origin
  const domain = getHeaderDomain(origin || '')

  const whiteLabelInfo = await WhiteLabelService.getWhiteLabelInfosDomain(context, trx)

  if (whiteLabelInfo) {
    organizationIdFoundByDomain = whiteLabelInfo.organizationId
  }

  const encryptedPassword = await common.encrypt(password)
  const encryptedHashVerification = await common.encryptSHA256(JSON.stringify({ username, password, email, timestamp: +new Date() }))
  const birthDate = rawBirthDate ? moment(rawBirthDate).format('YYYY-MM-DD') : null

  let signUpCreated: ISignUpFromDB[]

  try {
    if (userPreAddedFound) {
      signUpCreated = await (trx || database.knexConfig)
        .update({
          username,
          encrypted_password: encryptedPassword,
          verification_hash: encryptedHashVerification,
          document,
          document_type: documentType,
          phone,
          gender,
          birth_date: birthDate,
          position
        })
        .where('id', userPreAddedFound.id)
        .into('users')
        .returning('*')

    } else {
      signUpCreated = await (trx || database.knexConfig)
        .insert({
          username,
          email: email.toLowerCase(),
          encrypted_password: encryptedPassword,
          verification_hash: encryptedHashVerification,
          document,
          document_type: documentType,
          phone,
          gender,
          birth_date: birthDate,
          position
        })
        .into('users')
        .returning('*')
    }

    await (trx || database.knexConfig)('users_organizations')
      .update({
        invite_hash: null
      })
      .where('user_id', signUpCreated[0].id)

    if (organizationIdFoundByDomain && !userPreAddedFound) {
      const organization = await OrganizationService.getOrganizationById(organizationIdFoundByDomain, trx)

      const [serviceOrganizationFound] = await ServicesService.serviceOrganizationByName(organization.id, Services.AFFILIATE, trx)

      if (!serviceOrganizationFound) throw new Error('Organization doesnt have this service')

      const userOrganizationCreated = await OrganizationService.organizationRolesAttach(
        signUpCreated[0].id,
        organization.id,
        OrganizationRoles.MEMBER,
        organization.public ? OrganizationInviteStatus.ACCEPT : OrganizationInviteStatus.PENDENT,
        trx,
        undefined,
        true
      )

      await ServicesService.attachUserInOrganizationAffiliateService(
        {
          userOrganizationId: userOrganizationCreated.id,
          role: ServiceRoles.ANALYST,
          organizationId: organization.id,
          serviceOrganization: serviceOrganizationFound,
        },
        trx
      )
    }

    if (INDICAE_LI_WHITE_LABEL_DOMAIN.includes(domain)) {
      await LojaIntegradaMailService.sendSignUpMail({ email: signUpCreated[0].email, username: signUpCreated[0].username, hashToVerify: signUpCreated[0].verification_hash })
    } else if (MADESA_WHITE_LABEL_DOMAIN.includes(domain)) {
      await MadesaMailService.sendSignUpMail({ email: signUpCreated[0].email, username: signUpCreated[0].username, hashToVerify: signUpCreated[0].verification_hash })
    } else if (GROW_POWER_WHITE_LABEL_DOMAIN.includes(domain)) {
      const whiteLabelInfo = await WhiteLabelService.getWhiteLabelInfosDomain(context, trx)
      await GrowPowerMailService.sendSignUpMail({ email: signUpCreated[0].email, username: signUpCreated[0].username, hashToVerify: signUpCreated[0].verification_hash, whiteLabelInfo })
    } else {
      await MailService.sendSignUpMail({ email: signUpCreated[0].email, username: signUpCreated[0].username, hashToVerify: signUpCreated[0].verification_hash, whiteLabelInfo })
    }

    return { ..._signUpAdapter(signUpCreated[0]), token: common.generateJwt(signUpCreated[0].id, 'user') }
  } catch (e) {
    console.log(e)
    trx.rollback()
    throw new Error(e.message)
  }
}

const signUpWithOrganization = async (
  input: ISignUp & {
    organizationInfos: {
      organization: {
        name: string
        contactEmail: string
        phone: string
        document: string
        address: {
          cep: string
          address: string
          number: string
          complement?: string
          neighbourhood: string
          city: string
          state: string
        }
      }
      additionalInfos: {
        segment: string
        resellersEstimate: number
        reason: string
        plataform: string
      }
      teammates: {
        emails: string[]
      }
    }
  },
  context: { redisClient: RedisClient; headers: IncomingHttpHeaders },
  trx: Transaction
) => {
  let organizationCreatedId
  let signUpCreatedUser: ISignUpFromDB | null = null

  try {
    const { username, password, email, document, documentType, phone, birthDate: rawBirthDate, gender, position } = input

    if (!common.verifyPassword(password))
      throw new Error(`Password must contain min ${common.PASSWORD_MIN_LENGTH} length and max ${common.PASSWORD_MAX_LENGTH} length, uppercase, lowercase, special caracter and number.`)

    const [userPreAddedFound] = await (trx || knexDatabase.knexConfig)('users').whereRaw('LOWER(email) = LOWER(?)', email).select('id', 'encrypted_password', 'username')

    if (userPreAddedFound && (userPreAddedFound.encrypted_password || userPreAddedFound.username)) throw new Error('user already registered.')

    const encryptedPassword = await common.encrypt(password)
    const encryptedHashVerification = await common.encryptSHA256(JSON.stringify({ username, password, email, timestamp: +new Date() }))
    const birthDate = rawBirthDate ? moment(rawBirthDate).format('YYYY-MM-DD') : null

    let signUpCreated: ISignUpFromDB[]

    if (userPreAddedFound) {
      signUpCreated = await (trx || database.knexConfig)
        .update({
          username,
          encrypted_password: encryptedPassword,
          verification_hash: encryptedHashVerification,
          document,
          document_type: documentType,
          phone,
          gender,
          birth_date: birthDate,
          position
        })
        .where('id', userPreAddedFound.id)
        .into('users')
        .returning('*')
    } else {
      signUpCreated = await (trx || database.knexConfig)
        .insert({
          username,
          email: email.toLowerCase(),
          encrypted_password: encryptedPassword,
          verification_hash: encryptedHashVerification,
          document,
          document_type: documentType,
          phone,
          gender,
          birth_date: birthDate,
          position
        })
        .into('users')
        .returning('*')
    }

    const organizationCreated = await OrganizationService.createOrganization(
      input.organizationInfos,
      {
        client: {
          id: signUpCreated[0].id,
          origin: 'user',
        },
        redisClient: context.redisClient,
        createOrganizationWithoutIntegrationSecret: CREATE_ORGANIZATION_WITHOUT_INTEGRATION_SECRET,
        headers: context.headers
      },
      trx
    )

    let HEADER_HOST = (context.headers.origin || '').split('//')[1].split(':')[0]
    if (INDICAE_LI_WHITE_LABEL_DOMAIN.includes(HEADER_HOST)) {
      await LojaIntegradaMailService.sendSignUpMail({ email: signUpCreated[0].email, username: signUpCreated[0].username, hashToVerify: signUpCreated[0].verification_hash })
    } else if (GROW_POWER_WHITE_LABEL_DOMAIN.includes(HEADER_HOST)) {
      const whiteLabelInfo = await WhiteLabelService.getWhiteLabelInfosDomain(context, trx)
      await GrowPowerMailService.sendSignUpMail({ email: signUpCreated[0].email, username: signUpCreated[0].username, hashToVerify: signUpCreated[0].verification_hash, whiteLabelInfo })
    } else {
      const whiteLabelInfo = await WhiteLabelService.getWhiteLabelInfosDomain(context, trx)
      await MailService.sendSignUpMail({ email: signUpCreated[0].email, username: signUpCreated[0].username, hashToVerify: signUpCreated[0].verification_hash, whiteLabelInfo })
    }

    organizationCreatedId = organizationCreated.id
    signUpCreatedUser = signUpCreated[0] as ISignUpFromDB

    // await sendContactToAgidesk({
    //   fullname: signUpCreatedUser.username,
    //   customertitle: organizationCreated.name,
    //   customercode: input.organizationInfos.organization.document,
    //   email: signUpCreatedUser.email,
    //   password: input.password,
    //   status_id: 2,
    //   step: 'tour'
    // })

    return { ..._signUpAdapter(signUpCreated[0]), token: common.generateJwt(signUpCreated[0].id, 'user') }
  } catch (error) {
    console.log(error.message)
    organizationCreatedId = null
    signUpCreatedUser = null
    await trx.rollback()
    throw new Error(error.message)
  } finally {
    // if (organizationCreatedId && signUpCreatedUser && input.organizationInfos.teammates?.emails?.length) {
    //   OrganizationService.inviteUnlimitedTeammates({ ...input.organizationInfos.teammates, unlimited: true }, {
    //     organizationId: organizationCreatedId,
    //     client: {
    //       id: signUpCreatedUser.id,
    //       origin: 'user',
    //     },
    //     headers: context.headers as IncomingHttpHeaders
    //   }, trx)
    // }
  }
}

const verifyEmail = async (hash: string, trx: Transaction) => {
  try {
    const [user] = await (trx || database.knexConfig)('users').where('verification_hash', hash).select()

    if (!user) return true

    await (trx || database.knexConfig)('users').select().where('verification_hash', hash).update({ verified: true, verification_hash: null })

    return true
  } catch (e) {
    throw new Error(e.message)
  }
}

const isUserVerified = async (client: IUserToken, trx: Transaction) => {
  if (!client) throw new Error('Token must be provided.')

  const user = await getUserById(client.id, trx)

  return user.verified
}

const getOrganizationsWaitingForApproval = async (context: { client: IUserToken } ,trx: Transaction) => {
  const { client } = context

  if (!client) throw new Error('Token must be provided.')

  const pendingOrganizations = await UserOrganizationsService.getOrganizationsWaitingForAdminApproval(client.id, trx)

  return pendingOrganizations
}

const getUserByEmail = async (email: string, trx: Transaction) => {
  const [user] = await (trx || database.knexConfig)('users').where('email', email.toLowerCase()).select()

  return user
}

const getUserById = async (id: string, trx?: Transaction) => {
  const [user] = await (trx || database.knexConfig)('users').where('id', id).select()

  return user
}

const getUser = async (client: IUserToken, trx?: Transaction) => {
  if (!client) throw new Error('Token must be provided.')

  const user = getUserById(client.id, trx)

  return user
}

const getUserByNameOrEmail = async (name: string, trx?: Transaction) => {
  const user = await (trx || database.knexConfig)('users')
    .whereRaw(`LOWER(email) LIKE ?`, [`%${name.toLowerCase()}%`])
    .orWhereRaw(`LOWER(username) LIKE ?`, [`%${name.toLowerCase()}%`])
    .select()

  return user
}

const recoveryPassword = async (email: string, context: { headers: IncomingHttpHeaders }, trx: Transaction) => {
  const user = await getUserByEmail(email, trx)

  if (!user) throw new Error('E-mail not found.')

  try {
    const encryptedHashVerification = await common.encryptSHA256(JSON.stringify({ email, timestamp: +new Date() }))

    let HEADER_HOST = (context.headers.origin || '').split('//')[1].split(':')[0]
    if (INDICAE_LI_WHITE_LABEL_DOMAIN.includes(HEADER_HOST)) {
      await LojaIntegradaMailService.sendRecoveryPasswordMail({
        email: user.email,
        username: user.username,
        hashToVerify: encryptedHashVerification,
      })
    } else if (MADESA_WHITE_LABEL_DOMAIN.includes(HEADER_HOST)) {
      await MadesaMailService.sendRecoveryPasswordMail({
        email: user.email,
        username: user.username,
        hashToVerify: encryptedHashVerification,
      })
    } else if (GROW_POWER_WHITE_LABEL_DOMAIN.includes(HEADER_HOST)) {
      await GrowPowerMailService.sendRecoveryPasswordMail({
        email: user.email,
        username: user.username,
        hashToVerify: encryptedHashVerification,
      })
    } else {
      const whiteLabelInfo = await WhiteLabelService.getWhiteLabelInfosDomain(context, trx)
      await MailService.sendRecoveryPasswordMail({
        email: user.email,
        username: user.username,
        hashToVerify: encryptedHashVerification,
        whiteLabelInfo
      })
    }

    await (trx || database.knexConfig)('users').where('email', email.toLowerCase()).update({ verification_hash: encryptedHashVerification, verified: true })

    return true
  } catch (e) {
    throw new Error(e.message)
  }
}

const changePassword = async (attrs: IChangePassword, context: { headers: IncomingHttpHeaders }, trx: Transaction) => {
  try {
    if (!common.verifyPassword(attrs.password))
      throw new Error(`Password must contain min ${common.PASSWORD_MIN_LENGTH} length and max ${common.PASSWORD_MAX_LENGTH} length, uppercase, lowercase, special caracter and number.`)

    const encryptedPassword = await common.encrypt(attrs.password)

    const [userPasswordChanged] = await (trx || database.knexConfig)('users')
      .where('verification_hash', attrs.hash)
      .update({ encrypted_password: encryptedPassword, verification_hash: null })
      .returning(['email', 'username'])

    let HEADER_HOST = (context.headers.origin || '').split('//')[1].split(':')[0]
    if (INDICAE_LI_WHITE_LABEL_DOMAIN.includes(HEADER_HOST)) {
      await LojaIntegradaMailService.sendRecoveredPasswordMail({ email: userPasswordChanged.email, username: userPasswordChanged.username })
    } else if (MADESA_WHITE_LABEL_DOMAIN.includes(HEADER_HOST)) {
      await MadesaMailService.sendRecoveredPasswordMail({ email: userPasswordChanged.email, username: userPasswordChanged.username })
    } else if (GROW_POWER_WHITE_LABEL_DOMAIN.includes(HEADER_HOST)) {
      await GrowPowerMailService.sendRecoveredPasswordMail({ email: userPasswordChanged.email, username: userPasswordChanged.username })
    } else {
      const whiteLabelInfo = await WhiteLabelService.getWhiteLabelInfosDomain(context, trx)
      await MailService.sendRecoveredPasswordMail({ email: userPasswordChanged.email, username: userPasswordChanged.username, whiteLabelInfo })
    }

    return true
  } catch (e) {
    throw new Error(e.message)
  }
}

const getUserPendencies = async (ctx: { userId: string, organizationId: string, organizationRoles: OrganizationRoles[] }) => {
  const pendencies: UserPendencies[] = []
  const { userId, organizationId } = ctx

  if (ctx.organizationRoles.includes(OrganizationRoles.ADMIN)) {
    return []
  }

  const hasFilledFields = await AppsService.hasFilledFields({ organizationId, userId })
  const hasPendingInvoice = await AppsService.hasInvoicePending({ organizationId, userId }) 

  if (hasFilledFields !== null) {
    if (!hasFilledFields) pendencies.push({
      pendency: EUserPendencies.PLUG_FORM,
    })
  }
  if (hasPendingInvoice !== null) {
    if (hasPendingInvoice) pendencies.push({
      pendency: EUserPendencies.HUBLY_INVOICE
    })
  }

  return pendencies
}

const getPendencyMetadata = async (pendency: EUserPendencies, ctx: { organizationId: string }) => {
  if (pendency === EUserPendencies.PLUG_FORM) {
    const [hublyInvoice] = await AppsStoreService.getInstalledAffiliateStoreApps(ctx.organizationId, 'Hubly Form')

    return hublyInvoice?.id ?? ''
  }

  if (pendency === EUserPendencies.HUBLY_INVOICE) {
    const [hublyInvoice] = await AppsStoreService.getInstalledAffiliateStoreApps(ctx.organizationId, 'Hubly Invoice')

    return hublyInvoice?.id ?? ''
  }
}

const authenticateAgideskUser = async () => {
  const { data } = await Axios.post<AgideskAuthenticateResponse>(
    `${AGIDESK_URL}/api/v1/auth/token`, 
    getWithEncodedParameters({
      username: AGIDESK_USER,
      password: AGIDESK_PASSWORD,
      grant_type: 'password'
    }), 
    { headers: { 'X-Tenant-ID': 'hubly', 'Content-Type': 'application/x-www-form-urlencoded' } }
  )

  return data
}

const createUserInAgidesk = async (payload: AgideskCreateUserPayload, token: string): Promise<boolean> => {
  const { data } = await Axios.post(
    `${AGIDESK_URL}/api/v1/contacts`,
    getWithEncodedParameters<AgideskCreateUserPayload>(payload), 
    { headers: { 'Authorization': `Bearer ${token}`, 'X-Tenant-ID': 'hubly', 'Content-Type': 'application/x-www-form-urlencoded' } }
  )

  return Boolean(data?.id)
}

const sendContactToAgidesk = async (payload: AgideskCreateUserPayload): Promise<boolean> => {
  const response = await authenticateAgideskUser()
  
  return createUserInAgidesk(payload, response.access_token)
}

const confirmRecoveryPasswordCode = async (input: { email: string, code: number }) => {
  const { email, code } = input
  const [emailName] = email.split('@')
  const recoveryPasswordMetadata = await redisClient.getAsync(`recovery_password_${emailName}`)
  const parsedPasswordMetadata = JSON.parse(recoveryPasswordMetadata)
  const existantCode = parsedPasswordMetadata.code

  if (existantCode === code) {
    await redisClient.setAsync(`recovery_password_${emailName}`, JSON.stringify({
      confirmed: true,
      code
    }))

    return true
  }

  throw new Error('invalid_recovery_password_code')
}

const generateSixDigitsCode = async (email: string): Promise<number> => {
  const code = generateRandomNumber()
  const recoveryPasswordMetadata = await redisClient.getAsync(`recovery_password_${email}`)
  const parsedPasswordMetadata = JSON.parse(recoveryPasswordMetadata)
  const alreadyExistantCode = parsedPasswordMetadata?.code

  if (alreadyExistantCode) {
    return alreadyExistantCode
  }

  return +code
}

const sendRecoveryPasswordEmail = async ({ user, code, context }: { user: any, code: number, context: { headers: IncomingHttpHeaders } }, trx: Transaction) => {
  let HEADER_HOST = (context.headers.origin || '').split('//')[1].split(':')[0]

  if (INDICAE_LI_WHITE_LABEL_DOMAIN.includes(HEADER_HOST)) {
    await LojaIntegradaMailService.sendRecoveryPasswordMail({
      email: user.email,
      username: user.username,
      code,
    })
  } else if (MADESA_WHITE_LABEL_DOMAIN.includes(HEADER_HOST)) {
    await MadesaMailService.sendRecoveryPasswordMail({
      email: user.email,
      username: user.username,
      code,
    })
  } else if (GROW_POWER_WHITE_LABEL_DOMAIN.includes(HEADER_HOST)) {
    await GrowPowerMailService.sendRecoveryPasswordMail({
      email: user.email,
      username: user.username,
      code,
    })
  } else {
    const whiteLabelInfo = await WhiteLabelService.getWhiteLabelInfosDomain(context, trx)
    await MailService.sendRecoveryPasswordMail({
      email: user.email,
      username: user.username,
      code,
      whiteLabelInfo
    })
  }
}

const updateUserInformation = async (attrs: IUpdateUserInformationPayload, trx: Transaction) => {
  const { email, ...fieldsToUpdate } = attrs
  const { document, phone, username } = fieldsToUpdate
  const documentType = document.length === 11 ? 'cpf' : 'cnpj'

  if (!document) {
    throw new Error('missing_document')
  }

  if (!phone) {
    throw new Error('missing_phone_number')
  }

  if (!username) {
    throw new Error('missing_username')
  }

  const [user] = await (trx || database.knexConfig)('users')
    .update({ ...fieldsToUpdate, document_type: documentType })
    .where('email', email)
    .returning('*')

  const { 
    username: updatedUsername,
    document: updatedDocument,
    phone: updatedPhone
  } = user

  return {
    username: updatedUsername,
    document: updatedDocument,
    phone: updatedPhone
  }
}

export default {
  signUp,
  resendConfirmationEmail,
  verifyEmail,
  recoveryPassword,
  changePassword,
  getUser,
  getUserByEmail,
  getUserById,
  isUserVerified,
  signUpWithEmailOnly,
  _signUpAdapter,
  getUserByNameOrEmail,
  signUpWithOrganization,
  signUpWithEmailPhoneNameDocument,
  getUserPendencies,
  getPendencyMetadata,
  getOrganizationsWaitingForApproval,
  confirmRecoveryPasswordCode,
  updateUserInformation
}
