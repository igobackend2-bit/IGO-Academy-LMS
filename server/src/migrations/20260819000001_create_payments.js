/**
 * Durable record of every Razorpay order/payment attempt -- distinct from
 * enrollments.payment_status (which only tracks the enrollment's own
 * free/paid state). Without this table there was no stored order ID,
 * payment ID, or amount anywhere in our DB to reference for a refund or
 * dispute. Idempotent on razorpay_order_id so both the client-side verify
 * call and the webhook can safely race to update the same row.
 */
exports.up = function (knex) {
  return knex.schema.createTable('payments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('student_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    table.string('razorpay_order_id', 100).notNullable().unique();
    table.string('razorpay_payment_id', 100).nullable();
    table.decimal('amount', 10, 2).notNullable();
    table.string('currency', 10).notNullable().defaultTo('INR');
    table
      .enu('status', ['created', 'paid', 'failed'], { useNative: true, enumName: 'payment_status_enum' })
      .notNullable().defaultTo('created');
    table.string('receipt', 150).nullable();
    table.timestamps(true, true);

    table.index(['student_id']);
    table.index(['course_id']);
    table.index(['status']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('payments').then(() => knex.raw('DROP TYPE IF EXISTS igo_lms.payment_status_enum'));
};
