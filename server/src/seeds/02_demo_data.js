/**
 * Seed: IGO Academy demo catalog.
 * Idempotent — skips rows that already exist (matched by email / title).
 * Run: npm run seed (from server directory)
 */
const bcrypt = require('bcryptjs');

const DEMO_TRAINER = {
  full_name: 'Rajesh Kumar',
  email: 'trainer.rajesh@igoacademy.in',
  phone: '+919876543211',
  role: 'trainer',
  is_active: true,
  otp_verified: true,
};

const DEMO_STUDENTS = [
  { full_name: 'Arjun Sharma',   email: 'student.arjun@igoacademy.in',   phone: '+919876543212' },
  { full_name: 'Priya Nair',     email: 'student.priya@igoacademy.in',    phone: '+919876543213' },
  { full_name: 'Karthik Rajan',  email: 'student.karthik@igoacademy.in',  phone: '+919876543214' },
  { full_name: 'Meena Devi',     email: 'student.meena@igoacademy.in',    phone: '+919876543215' },
  { full_name: 'Suresh Pillai',  email: 'student.suresh@igoacademy.in',   phone: '+919876543216' },
];

const COURSES = [
  {
    title:             'Polyhouse & Hydroponics Farming',
    short_description: 'Master soilless cultivation and high-yield polyhouse techniques.',
    description:       'A complete programme covering polyhouse design, nutrient film technique (NFT), deep water culture (DWC), substrate management, climate control, and profitable crop selection for year-round production.',
    category:          'Horticulture',
    level:             'intermediate',
    prerequisites:     'Basic Botany, Intro to Agriculture',
    duration_hours:    60,
    price:             12500.00,
    rating:            4.9,
    thumbnail_url:     'https://igoacademy.in/assets/courses/hydroponics.jpg',
    completion_criteria: JSON.stringify({ attendance_pct: 80, min_score: 60 }),
    is_active:         true,
  },
  {
    title:             'Organic Farming Mastery',
    short_description: 'Grow chemical-free, premium produce with certified organic methods.',
    description:       'Covers organic certification pathways, composting, vermicomposting, bio-pesticides, crop rotation, soil health management, and connecting with premium organic market channels across Tamil Nadu.',
    category:          'Horticulture',
    level:             'beginner',
    prerequisites:     'None — open to all',
    duration_hours:    40,
    price:             8500.00,
    rating:            4.8,
    thumbnail_url:     'https://igoacademy.in/assets/courses/organic.jpg',
    completion_criteria: JSON.stringify({ attendance_pct: 80, min_score: 60 }),
    is_active:         true,
  },
  {
    title:             'Integrated Pest Management',
    short_description: 'Control crop losses with science-based, eco-friendly IPM strategies.',
    description:       'Advanced programme on pest identification, biological control agents, pheromone traps, economic threshold levels, safe pesticide use, and building an IPM schedule for major South Indian crops.',
    category:          'Horticulture',
    level:             'advanced',
    prerequisites:     'Organic Farming Mastery or equivalent field experience',
    duration_hours:    45,
    price:             9800.00,
    rating:            4.7,
    thumbnail_url:     'https://igoacademy.in/assets/courses/ipm.jpg',
    completion_criteria: JSON.stringify({ attendance_pct: 80, min_score: 60 }),
    is_active:         true,
  },
  {
    title:             'Agri Supply Chain Management',
    short_description: 'Cut middlemen, boost margins — own your farm-to-market journey.',
    description:       'Covers cold chain logistics, FPO formation, direct retail tie-ups, e-commerce platforms for farmers, contract farming agreements, post-harvest handling, and financial tools for agri-entrepreneurs.',
    category:          'Agri-Biz',
    level:             'intermediate',
    prerequisites:     'Basic business knowledge',
    duration_hours:    50,
    price:             11000.00,
    rating:            4.8,
    thumbnail_url:     'https://igoacademy.in/assets/courses/supply-chain.jpg',
    completion_criteria: JSON.stringify({ attendance_pct: 80, min_score: 60 }),
    is_active:         true,
  },
  {
    title:             'Commercial Aquaculture',
    short_description: 'Build a profitable fish and prawn farm with modern aquaculture science.',
    description:       'Comprehensive training in pond construction, species selection (vannamei, tilapia, rohu), feed management, water quality monitoring, disease prevention, and export-standard certification for marine products.',
    category:          'Aquaculture',
    level:             'beginner',
    prerequisites:     'None — open to coastal & inland farmers',
    duration_hours:    55,
    price:             10500.00,
    rating:            4.9,
    thumbnail_url:     'https://igoacademy.in/assets/courses/aquaculture.jpg',
    completion_criteria: JSON.stringify({ attendance_pct: 80, min_score: 60 }),
    is_active:         true,
  },
  {
    title:             'Smart Irrigation & Water Management',
    short_description: 'Save 50% water, double yield — drip, sprinkler, and sensor-driven systems.',
    description:       'Deep dive into drip irrigation design, fertigation, soil moisture sensors, IoT-based automation, government subsidy schemes (PMKSY), micro-watershed management, and water harvesting structures for dry-land farms.',
    category:          'Tech',
    level:             'advanced',
    prerequisites:     'Basic farming experience, comfort with mobile apps',
    duration_hours:    48,
    price:             13500.00,
    rating:            4.8,
    thumbnail_url:     'https://igoacademy.in/assets/courses/irrigation.jpg',
    completion_criteria: JSON.stringify({ attendance_pct: 80, min_score: 60 }),
    is_active:         true,
  },
];

