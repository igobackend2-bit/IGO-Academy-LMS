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
    title:             'Polyhouse Farming Certification Course',
    short_description: 'Protected cultivation structures, drip irrigation & crop management.',
    description:       'Learn polyhouse structures, design & management, drip irrigation & fertigation, crop management, and plant protection techniques.',
    category:          'Horticulture',
    level:             'intermediate',
    prerequisites:     'Basic Botany or Agricultural interest',
    duration_hours:    40,
    price:             12000.00,
    rating:            4.9,
    thumbnail_url:     '/courses/polyhouse_farming.png',
    completion_criteria: JSON.stringify({ attendance_pct: 80, min_score: 60 }),
    is_active:         true,
  },
  {
    title:             'Hydroponics Farming Course',
    short_description: 'Soilless cultivation techniques, nutrient management & system design.',
    description:       'Comprehensive course on soilless cultivation techniques, nutrient solution management, and hydroponic system design & operation.',
    category:          'Horticulture',
    level:             'beginner',
    prerequisites:     'None',
    duration_hours:    35,
    price:             10500.00,
    rating:            4.8,
    thumbnail_url:     '/courses/hydroponics_farming.png',
    completion_criteria: JSON.stringify({ attendance_pct: 80, min_score: 60 }),
    is_active:         true,
  },
  {
    title:             'Mushroom Cultivation Course',
    short_description: 'Spawn production, growing techniques & crop management.',
    description:       'Master the process of spawn production, growing substrates, ambient controls, crop management, and mushroom harvesting.',
    category:          'Horticulture',
    level:             'beginner',
    prerequisites:     'None',
    duration_hours:    30,
    price:             8500.00,
    rating:            4.8,
    thumbnail_url:     '/courses/mushroom_cultivation.png',
    completion_criteria: JSON.stringify({ attendance_pct: 80, min_score: 60 }),
    is_active:         true,
  },
  {
    title:             'Mud Crab Farming Course',
    short_description: 'Pond preparation, seed stocking, feeding & aquaculture marketing.',
    description:       'Master aquaculture with focus on pond preparation, mud crab seed selection & stocking, feeding, water quality management, harvesting, and marketing.',
    category:          'Aquaculture',
    level:             'intermediate',
    prerequisites:     'Basic biology or water science interest',
    duration_hours:    45,
    price:             9800.00,
    rating:            4.7,
    thumbnail_url:     '/courses/mud_crab_farming.png',
    completion_criteria: JSON.stringify({ attendance_pct: 80, min_score: 60 }),
    is_active:         true,
  },
  {
    title:             'Open Cultivation & Precision Farming',
    short_description: 'Scientific crop production, precision irrigation & nutrient planning.',
    description:       'Focuses on scientific crop production, modern tools & precision techniques, water & nutrient management for open field environments.',
    category:          'Horticulture',
    level:             'intermediate',
    prerequisites:     'Basic agriculture exposure',
    duration_hours:    45,
    price:             11000.00,
    rating:            4.8,
    thumbnail_url:     '/courses/open_cultivation.png',
    completion_criteria: JSON.stringify({ attendance_pct: 80, min_score: 60 }),
    is_active:         true,
  },
  {
    title:             'Vertical Farming Training',
    short_description: 'Indoor farming systems, controlled agriculture & high-density yields.',
    description:       'Covers design of indoor farming systems, controlled environment agriculture (CEA), high-density vertical structures, and high-yield cultivation.',
    category:          'Agri-Tech',
    level:             'advanced',
    prerequisites:     'Basic Hydroponics recommended',
    duration_hours:    40,
    price:             13500.00,
    rating:            4.9,
    thumbnail_url:     '/courses/vertical_farming.png',
    completion_criteria: JSON.stringify({ attendance_pct: 80, min_score: 60 }),
    is_active:         true,
  },
  {
    title:             'Nursery Management Training',
    short_description: 'Seedling production, media preparation & nursery maintenance.',
    description:       'Learn professional seedling production, soil-less media preparation, vegetative propagation, and complete nursery care & maintenance.',
    category:          'Horticulture',
    level:             'beginner',
    prerequisites:     'None',
    duration_hours:    30,
    price:             7500.00,
    rating:            4.6,
    thumbnail_url:     '/courses/nursery_management.png',
    completion_criteria: JSON.stringify({ attendance_pct: 80, min_score: 60 }),
    is_active:         true,
  },
  {
    title:             'Microgreens Master Program',
    short_description: 'Superfood cultivation techniques, packaging & marketing.',
    description:       'A complete guide to microgreens cultivation techniques, understanding nutrient densities & health benefits, packaging, branding, and local marketing.',
    category:          'Organic Farming',
    level:             'beginner',
    prerequisites:     'None',
    duration_hours:    25,
    price:             9000.00,
    rating:            4.8,
    thumbnail_url:     '/courses/microgreens.png',
    completion_criteria: JSON.stringify({ attendance_pct: 80, min_score: 60 }),
    is_active:         true,
  },
  {
    title:             'Goat Farming Training',
    short_description: 'Breed selection, housing, feeding & healthcare management.',
    description:       'Comprehensive guide to goat farming breed selection, shelter housing design, intensive feeding regimes, disease prevention, and herd health management.',
    category:          'Livestock & Dairy',
    level:             'beginner',
    prerequisites:     'None',
    duration_hours:    30,
    price:             9500.00,
    rating:            4.7,
    thumbnail_url:     '/courses/goat_farming.png',
    completion_criteria: JSON.stringify({ attendance_pct: 80, min_score: 60 }),
    is_active:         true,
  },
  {
    title:             'Rooftop Gardening & Urban Farming',
    short_description: 'Organic terrace gardening & sustainable urban food growth.',
    description:       'Learn residential terrace gardening layout, organic vegetable production, urban container soils, pest management, and vertical urban agriculture.',
    category:          'Organic Farming',
    level:             'beginner',
    prerequisites:     'None',
    duration_hours:    25,
    price:             8000.00,
    rating:            4.7,
    thumbnail_url:     '/courses/rooftop_gardening.png',
    completion_criteria: JSON.stringify({ attendance_pct: 80, min_score: 60 }),
    is_active:         true,
  },
  {
    title:             'Industrial Visits & Practical Training',
    short_description: 'Hands-on farm experience, live system demos & expert guidance.',
    description:       'Structured training program featuring live commercial farm demonstrations, system tours for entrepreneurs, and practical hands-on field experience.',
    category:          'Farmpreneur Skills',
    level:             'beginner',
    prerequisites:     'None',
    duration_hours:    20,
    price:             5000.00,
    rating:            4.9,
    thumbnail_url:     '/courses/industrial_visits.png',
    completion_criteria: JSON.stringify({ attendance_pct: 80, min_score: 60 }),
    is_active:         true,
  },
  {
    title:             'Other Specialized Trainings',
    short_description: 'Customized agribusiness programs & entrepreneurship consultancy.',
    description:       'Includes customized training programs, project guidance, agribusiness consultation, and startup entrepreneurship development.',
    category:          'Farmpreneur Skills',
    level:             'intermediate',
    prerequisites:     'Specific course completion or business intent',
    duration_hours:    30,
    price:             6000.00,
    rating:            4.6,
    thumbnail_url:     '/courses/specialized_trainings.png',
    completion_criteria: JSON.stringify({ attendance_pct: 80, min_score: 60 }),
    is_active:         true,
  },
];

exports.seed = async function (knex) {
  // Clean up all related tables to reset courses correctly and avoid FK violations
  console.log('[Seed] 🧹 Cleaning up old database tables...');
  await knex('certificates').del();
  await knex('submissions').del();
  await knex('assessments').del();
  await knex('attendance').del();
  await knex('class_modules').del();
  await knex('enrollments').del();
  await knex('courses').del();

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
