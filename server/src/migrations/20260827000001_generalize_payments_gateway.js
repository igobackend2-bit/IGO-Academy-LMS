/**
 * Generalizes the payments table from Razorpay-specific columns to a
 * gateway-agnostic shape. The Academy is switching its active gateway to
 * Cashfree (0% platform fee on UPI/RuPay vs Razorpay's ~2%+GST on UPI too),
 * but nothing was ever deployed with Razorpay live, so this is a rename,
 * not a backfill.
 */
exports.up = function (knex) {
  return knex.schema.alterTable('payments', (table) => {
    table.string('gateway', 20).notNullable().defaultTo('cashfree');
    table.renameColumn('razorpay_order_id', 'gateway_order_id');
    table.renameColumn('razorpay_payment_id', 'gateway_payment_id');
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('payments', (table) => {
    table.dropColumn('gateway');
    table.renameColumn('gateway_order_id', 'razorpay_order_id');
    table.renameColumn('gateway_payment_id', 'razorpay_payment_id');
  });
};
