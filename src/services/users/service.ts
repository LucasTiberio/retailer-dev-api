import common from '../../common'
import MailService from '../mail/service'
import LojaIntegradaMailService from '../mail/loja-integrada'
import { ISignUp, ISignUpAdapted, IChangePassword, ISignUpFromDB } from './types'
import { Transaction } from 'knex'
import database from '../../knex-database'
import knexDatabase from '../../knex-database'
import { IUserToken } from '../authentication/types'
import OrganizationService from '../organization/service'
import { RedisClient } from 'redis'
import { CREATE_ORGANIZATION_WITHOUT_INTEGRATION_SECRET } from '../../common/envs'
import { IncomingHttpHeaders } from 'http'

const _signUpAdapter = (record: ISignUpFromDB) => ({
  username: record.username,
  email: record.email,
  id: record.id,
  document: record.document,
  documentType: record.document_type,
  phone: record.phone,
})

const signUpWithEmailOnly = async (email: string, trx: Transaction) => {
  const [partialSignUpCreated] = await (trx || database.knexConfig)
    .insert({
      email,
    })
    .into('users')
    .returning('*')

  return partialSignUpCreated
}

const signUpWithEmailPhoneName = async (
  infos: {
    email: string
    phone: string
    username: string
  },
  trx: Transaction
) => {
  const [partialSignUpCreated] = await (trx || database.knexConfig)
    .insert({
      email: infos.email,
      phone: infos.phone,
      username: infos.username,
    })
    .into('users')
    .returning('*')

  return partialSignUpCreated
}

const signUp = async (attrs: ISignUp, context: { headers: IncomingHttpHeaders }, trx: Transaction) => {
  const { username, password, email, document, documentType, phone } = attrs

  if (!common.verifyPassword(password))
    throw new Error(`Password must contain min ${common.PASSWORD_MIN_LENGTH} length and max ${common.PASSWORD_MAX_LENGTH} length, uppercase, lowercase, special caracter and number.`)

  const [userPreAddedFound] = await (trx || knexDatabase.knexConfig)('users').whereRaw('LOWER(email) = LOWER(?)', email).select('id', 'encrypted_password', 'username')

  if (userPreAddedFound && userPreAddedFound.encrypted_password) throw new Error('user already registered.')

  const encryptedPassword = await common.encrypt(password)
  const encryptedHashVerification = await common.encryptSHA256(JSON.stringify({ username, password, email, timestamp: +new Date() }))

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
        })
        .where('id', userPreAddedFound.id)
        .into('users')
        .returning('*')
    } else {
      signUpCreated = await (trx || database.knexConfig)
        .insert({
          username,
          email,
          encrypted_password: encryptedPassword,
          verification_hash: encryptedHashVerification,
          document,
          document_type: documentType,
          phone,
        })
        .into('users')
        .returning('*')
    }

    if (context.headers.host?.includes('afiliados.b8one.com')) {
      await LojaIntegradaMailService.sendSignUpMail({ email: signUpCreated[0].email, username: signUpCreated[0].username, hashToVerify: signUpCreated[0].verification_hash })
    } else {
      await MailService.sendSignUpMail({ email: signUpCreated[0].email, username: signUpCreated[0].username, hashToVerify: signUpCreated[0].verification_hash })
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
      }
      additionalInfos: {
        segment: string
        resellersEstimate: number
        reason: string
        plataform: string
      }
    }
  },
  context: { redisClient: RedisClient; headers: IncomingHttpHeaders },
  trx: Transaction
) => {
  try {
    const { username, password, email, document, documentType, phone } = input

    if (!common.verifyPassword(password))
      throw new Error(`Password must contain min ${common.PASSWORD_MIN_LENGTH} length and max ${common.PASSWORD_MAX_LENGTH} length, uppercase, lowercase, special caracter and number.`)

    const [userPreAddedFound] = await (trx || knexDatabase.knexConfig)('users').whereRaw('LOWER(email) = LOWER(?)', email).select('id', 'encrypted_password', 'username')

    if (userPreAddedFound && (userPreAddedFound.encrypted_password || userPreAddedFound.username)) throw new Error('user already registered.')

    const encryptedPassword = await common.encrypt(password)
    const encryptedHashVerification = await common.encryptSHA256(JSON.stringify({ username, password, email, timestamp: +new Date() }))

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
        })
        .where('id', userPreAddedFound.id)
        .into('users')
        .returning('*')
    } else {
      signUpCreated = await (trx || database.knexConfig)
        .insert({
          username,
          email,
          encrypted_password: encryptedPassword,
          verification_hash: encryptedHashVerification,
          document,
          document_type: documentType,
          phone,
        })
        .into('users')
        .returning('*')
    }

    await OrganizationService.createOrganization(
      input.organizationInfos,
      {
        client: {
          id: signUpCreated[0].id,
          origin: 'user',
        },
        redisClient: context.redisClient,
        createOrganizationWithoutIntegrationSecret: CREATE_ORGANIZATION_WITHOUT_INTEGRATION_SECRET,
      },
      trx
    )

    if (context.headers.host?.includes('afiliados.b8one.com')) {
      await LojaIntegradaMailService.sendSignUpMail({ email: signUpCreated[0].email, username: signUpCreated[0].username, hashToVerify: signUpCreated[0].verification_hash })
    } else {
      await MailService.sendSignUpMail({ email: signUpCreated[0].email, username: signUpCreated[0].username, hashToVerify: signUpCreated[0].verification_hash })
    }

    return { ..._signUpAdapter(signUpCreated[0]), token: common.generateJwt(signUpCreated[0].id, 'user') }
  } catch (error) {
    await trx.rollback()
    throw new Error(error.message)
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

const getUserByEmail = async (email: string, trx: Transaction) => {
  const [user] = await (trx || database.knexConfig)('users').where('email', email).select()

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

    if (context.headers.host?.includes('afiliados.b8one.com')) {
      await LojaIntegradaMailService.sendRecoveryPasswordMail({
        email: user.email,
        username: user.username,
        hashToVerify: encryptedHashVerification,
      })
    } else {
      await MailService.sendRecoveryPasswordMail({
        email: user.email,
        username: user.username,
        hashToVerify: encryptedHashVerification,
      })
    }

    await (trx || database.knexConfig)('users').where('email', email).update({ verification_hash: encryptedHashVerification, verified: true })

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

    if (context.headers.host?.includes('afiliados.b8one.com')) {
      await LojaIntegradaMailService.sendRecoveredPasswordMail({ email: userPasswordChanged.email, username: userPasswordChanged.username })
    } else {
      await MailService.sendRecoveredPasswordMail({ email: userPasswordChanged.email, username: userPasswordChanged.username })
    }

    return true
  } catch (e) {
    throw new Error(e.message)
  }
}

export default {
  signUp,
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
  signUpWithEmailPhoneName,
}
