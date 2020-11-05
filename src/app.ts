import prometheusBundle from 'express-prom-bundle'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import server from './server'
import knexDatabase from './knex-database'
import { MONGO_URI } from './common/envs'
import connectMongo from './database'
import { connectPostgres } from './knex-database'
import redisClient from './lib/Redis'
import { RateLimiterRedis } from 'rate-limiter-flexible'
import OrganizationService from './services/organization/service'

const logger = require('pino')()
const app = express()
const prometheusMiddleware = prometheusBundle({
  includeMethod: true,
  includePath: true,
  metricType: 'summary',
  promClient: {
    collectDefaultMetrics: {},
  },
})

try {
  connectMongo({ databaseUri: MONGO_URI })
  connectPostgres()
} catch (e) {
  logger.error(e.message)
  process.exit(0)
}

app.use(prometheusMiddleware)
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const apiTimeout = 100 * 10000
app.use((req, res, next) => {
  // Set the timeout for all HTTP requests
  req.setTimeout(apiTimeout, () => {
    let err = new Error('Request Timeout')
    next(err)
  })
  // Set the server response timeout for all HTTP requests
  res.setTimeout(apiTimeout, () => {
    let err = new Error('Service Unavailable')
    next(err)
  })
  next()
})

app.get('/', (req, res) => {
  res.send('Hello B8ONE!')
})

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

app.post('/invite-member/:organizationId', async (req, res) => {
  const ipAddress = req.ip
  const orgId = req.params.organizationId

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
  if (!token) {
    res.status(400).send({ error: 'Bad request: Token must be provided' })
    return
  }
  const organization = await knexDatabase.knexConfig('organizations').where('id', orgId).andWhere('api_key', token).first().select()
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
  const requestStatus = await OrganizationService.requestAffiliateServiceMembers(req.body, organization.id)
  if (requestStatus) {
    res.status(200).send({ status: 'success' })
  } else {
    res.status(500).send({ error: 'Internal Server Error' })
  }
})

// Health Check
app.get('/health', async (req, res) => {
  logger.info('Checking health Status')
  res.json({
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
  })
})

server.applyMiddleware({ app, cors: true })

const port = process.env.PORT || 80

module.exports = app

if (process.env.NODE_ENV !== 'test') app.listen({ port }, () => logger.info(`Application running on port ${port}`))
