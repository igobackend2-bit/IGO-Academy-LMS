/**
 * App Enrollment Leads controller
 * Reads from public.app_enrollment_leads (Flutter app submissions) via Supabase REST.
 * On approval: creates igo_lms user + enrollment + in-app notification.
 */
const bcrypt = require('bcryptjs');
const { db, supabase } = require('../config/db');
const { createError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/** GET /api/app-leads — admin lists all leads from public schema */
async function list(req, res, next) {
  try {
    const { status } = req.query;
    let query = supabase
      .from('app_enrollment_leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    res.json({ success: true, data: data || [], error: null, message: 'OK' });
  } catch (err) { next(err); }
}

/** PUT /api/app-leads/:id/approve — admin approves a lead */
async function approve(req, res, next) {
  try {
    const { id } = req.params;
    const { admin_note, start_date, end_date, paid_amount, course_id } = req.body;

    // Fetch the lead from public schema
    const { data: leads, error: fetchErr } = await supabase
      .from('app_enrollment_leads')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !leads) throw createError('NOT_FOUND', 'Lead not found');
    if (leads.status !== 'pending') {
      return res.status(400).json({ success: false, data: null, error: 'INVALID_STATE', message: `Lead is already ${leads.status}` });
    }

    if (!course_id) throw createError('INVALID_INPUT', 'course_id is required for approval');

    const course = await db('courses').where({ id: course_id }).first();
    if (!course) throw createError('NOT_FOUND', 'Course not found');

    // Find or create LMS user from email
    let lmsUser = await db('users').where({ email: leads.email }).first();
    let tempPassword = null;

    if (!lmsUser) {
      tempPassword = Math.random().toString(36).slice(-8) + 'A1@';
      const hash = await bcrypt.hash(tempPassword, 10);
      const [created] = await db('users').insert({
        full_name: leads.full_name,
        email: leads.email,
        phone: leads.phone,
        password_hash: hash,
        role: 'student',
      }).returning('*');
      lmsUser = created;
      logger.info(`[AppLeads] Created LMS user ${lmsUser.id} for lead ${id}`);
    }

    // Create enrollment
    const today = new Date();
    const defaultEnd = new Date(today);
    defaultEnd.setFullYear(defaultEnd.getFullYear() + 1);
    const fmt = (d) => d.toISOString().split('T')[0];

    const existing = await db('enrollments').where({ student_id: lmsUser.id, course_id }).first();
    if (!existing) {
      await db('enrollments').insert({
        student_id: lmsUser.id,
        course_id,
        start_date: start_date || fmt(today),
        end_date:   end_date   || fmt(defaultEnd),
        payment_status: 'pending',
        paid_amount: paid_amount || 0,
        is_expired: false,
      });
    }

    // Mark lead as approved in public schema
    await supabase
      .from('app_enrollment_leads')
      .update({
        status: 'approved',
        admin_note: admin_note || null,
        lms_user_id: lmsUser.id,
        reviewed_at: new Date().toISOString(),
        reviewed_by_name: req.user.full_name || req.user.email,
      })
      .eq('id', id);

    // Find app user — prefer app_user_id stored at lead submission, fall back to email lookup
    let appUser = null;

    if (leads.app_user_id) {
      // Direct lookup by auth UID (most reliable — set when lead was submitted)
      const { data: byId } = await supabase
        .from('users')
        .select('id')
        .eq('id', leads.app_user_id)
        .maybeSingle();

      if (!byId) {
        // public.users row missing — create it from auth record
        try {
          const { data: authRecord } = await supabase.auth.admin.getUserById(leads.app_user_id);
          if (authRecord?.user) {
            const au = authRecord.user;
            const { data: created } = await supabase
              .from('users')
              .upsert({
                id:         au.id,
                name:       au.user_metadata?.full_name || au.user_metadata?.name || leads.full_name,
                email:      au.email,
                phone:      leads.phone || null,
                created_at: new Date().toISOString(),
              }, { onConflict: 'id' })
              .select('id')
              .single();
            appUser = created;
            logger.info(`[AppLeads] Created public.users entry for auth user ${leads.app_user_id}`);
          }
        } catch (e) {
          logger.warn(`[AppLeads] getUserById failed: ${e.message}`);
        }
      } else {
        appUser = byId;
      }
    }

    if (!appUser) {
      // Fallback: look up by email (case-insensitive)
      const { data: byEmail } = await supabase
        .from('users')
        .select('id')
        .ilike('email', leads.email)
        .maybeSingle();

      if (!byEmail) {
        // Last resort: search auth.users by email and create public.users entry
        try {
          const { data: { users: authList } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
          const authUser = authList?.find(u => u.email?.toLowerCase() === leads.email?.toLowerCase());
          if (authUser) {
            const { data: created } = await supabase
              .from('users')
              .upsert({
                id:         authUser.id,
                name:       authUser.user_metadata?.full_name || authUser.user_metadata?.name || leads.full_name,
                email:      authUser.email,
                phone:      leads.phone || null,
                created_at: new Date().toISOString(),
              }, { onConflict: 'id' })
              .select('id')
              .single();
            appUser = created;
            logger.info(`[AppLeads] Created missing public.users entry for ${leads.email}`);
          }
        } catch (e) {
          logger.warn(`[AppLeads] auth.admin.listUsers failed: ${e.message}`);
        }
      } else {
        appUser = byEmail;
      }
    }

    if (appUser) {
      // Write to public.enrollments so Flutter app shows course in My Courses
      const { error: enrollErr } = await supabase
        .from('enrollments')
        .upsert({
          user_id:           appUser.id,
          course_id:         course_id,
          status:            'active',
          progress_percent:  0,
          completed_lessons: 0,
          enrolled_at:       new Date().toISOString(),
        }, { onConflict: 'user_id,course_id' });

      if (enrollErr) {
        logger.warn(`[AppLeads] public.enrollments write failed: ${enrollErr.message}`);
      } else {
        logger.info(`[AppLeads] public.enrollments upserted for user ${appUser.id} course ${course_id}`);
      }

      // Send in-app notification
      const notifMessage = admin_note
        ? `Your enrollment for ${course.title} is approved! ${admin_note}`
        : `Your enrollment for ${course.title} is approved! Welcome aboard.`;

      await supabase.from('notifications').insert({
        user_id: appUser.id,
        title:   'Enrollment Approved 🎉',
        message: notifMessage,
        type:    'enrollment',
        is_read: false,
      });
    } else {
      logger.warn(`[AppLeads] No Flutter app account found for ${leads.email} — enrollment skipped`);
    }

    logger.info(`[AppLeads] Admin ${req.user.id} approved lead ${id} → LMS user ${lmsUser.id}`);

    res.json({
      success: true,
      data: { lms_user_id: lmsUser.id, temp_password: tempPassword },
      error: null,
      message: tempPassword
        ? `Approved. New LMS account created. Temp password: ${tempPassword}`
        : 'Approved. Student already has an LMS account.',
    });
  } catch (err) { next(err); }
}

/** PUT /api/app-leads/:id/reject — admin rejects a lead */
async function reject(req, res, next) {
  try {
    const { id } = req.params;
    const { admin_note } = req.body;

    const { data: lead, error: fetchErr } = await supabase
      .from('app_enrollment_leads')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !lead) throw createError('NOT_FOUND', 'Lead not found');
    if (lead.status !== 'pending') {
      return res.status(400).json({ success: false, data: null, error: 'INVALID_STATE', message: `Lead is already ${lead.status}` });
    }

    await supabase
      .from('app_enrollment_leads')
      .update({
        status: 'rejected',
        admin_note: admin_note || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by_name: req.user.full_name || req.user.email,
      })
      .eq('id', id);

    // Notify app user if they have an account
    const { data: appUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', lead.email)
      .single();

    if (appUser) {
      await supabase.from('notifications').insert({
        user_id: appUser.id,
        title: 'Enrollment Update',
        message: admin_note
          ? `Your enrollment request could not be processed: ${admin_note}`
          : 'Your enrollment request could not be processed at this time. Please contact the academy.',
        type: 'enrollment',
        is_read: false,
      });
    }

    logger.info(`[AppLeads] Admin ${req.user.id} rejected lead ${id}`);
    res.json({ success: true, data: null, error: null, message: 'Lead rejected' });
  } catch (err) { next(err); }
}

module.exports = { list, approve, reject };
