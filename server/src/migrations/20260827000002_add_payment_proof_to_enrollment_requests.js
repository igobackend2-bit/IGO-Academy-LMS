/**
 * Extends enrollment_requests with structured payment-proof fields, so an
 * admin reviewing a paid-course request has an actual claim to check
 * (amount, method, reference/UTR, optional screenshot) instead of only the
 * free-text student_message that existed before. All nullable — a free
 * course's request flow is untouched.
 */
exports.up = function (knex) {
  return knex.schema.alterTable('enrollment_requests', (table) => {
    table.decimal('claimed_amount', 10, 2).nullable();
    table.string('payment_method', 30).nullable(); // 'upi' | 'bank_transfer' | 'cash' | 'other'
    table.string('payment_reference', 100).nullable();
    table.string('proof_path', 255).nullable(); // Supabase Storage path, private bucket
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('enrollment_requests', (table) => {
    table.dropColumn('claimed_amount');
    table.dropColumn('payment_method');
    table.dropColumn('payment_reference');
    table.dropColumn('proof_path');
  });
};