exports.seed = async function (knex) {
  const demoPassword = await bcrypt.hash('Demo@IGO2026!', 10);

  // ── Trainer ─────────────────────────────────────────────────────────────
  let trainer = await knex('users').where({ email: DEMO_TRAINER.email }).first();
  if (!trainer) {
    [trainer] = await knex('users')
      .insert({ ...DEMO_TRAINER, password_hash: demoPassword })
      .returning('*');
    console.log(`[Seed] ✅ Trainer created: ${DEMO_TRAINER.email}`);
  } else {
    console.log(`[Seed] Trainer exists — skipping`);
  }

  // ── Students ─────────────────────────────────────────────────────────────
  const studentIds = [];
  for (const s of DEMO_STUDENTS) {
    let student = await knex('users').where({ email: s.email }).first();
    if (!student) {
      [student] = await knex('users')
        .insert({ ...s, role: 'student', is_active: true, otp_verified: true, password_hash: demoPassword })
        .returning('*');
      console.log(`[Seed] ✅ Student created: ${s.email}`);
    }
    studentIds.push(student.id);
  }

  // ── Courses ───────────────────────────────────────────────────────────────
  const courseIds = [];
  for (const c of COURSES) {
    let course = await knex('courses').where({ title: c.title }).first();
    if (!course) {
      [course] = await knex('courses')
        .insert({ ...c, trainer_id: trainer.id })
        .returning('*');
      console.log(`[Seed] ✅ Course created: ${c.title}`);
    } else {
      console.log(`[Seed] Course exists — skipping: ${c.title}`);
    }
    courseIds.push(course.id);
  }

  // ── Enrollments ───────────────────────────────────────────────────────────
  // 8 enrollments: first 3 students enrolled in 3 courses each (with overlap)
  const enrollments = [
    { student_id: studentIds[0], course_id: courseIds[0], paid_amount: 12500 },
    { student_id: studentIds[0], course_id: courseIds[3], paid_amount: 11000 },
    { student_id: studentIds[1], course_id: courseIds[1], paid_amount: 8500  },
    { student_id: studentIds[1], course_id: courseIds[4], paid_amount: 10500 },
    { student_id: studentIds[2], course_id: courseIds[0], paid_amount: 12500 },
    { student_id: studentIds[2], course_id: courseIds[5], paid_amount: 13500 },
    { student_id: studentIds[3], course_id: courseIds[2], paid_amount: 9800  },
    { student_id: studentIds[4], course_id: courseIds[1], paid_amount: 8500  },
  ];

  const now    = new Date();
  const future = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate()); // 6 months

  for (const e of enrollments) {
    const exists = await knex('enrollments')
      .where({ student_id: e.student_id, course_id: e.course_id }).first();
    if (!exists) {
      await knex('enrollments').insert({
        ...e,
        start_date:  now,
        end_date:    future,
        is_expired:  false,
        enrolled_at: now,
      });
    }
  }
  console.log(`[Seed] ✅ Enrollments seeded (8 records, idempotent)`);
};
