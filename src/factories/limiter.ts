import { RateLimiterRedis } from 'rate-limiter-flexible'
import { DEFAULT_IP_POINT_DURATION, DEFAULT_IP_BLOCK_DURATION, DEFAULT_IP_POINTS_LIMIT, DEFAULT_ORG_BLOCK_DURATION, DEFAULT_ORG_POINTS_LIMIT, DEFAULT_ORG_POINT_DURATION } from '../common/consts'
import redisClient from '../lib/Redis'

export const orgLimiterFactory = (key: string) => new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: key,
  points: DEFAULT_ORG_POINTS_LIMIT,
  duration: DEFAULT_ORG_POINT_DURATION,
  blockDuration: DEFAULT_ORG_BLOCK_DURATION,
})

export const ipLimiterFactory = (key: string) => {  
  return new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: key,
    points: DEFAULT_IP_POINTS_LIMIT,
    duration: DEFAULT_IP_POINT_DURATION, // one minute
    blockDuration: DEFAULT_IP_BLOCK_DURATION, // blocks ip one minute if exceeded points
  })
}