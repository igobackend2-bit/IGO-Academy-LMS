/**
 * Shared transient-DB-error retry helper.
 * Extracted from auth.controller.js (which had this working for login/
 * register) — the same class of blip hits any hot-path read against
 * Supabase's pooler, not just auth. The admin Enrollments "Payment Review"
 * list is the case that surfaced it: a single reset there rendered as
 * "Couldn't load payment requests" with no automatic recovery, indistinguishable
 * from the fetch never having been retried at all.
 * @module utils/dbRetry
 */
const logger = require('./logger');

/** Transient network/pooler blip, not a real failure — worth one retry. */
function isTransientConnError(err) {
  return ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'EPIPE'].includes(err?.code)
    || /ECONNRESET|Connection ended unexpectedly|Connection terminated/i.test(err?.message || '');
}

/**
 * Retry a DB call once on a transient connection blip before giving up —
 * Supabase's pooler occasionally resets a connection mid-query on a
 * long-running dev process; a single retry papers over exactly that
 * without masking a real, persistent failure (which still throws through
 * on the second attempt).
 * @param {() => Promise<any>} fn
 * @param {string} [label] - short tag for the retry log line, e.g. 'EnrollReq'
 */
async function withRetry(fn, label = 'DB') {
  try {
    return await fn();
  } catch (err) {
    if (!isTransientConnError(err)) throw err;
    logger.warn(`[${label}] Transient DB error, retrying once: ${err.message}`);
    await new Promise((r) => setTimeout(r, 300));
    return fn();
  }
}

module.exports = { isTransientConnError, withRetry };
