import { IUserToken } from '../services/authentication/types'
import { RedisClient } from 'redis'

export interface IPagination {
  offset?: number
  limit?: number
}

export interface IContext {
  client: IUserToken
  organizationId: string
  redisClient?: RedisClient
  isOrganizationAdmin?: boolean
  userServiceOrganizationRolesId?: string
}
