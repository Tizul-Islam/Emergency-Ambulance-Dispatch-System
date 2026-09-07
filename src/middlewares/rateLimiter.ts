import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../config';

const hasRedis = !!process.env.REDIS_URL;

const createStore = (prefix: string) => {
  if (!hasRedis) return undefined;
  return new RedisStore({
    prefix,
    sendCommand: (...args: string[]) => {
      const client = redis as any;
      if (typeof client.call === 'function') {
        return client.call(args[0], ...args.slice(1));
      }
      const cmd = args[0].toLowerCase();
      return client[cmd](...args.slice(1));
    },
  });
};

export const authLimiter = rateLimit({
  windowMs: 0.5 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per 1 minute
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('rl:auth:'),
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 1 minute.',
  },
});
export const requestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each user to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('rl:req:'),
  keyGenerator: (req) => {
    if (req.user?.id) return req.user.id;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    return (clientIp as string) || 'anonymous';
  },
  message: {
    success: false,
    message: 'You have reached the maximum number of emergency requests for this hour.',
  },
});
