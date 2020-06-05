import redis from 'redis';

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT)
});

export default client;