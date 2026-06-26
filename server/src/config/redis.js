/**
 * Redis client configuration.
 *
 * - If UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set, uses Upstash
 *   (production / cloud sessions).
 * - Otherwise falls back to an in-memory dev store so the platform runs locally
 *   with zero external dependencies. NOTE: in-memory sessions are per-process and
 *   are lost on server restart — fine for local dev, NOT for production.
 *
 * @module config/redis
 */
const { Redis } = require('@upstash/redis');

/**
 * Minimal in-memory store implementing the subset of the Redis API this app uses:
 * ping, get, set, setex, del, expire. Honors TTL expiry lazily on read.
 * @returns {{ping:Function,get:Function,set:Function,setex:Function,del:Function,expire:Function}}
 */
function createInMemoryStore() {
  /** @type {Map<string, { value: string, expiresAt: number|null }>} */
  const store = new Map();
  const isExpired = (entry) => entry.expiresAt !== null && Date.now() > entry.expiresAt;

  return {
    async ping() { return 'PONG'; },
    async get(key) {
      const entry = store.get(key);
      if (!entry) return null;
      if (isExpired(entry)) { store.delete(key); return null; }
      return entry.value;
    },
    async set(key, value) { store.set(key, { value, expiresAt: null }); return 'OK'; },
    async setex(key, seconds, value) {
      store.set(key, { value, expiresAt: Date.now() + seconds * 1000 });
      return 'OK';
    },
    async del(...keys) {
      let removed = 0;
      for (const key of keys) { if (store.delete(key)) removed += 1; }
      return removed;
    },
    async expire(key, seconds) {
      const entry = store.get(key);
      if (!entry || isExpired(entry)) return 0;
      entry.expiresAt = Date.now() + seconds * 1000;
      return 1;
    },
  };
}

const hasUpstash = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

const client = hasUpstash
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : createInMemoryStore();

/**
 * Initialise Redis connection (test ping)
 * @returns {Promise<void>}
 */
async function connectRedis() {
  const pong = await client.ping();
  if (pong !== 'PONG') throw new Error('Redis ping failed');
  console.log(hasUpstash
    ? '[Redis] Connected to Upstash'
    : '[Redis] Using in-memory dev store (sessions reset on restart — dev only)');
}

module.exports = { redisClient: client, connectRedis };
