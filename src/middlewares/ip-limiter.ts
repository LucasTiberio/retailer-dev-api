import redisClient from '../lib/Redis'
import { NextFunction, Request, Response } from 'express'
import { RateLimiterRedis } from 'rate-limiter-flexible'
import { ipLimiterFactory } from '../factories/limiter'
import { DEFAULT_IP_POINTS_LIMIT } from '../common/consts'

let ipLimiter: RateLimiterRedis | null

export default async (req: Request, res: Response, next: NextFunction) => {
  const ipAddress = req.ip

  console.log({ ipAddress })

  const orgId = req.params.organizationId

  console.log({ orgId })

  ipLimiter = ipLimiter ?? ipLimiterFactory(`${req.path}_limit`)
  const resIP = await ipLimiter.get(ipAddress)

  console.log({resIP})

  let retrySecs = 0

  if (resIP !== null && resIP.consumedPoints > DEFAULT_IP_POINTS_LIMIT) {
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

  res.locals = {
    retrySecs,
    orgId
  }

  next()
}