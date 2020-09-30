import * as redis from 'redis'
var bluebird = require('bluebird')

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

declare module 'redis' {
  export interface RedisClient extends NodeJS.EventEmitter {
    getAsync(...args: any[]): Promise<any>
    setAsync(...args: any[]): Promise<any>
  }
}

let client: redis.RedisClient

if(true){

  client = redis.createClient(Number(process.env.REDIS_PORT), process.env.REDIS_HOST);
  
} else {
  client = redis.createClient(Number(process.env.REDIS_PORT), process.env.REDIS_HOST, {
    auth_pass: process.env.REDIS_CACHEKEY,
    tls: { servername: process.env.REDIS_HOST },
  })
}

export default client
