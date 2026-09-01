/**
 * Records a `payments` row for money collected outside Razorpay — cash, a
 * direct UPI transfer, bank transfer, or any other channel an admin
 * manually confirms and types an amount for. Without this, the admin
 * Payment Report (which only ever reads the `payments` table — see
 * GET /api/payments) silently excluded every offline enrollment's revenue,
 * even though `enrollments.paid_amount` had it all along.
 *
 * Idempotent per enrollment: `gateway_order_id` is UNIQUE on `payments`, and
 * it's synthesized from the enrollment's own id (`OFFLINE-<uuid>`), so
 * calling this twice for the same enrollment fails the second insert
 * instead of double-counting revenue. Both call sites today only ever call
 * this once per enrollment, so that's a safety net, not a real path.
 */
const { db } = require('../config/db');
const logger = require('./logger');

// Mirrors enrollment_requests.payment_method (client's PAYMENT_METHOD_LABEL)
// so the Payment Report can show the student's actual claimed method instead
// of a generic "Offline" whenever it's known.
const KNOWN_METHODS = new Set(['cash', 'upi', 'bank_transfer', 'other']);

/**
 * @param {{ enrollment_id: string, student_id: string, course_id: string, amount: number|string, method?: string }} opts
 */
async function recordOfflinePayment({ enrollment_id, student_id, course_id, amount, method }) {
  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) return; // free enrollment — nothing to record

  const gateway = KNOWN_METHODS.has(method) ? method : 'offline';

  try {
    await db('payments').insert({
      student_id,
      course_id,
      gateway,
      gateway_order_id: `OFFLINE-${enrollment_id}`,
      gateway_payment_id: null,
      amount: numericAmount,
      currency: 'INR',
      status: 'paid',
      receipt: `manual-${String(enrollment_id).slice(0, 8)}`,
    });
  } catch (err) {
    // Never let payment-report bookkeeping block the actual enrollment —
    // the student is already enrolled either way at both call sites; this
    // only means the amount won't show up in the Payment Report until
    // someone notices and re-runs it.
    logger.error(`[OfflinePayment] Failed to record payment for enrollment ${enrollment_id}: ${err.message}`);
  }
}

module.exports = { recordOfflinePayment };
