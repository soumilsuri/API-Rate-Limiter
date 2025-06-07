// rateLimiter.middleware.js
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from '../config/redis.js';

// Connect Redis client at module level
if (!redisClient.isOpen) {
  redisClient.connect().catch(console.error);
}

export const initRateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000, // 1 minute
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // Better IP detection for proxies/load balancers
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0].trim() : req.ip;
    console.log('IP:', req.ip); 
    console.log('Rate limit key:', ip); // Debug log
    return ip;
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: 'rl:', // Add prefix to avoid key conflicts
  }),
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
    });
  },
});