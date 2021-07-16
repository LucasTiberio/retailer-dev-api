import { NextFunction, Request, Response } from 'express'
import { RateLimiterRedis } from 'rate-limiter-flexible'
import { DEFAULT_ORG_POINTS_LIMIT } from '../common/consts'
import { orgLimiterFactory } from '../factories/limiter'

let orgLimiter: RateLimiterRedis | null 

export default async (req: Request, res: Response, next: NextFunction) => {
  let { retrySecs } = res.locals
  const { orgId } = res.locals

  orgLimiter = orgLimiter ?? orgLimiterFactory(`${req.path}_limit`)
  const resOrg = await orgLimiter.get(orgId)

  if (resOrg !== null && resOrg.consumedPoints > DEFAULT_ORG_POINTS_LIMIT) {
    retrySecs = Math.round(resOrg.msBeforeNext / 1000) || 1
  }

  if (retrySecs > 0) {
    res.set('Retry-After', String(retrySecs))
    res.status(429).send({ error: 'Too many requests' })
    return
  }

  orgLimiter.consume(orgId)

  res.send(res.locals.body).status(200)
}