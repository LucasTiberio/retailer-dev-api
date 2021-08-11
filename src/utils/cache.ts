import redisClient from '../lib/Redis'

export const cacheManager = async <T>(options: {
  key: string, 
  shouldCacheIfEmpty?: boolean, 
  clean?: boolean, 
  replace?: boolean, 
  data?: T, 
  expirationTime?: number 
}): Promise<T | null> => {
  const { key, shouldCacheIfEmpty, clean, replace, data, expirationTime = 86400 } = options

  const cached = await redisClient.getAsync(key);

  if (cached) return JSON.parse(cached) as T;

  if ((shouldCacheIfEmpty || replace) && data) {
    await redisClient.setAsync(key, JSON.stringify(data), 'EX', expirationTime)

    return data as T;
  }

  if (clean) {
    await redisClient.del(key);
  }

  return null;
};