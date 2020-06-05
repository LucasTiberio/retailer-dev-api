import redis, { RedisClient } from 'redis';

let client: RedisClient;

if(process.env.NODE_ENV === 'test'){

  client = redis.createClient(Number(process.env.REDIS_PORT), process.env.REDIS_HOST);
  
} else {

  console.log("process.env.REDIS_PORT", process.env.REDIS_CACHEKEY)
  console.log("process.env.REDIS_PORT", process.env.REDIS_HOST)
  console.log("process.env.REDIS_PORT", Number(process.env.REDIS_PORT))
  
  client = redis.createClient(Number(process.env.REDIS_PORT), process.env.REDIS_HOST, {
    auth_pass: process.env.REDIS_CACHEKEY,
    tls: { servername: process.env.REDIS_HOST }
  });

}

export default client;