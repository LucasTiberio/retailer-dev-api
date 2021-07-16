import redisClient from '../lib/Redis'
import { NextFunction, Request, Response } from 'express'
import { RateLimiterRedis } from 'rate-limiter-flexible'
import UsersOrganizationServiceRoleRepository from '../services/finantial-conciliation/repository/users_organization_service_roles'
import { DEFAULT_IP_BLOCK_DURATION, DEFAULT_IP_POINT_DURATION, DEFAULT_ORG_BLOCK_DURATION, DEFAULT_ORG_POINT_DURATION } from '../common/consts'
import knexDatabase from '../knex-database'

const ipLimit = 1
const organizationLimit = 1440

const ipLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'invite_member_ip_limit',
  points: ipLimit,
  duration: DEFAULT_IP_POINT_DURATION, // one minute
  blockDuration: DEFAULT_IP_BLOCK_DURATION, // blocks ip one minute if exceeded points
})

const orgLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'invite_member_org_limit',
  points: organizationLimit,
  duration: DEFAULT_ORG_POINT_DURATION,
  blockDuration: DEFAULT_ORG_BLOCK_DURATION,
})

export default async (req: Request, res: Response, next: NextFunction) => {
  await knexDatabase.knexConfig.transaction(async (trx) => {
    const affiliates = await UsersOrganizationServiceRoleRepository.getAllAffiliates(req.params.organizationId, trx)

    res.locals.body = affiliates
  })

  next()
}