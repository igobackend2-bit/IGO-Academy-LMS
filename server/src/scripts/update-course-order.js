require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');

const ORDER = [
  'Polyhouse Farming Certification Course',
  'Hydroponics Farming Course',
  'Mushroom Cultivation Course',
  'Mud Crab Farming Course',
  'Open Cultivation & Precision Farming',
  'Vertical Farming Training',
  'Nursery Management Training',
  'Microgreens Master Program',
  'Goat Farming Training',
  "Rooftop Gardening & Urban Farming",
  "Industrial Visits & Practical Training",
  "Other Specialized Trainings"
];

async function run() {
  console.log('Updating course order...');
  const now = new Date();
  
  for (let i = 0; i < ORDER.length; i++) {
    const title = ORDER[i];
    // the first item should have the newest date, so we subtract `i` hours.
    const createdAt = new Date(now.getTime() - i * 3600000);
    
    await db('courses')
      .where({ title })
      .update({ created_at: createdAt });
    console.log(`Updated "${title}"`);
  }
  
  console.log('Done!');
  await db.destroy();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
