import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';

const redisUrl = process.env.REDIS_URL;

export const redis =
  process.env.NODE_ENV === 'development' && !redisUrl
    ? (new RedisMock() as unknown as Redis)
    : new Redis(redisUrl || 'redis://localhost:6379');

redis.on('connect', () => {
  console.log(
    process.env.NODE_ENV === 'development' && !redisUrl
      ? 'Connected to Mock Redis successfully'
      : 'Connected to Redis successfully',
  );
});

redis.on('error', (err: any) => {
  console.error('Redis connection error:', err.message || err);
});
