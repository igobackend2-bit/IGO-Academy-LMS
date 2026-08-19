/**
 * General website enquiry/lead capture — distinct from app_enrollment_leads
 * (which is Flutter-app-only, lives in the public schema). This table backs
 * the website's centralized enquiry form, WhatsApp CTAs, and the admin
 * Leads page, per the requirements doc's lead-management workflow.
 */
exports.up = function (knex) {
  return knex.schema.createTable('enquiries', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 150).notNullable();
    table.string('phone', 20).notNullable();
    table.string('email', 150).nullable();
    table.string('location', 150).nullable();
    table.string('course_interested', 150).nullable();
    table.string('candidate_type', 60).nullable();
    table.string('preferred_mode', 30).nullable();
    table.text('message').nullable();
    table
      .enu('status', ['New', 'Contacted', 'Interested', 'Follow-up', 'Enrolled', 'Not Interested', 'Closed'], {
        useNative: true, enumName: 'enquiry_status',
      })
      .notNullable().defaultTo('New');
    table.string('source', 100).nullable();
    table.string('landing_page', 255).nullable();
    table.text('admin_note').nullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('enquiries').then(() => knex.raw('DROP TYPE IF EXISTS igo_lms.enquiry_status'));
};
