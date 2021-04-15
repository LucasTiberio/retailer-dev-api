import knexDatabase from '../knex-database'
import redisClient from '../lib/Redis'
import { RateLimiterRedis } from 'rate-limiter-flexible'
import OrganizationService from '../services/organization/service'
import { Request, Response } from 'express'

/* INVITE MEMBER RATE LIMIT */
const ipLimit = 1
const organizationLimit = 1440

const ipLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'invite_member_ip_limit',
  points: ipLimit,
  duration: 60, // one minute
  blockDuration: 60, // blocks ip one minute if exceeded points
})

const orgLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'invite_member_org_limit',
  points: organizationLimit,
  duration: 60 * 60 * 24,
  blockDuration: 60 * 60 * 24,
})

export default async (req: Request, res: Response) => {
  const ipAddress = req.ip

  console.log({ ipAddress })

  const orgId = req.params.organizationId

  console.log({ orgId })

  const resIP = await ipLimiter.get(ipAddress)

  let retrySecs = 0

  if (resIP !== null && resIP.consumedPoints > ipLimit) {
    retrySecs = Math.round(resIP.msBeforeNext / 1000) || 1
  }

  if (retrySecs > 0) {
    res.set('Retry-After', String(retrySecs))
    res.status(429).send({ error: 'Too many requests' })
    return
  }

  retrySecs = 0

  const token = req.headers['x-plugone-api-token']

  console.log({ token })

  if (!token) {
    res.status(400).send({ error: 'Bad request: Token must be provided' })
    return
  }

  let trx = await knexDatabase.knexConfig.transaction()

  const organization = await (trx || knexDatabase.knexConfig)('organizations').where('id', orgId).andWhere('api_key', token).first().select('name', 'id', 'public')

  console.log({ organization })

  if (!organization) {
    res.status(400).send({ error: 'Bad request: Invalid API Key or Organization' })
    return
  }
  const resOrg = await orgLimiter.get(orgId)

  if (resOrg !== null && resOrg.consumedPoints > organizationLimit) {
    retrySecs = Math.round(resOrg.msBeforeNext / 1000) || 1
  }

  if (retrySecs > 0) {
    res.set('Retry-After', String(retrySecs))
    res.status(429).send({ error: 'Too many requests' })
    return
  }

  orgLimiter.consume(orgId)

  console.log({ body: req.body })

  const requestStatus = await OrganizationService.requestAffiliateServiceMembers(req.body, organization.id, organization.name, organization.public, trx)
  if (requestStatus) {
    res.status(200).send({ status: 'success' })
  } else {
    res.status(500).send({ error: 'Internal Server Error' })
  }
}
