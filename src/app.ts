import prometheusBundle from 'express-prom-bundle'
import express from 'express'
import cors from 'cors'
import server from './server'
import { MONGO_URI } from './common/envs'
import connectMongo from './database'
import { connectPostgres } from './knex-database'
import swaggerOptions from './swagger-options'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import inviteMember from './routes/invite-member'
import ipLimiter from './middlewares/ip-limiter'
import getAffiliateInfo from './routes/get-affiliate-info'
import orgLimiter from './middlewares/org-limiter'
import downloadFile from './routes/download-file'
import getOrder from './routes/get-order'
import getOrders from './routes/get-orders'
import getAffiliates from './routes/get-affiliates'

const logger = require('pino')()
const app = express()

app.use(cors())

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
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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

// Health Check
app.get('/health', async (req, res) => {
  logger.info('Checking health Status')
  res.json({
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
  })
})

app.post('/invite-member/:organizationId', inviteMember)
app.get('/orders/:orderId', ipLimiter, getOrder, orgLimiter)
app.get('/orders', ipLimiter, getOrders, orgLimiter)
app.get('/affiliates/:organizationId', ipLimiter, getAffiliateInfo, orgLimiter)
app.get('/affiliates', ipLimiter, getAffiliates, orgLimiter)
app.get('/download', downloadFile)

const specs = swaggerJsdoc(swaggerOptions)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: false }))

server.applyMiddleware({ app, cors: true })

const port = process.env.PORT || 80

module.exports = app

if (process.env.NODE_ENV !== 'test') app.listen({ port }, () => logger.info(`Application running on port ${port}`))
