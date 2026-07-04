/**
 * Seed courses from igoacademy.in into igo_lms.courses
 * Run: node src/scripts/seed-igoacademy-courses.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');

const COURSES = [
  {
    title: 'Advanced Hydroponics & Soil-less Farming',
    short_description: 'Master the future of farming with high-tech soil-less cultivation techniques.',
    description: 'Master the future of farming with high-tech soil-less cultivation techniques. This advanced program covers nutrient film technique (NFT), deep water culture (DWC), aeroponics, and vertical farming systems for commercial-scale production.',
    category: 'Agri-Tech',
    level: 'advanced',
    price: 12500,
    rating: 4.9,
    prerequisites: 'Basic Botany, Intro to Agriculture',
    is_active: true,
    duration_hours: 40,
  },
  {
    title: 'Organic Farming & Permaculture Design',
    short_description: 'Learn to design productive ecosystems that work with nature, not against it.',
    description: 'Learn to design productive ecosystems that work with nature, not against it. Covers composting, crop rotation, natural pest control, water harvesting, and permaculture zone design for sustainable farm management.',
    category: 'Horticulture',
    level: 'beginner',
    price: 8000,
    rating: 4.8,
    prerequisites: 'None',
    is_active: true,
    duration_hours: 30,
  },
  {
    title: 'Sustainable Pest & Disease Management',
    short_description: 'Identify and manage plant threats using biological and eco-friendly methods.',
    description: 'Identify and manage plant threats using biological and eco-friendly methods. Topics include integrated pest management (IPM), bio-pesticides, beneficial insects, disease identification, and preventive cultural practices.',
    category: 'Horticulture',
    level: 'intermediate',
    price: 6500,
    rating: 4.7,
    prerequisites: 'Basic Biology',
    is_active: true,
    duration_hours: 25,
  },
  {
    title: 'Agricultural Supply Chain Management',
    short_description: 'Optimize the journey of produce from harvest to the consumer market.',
    description: 'Optimize the journey of produce from harvest to the consumer market. Covers post-harvest handling, cold chain logistics, packaging standards, market linkage, FSSAI compliance, and agri-export documentation.',
    category: 'Agri-Business',
    level: 'intermediate',
    price: 10500,
    rating: 4.6,
    prerequisites: 'Basic Economics recommended',
    is_active: true,
    duration_hours: 35,
  },
  {
    title: 'Commercial Aquaculture Systems',
    short_description: 'Setting up and managing profitable fish farms and re-circulating aquaculture systems.',
    description: 'Setting up and managing profitable fish farms and re-circulating aquaculture systems (RAS). Covers species selection, water quality management, feed formulation, disease prevention, and business planning for aquafarms.',
    category: 'Aquaculture',
    level: 'advanced',
    price: 15000,
    rating: 4.9,
    prerequisites: 'Water Science Basics',
    is_active: true,
    duration_hours: 45,
  },
  {
    title: 'Smart Farm Irrigation Systems',
    short_description: 'Design and install automated water-saving systems for optimal crop growth.',
    description: 'Design and install automated water-saving systems for optimal crop growth. Covers drip irrigation, sprinkler systems, soil moisture sensors, fertigation, and IoT-based irrigation scheduling for water-efficient farming.',
    category: 'Agri-Tech',
    level: 'beginner',
    price: 5500,
    rating: 4.5,
    prerequisites: 'None',
    is_active: true,
    duration_hours: 20,
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
