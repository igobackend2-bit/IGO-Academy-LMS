/**
 * Redis client configuration — Upstash REST API
 * @module config/redis
 */
const { Redis } = require('@upstash/redis');

const client = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Initialise Redis connection (test ping)
 * @returns {Promise<void>}
 */
async function connectRedis() {
  const pong = await client.ping();
  if (pong !== 'PONG') throw new Error('Upstash Redis ping failed');
  console.log('[Redis] Connected to Upstash');
}

module.exports = { redisClient: client, connectRedis };
