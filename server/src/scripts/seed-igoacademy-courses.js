/**
 * Seed courses from igoacademy.in into igo_lms.courses
 * Run: node src/scripts/seed-igoacademy-courses.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');

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

async function run() {
  console.log('Seeding courses from igoacademy.in...\n');
  let inserted = 0;
  let skipped = 0;

  for (const course of COURSES) {
    const existing = await db('courses').where({ title: course.title }).first();
    if (existing) {
      console.log(`  SKIP  "${course.title}" (already exists)`);
      skipped++;
      continue;
    }
    await db('courses').insert(course);
    console.log(`  ADD   "${course.title}" [${course.category} / ${course.level}] ₹${course.price}`);
    inserted++;
  }

  console.log(`\nDone. ${inserted} inserted, ${skipped} skipped.`);
  await db.destroy();
}

run().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
