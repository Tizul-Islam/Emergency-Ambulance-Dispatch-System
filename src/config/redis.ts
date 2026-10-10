import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';

const redisUrl = process.env.REDIS_URL;
const isDev = process.env.NODE_ENV !== 'production';

export const isMockRedis = isDev && (!redisUrl || redisUrl.includes('localhost'));

export const redis = isMockRedis
  ? (new RedisMock() as unknown as Redis)
  : new Redis(redisUrl || 'redis://localhost:6379');

redis.on('connect', () => {
  console.log(
    isMockRedis ? 'Connected to Mock Redis successfully' : 'Connected to Redis successfully',
  );
});

redis.on('error', (err: any) => {
  console.error('Redis connection error:', err.message || err);
});
