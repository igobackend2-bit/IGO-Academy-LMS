/**
 * Seed: Demo modules, assessments, submissions, and certificates.
 * Shows the full learning journey for visual inspection.
 * Idempotent — keyed by title/certificate_id; skips existing rows.
 */

// Demo video — publicly accessible MP4 used for the intro module of each course.
// Replace with actual course video via Admin → Courses → Manage → Upload Video.
const DEMO_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

// ── Module templates per course title ─────────────────────────────────────
const MODULES_BY_COURSE = {
  'Polyhouse Farming Certification Course': [
    { title: 'Introduction to Controlled-Environment Agriculture', description: 'Overview of polyhouse design types, materials (LDPE, shade nets), site selection, and climate control basics.', order_index: 1, duration_secs: 3240, completion_pct: 80, video_s3_key: DEMO_VIDEO_URL },
    { title: 'Nutrient Solution Management', description: 'EC & pH principles, macro/micro nutrient ratios, reservoir maintenance, and common deficiency diagnosis with photos.', order_index: 2, duration_secs: 4800, completion_pct: 80 },
    { title: 'Crop Selection & Planting Systems', description: 'NFT, DWC, and drip-to-waste compared; high-value crop calendar; seeding, transplant density, and spacing guides.', order_index: 3, duration_secs: 4200, completion_pct: 80 },
    { title: 'Pest & Disease Control in Enclosed Spaces', description: 'Biological agents, yellow sticky traps, IPM rotation, and disinfection protocols between crop cycles.', order_index: 4, duration_secs: 3600, completion_pct: 80 },
    { title: 'Harvest, Packaging & Market Linkage', description: 'Maturity indices, post-harvest cooling, FSSAI labelling, and connecting with modern retailers and online channels.', order_index: 5, duration_secs: 2700, completion_pct: 80 },
  ],
  'Hydroponics Farming Course': [
    { title: 'Hydroponics Soilless Systems', description: 'Introduction to NFT, DWC, and coco peat grow bags.', order_index: 1, duration_secs: 3000, completion_pct: 80, video_s3_key: DEMO_VIDEO_URL },
    { title: 'Nutrient Solutions EC/pH Control', description: 'How to mix A & B stock nutrient solutions and manage reservoirs.', order_index: 2, duration_secs: 3600, completion_pct: 80 },
    { title: 'Commercial Hydroponic Crop Cycles', description: 'Seeding to harvest schedules for lettuce, basil, and cherry tomatoes.', order_index: 3, duration_secs: 3600, completion_pct: 80 },
  ],
  'Mushroom Cultivation Course': [
    { title: 'Spawn Production and Lab Hygiene', description: 'Sterilisation, grain spawn creation, and cleanroom lab practices.', order_index: 1, duration_secs: 3200, completion_pct: 80, video_s3_key: DEMO_VIDEO_URL },
    { title: 'Substrate Sterilisation and Inoculation', description: 'Preparing paddy straw, sawdust, bags, and inoculating with spawn.', order_index: 2, duration_secs: 3400, completion_pct: 80 },
    { title: 'Cropping Room Controls and Harvest', description: 'Temperature, humidity, ventilation settings, and flush harvesting.', order_index: 3, duration_secs: 3000, completion_pct: 80 },
  ],
  'Mud Crab Farming Course': [
    { title: 'Mud Crab Biology and Pond Construction', description: 'Pond layout, fencing, water source, and optimal brackish water parameters.', order_index: 1, duration_secs: 3600, completion_pct: 80, video_s3_key: DEMO_VIDEO_URL },
    { title: 'Crablet Selection and Feed Management', description: 'Selecting healthy crablets, feeding rates, trash fish vs pellets, and water change.', order_index: 2, duration_secs: 4200, completion_pct: 80 },
    { title: 'Harvesting, Packing and Live Export', description: 'Catching, binding, grade selection, and transport packaging for market.', order_index: 3, duration_secs: 3600, completion_pct: 80 },
  ],
  'Open Cultivation & Precision Farming': [
    { title: 'Precision Open Field Agriculture', description: 'Soil health mapping, high-yielding crop selection, and row spacing.', order_index: 1, duration_secs: 3000, completion_pct: 80, video_s3_key: DEMO_VIDEO_URL },
    { title: 'Drip Systems and Fertigation', description: 'Lateral design, water flow pressure, venturi injection, and schedules.', order_index: 2, duration_secs: 3600, completion_pct: 80 },
    { title: 'IoT Agri Telemetry and Tools', description: 'Using soil sensors, drones, and automated weather telemetry.', order_index: 3, duration_secs: 3300, completion_pct: 80 },
  ],
  'Vertical Farming Training': [
    { title: 'Indoor CEA Infrastructure Design', description: 'Controlled environment design, dynamic racking systems, and layout.', order_index: 1, duration_secs: 3600, completion_pct: 80, video_s3_key: DEMO_VIDEO_URL },
    { title: 'Grow Light Spectra for Microgreens', description: 'PAR values, LED spectra (blue vs red ratios) for optimal growth.', order_index: 2, duration_secs: 3800, completion_pct: 80 },
    { title: 'High Density System Diagnostics', description: 'Managing multi-tier humidity, air flow, and automated clean cycles.', order_index: 3, duration_secs: 3200, completion_pct: 80 },
  ],
  'Nursery Management Training': [
    { title: 'Nursery Setup and Protrays', description: 'Selecting quality seeds, protrays, vermiculite/coco peat mixtures.', order_index: 1, duration_secs: 2800, completion_pct: 80, video_s3_key: DEMO_VIDEO_URL },
    { title: 'Vegetative Propagation Techniques', description: 'Grafting, air layering, and rooting hormone applications.', order_index: 2, duration_secs: 3200, completion_pct: 80 },
    { title: 'Seedling Hardening and Dispatch', description: 'Sun exposure adjustments, watering limits before customer delivery.', order_index: 3, duration_secs: 3000, completion_pct: 80 },
  ],
  'Microgreens Master Program': [
    { title: 'Microgreens Sprout Phase Care', description: 'Soaking, blackout periods, watering schedules, and tray setup.', order_index: 1, duration_secs: 2600, completion_pct: 80, video_s3_key: DEMO_VIDEO_URL },
    { title: 'Nutrient Density and Harvest Cycles', description: 'Optimal harvest day, cutting techniques, and health advantages.', order_index: 2, duration_secs: 3000, completion_pct: 80 },
    { title: 'Microgreens Branding and Local Sales', description: 'Label design, cold chain preservation, and wholesale delivery.', order_index: 3, duration_secs: 2800, completion_pct: 80 },
  ],
  'Goat Farming Training': [
    { title: 'Goat Breeds and Shed Construction', description: 'Choosing Tellicherry, Boer, or local breeds; elevated floor design.', order_index: 1, duration_secs: 3000, completion_pct: 80, video_s3_key: DEMO_VIDEO_URL },
    { title: 'Goat Feed Formulation and Green Fodder', description: 'Co-3/Co-4 grass cultivation, concentrate feeds, and mineral blocks.', order_index: 2, duration_secs: 3400, completion_pct: 80 },
    { title: 'Deworming, Vaccination and Health', description: 'Vaccination schedules (ET, PPR), deworming cycles, and general care.', order_index: 3, duration_secs: 3200, completion_pct: 80 },
  ],
  'Rooftop Gardening & Urban Farming': [
    { title: 'Terrace Garden Design and Layout', description: 'Weight capacity audits, waterproofing floors, and container types.', order_index: 1, duration_secs: 2800, completion_pct: 80, video_s3_key: DEMO_VIDEO_URL },
    { title: 'Container Organic Soil Preparation', description: 'Coco peat, compost, red soil ratios, and biological inputs (panchagavya).', order_index: 2, duration_secs: 3000, completion_pct: 80 },
    { title: 'Urban Pest Management and Care', description: 'Neem sprays, yellow traps, water-saving setups for urban environments.', order_index: 3, duration_secs: 2800, completion_pct: 80 },
  ],
  'Industrial Visits & Practical Training': [
    { title: 'Commercial Hydroponics Farm Operations', description: 'Reviewing actual farm setups, water flow layout, and cooling pads.', order_index: 1, duration_secs: 3000, completion_pct: 80, video_s3_key: DEMO_VIDEO_URL },
    { title: 'Processing and Grade Packaging Visits', description: 'Visiting commercial sorting, cleaning, grading, and cold storages.', order_index: 2, duration_secs: 3200, completion_pct: 80 },
    { title: 'Agri Business Plan Mentoring', description: 'Structuring bankable projects, subsidy filings, and marketing plans.', order_index: 3, duration_secs: 3000, completion_pct: 80 },
  ],
  'Other Specialized Trainings': [
    { title: 'Agri Entrepreneurship Project Plans', description: 'Drafting reports for NABARD, NHB, and bank loan approvals.', order_index: 1, duration_secs: 3200, completion_pct: 80, video_s3_key: DEMO_VIDEO_URL },
    { title: 'Agri Consultancy Methodologies', description: 'Training on custom advisory models, soil diagnostics, crop plans.', order_index: 2, duration_secs: 3400, completion_pct: 80 },
    { title: 'Customized Project Execution Guidelines', description: 'Project management for specialized greenhouse and polyhouse setups.', order_index: 3, duration_secs: 3000, completion_pct: 80 },
  ],
};

// ── Assessment quiz questions per course ──────────────────────────────────
const QUIZ_BY_COURSE = {
  'Polyhouse Farming Certification Course': {
    title: 'Polyhouse Farming Certification — Final Assessment',
    pass_score: 70,
    timer_mins: 30,
    questions: [
      { id: 'q1', text: 'Which hydroponic technique recirculates a thin film of nutrient solution over roots?', type: 'mcq', options: ['Deep Water Culture', 'Nutrient Film Technique', 'Ebb and Flow', 'Wick System'], correct_answer: 'Nutrient Film Technique', points: 10 },
      { id: 'q2', text: 'What does EC stand for in hydroponics?', type: 'mcq', options: ['Electrical Conductivity', 'Elemental Carbon', 'Environmental Control', 'Enzyme Concentration'], correct_answer: 'Electrical Conductivity', points: 10 },
      { id: 'q3', text: 'The ideal pH range for most hydroponic crops is:', type: 'mcq', options: ['4.0 – 5.0', '5.5 – 6.5', '7.0 – 8.0', '8.5 – 9.5'], correct_answer: '5.5 – 6.5', points: 10 },
      { id: 'q4', text: 'Which material is most commonly used for polyhouse covering in Tamil Nadu?', type: 'mcq', options: ['Glass', 'LDPE UV film', 'Metal mesh', 'Bamboo mat'], correct_answer: 'LDPE UV film', points: 10 },
      { id: 'q5', text: 'Yellow sticky traps in a polyhouse primarily target:', type: 'mcq', options: ['Aphids and whiteflies', 'Slugs and snails', 'Mealybugs', 'Root knot nematodes'], correct_answer: 'Aphids and whiteflies', points: 10 },
      { id: 'q6', text: 'Calcium deficiency in hydroponics typically shows as:', type: 'mcq', options: ['Yellowing of old leaves', 'Tip burn on young leaves', 'Purple stems', 'Brown root tips'], correct_answer: 'Tip burn on young leaves', points: 10 },
      { id: 'q7', text: 'What is the minimum recommended completion watch percentage per module in IGo Academy?', type: 'mcq', options: ['50%', '60%', '70%', '80%'], correct_answer: '80%', points: 10 },
      { id: 'q8', text: 'Which high-value crop is NOT typically grown in NFT hydroponics?', type: 'mcq', options: ['Lettuce', 'Basil', 'Sugarcane', 'Spinach'], correct_answer: 'Sugarcane', points: 10 },
      { id: 'q9', text: 'Biological control using Beauveria bassiana targets:', type: 'mcq', options: ['Fungal diseases', 'Insect pests', 'Root nematodes', 'Viral infections'], correct_answer: 'Insect pests', points: 10 },
      { id: 'q10', text: 'Post-harvest cooling immediately after harvest primarily helps to:', type: 'mcq', options: ['Kill pathogens', 'Remove field heat and extend shelf life', 'Improve colour', 'Increase weight'], correct_answer: 'Remove field heat and extend shelf life', points: 10 },
    ],
  },
  'Hydroponics Farming Course': {
    title: 'Hydroponics Farming — Final Assessment',
    pass_score: 70,
    timer_mins: 25,
    questions: [
      { id: 'q1', text: 'Which hydroponic technique recirculates a thin film of nutrient solution over roots?', type: 'mcq', options: ['Deep Water Culture', 'Nutrient Film Technique', 'Ebb and Flow', 'Wick System'], correct_answer: 'Nutrient Film Technique', points: 10 },
      { id: 'q2', text: 'What does EC stand for in hydroponics?', type: 'mcq', options: ['Electrical Conductivity', 'Elemental Carbon', 'Environmental Control', 'Enzyme Concentration'], correct_answer: 'Electrical Conductivity', points: 10 },
      { id: 'q3', text: 'The ideal pH range for most hydroponic crops is:', type: 'mcq', options: ['4.0 – 5.0', '5.5 – 6.5', '7.0 – 8.0', '8.5 – 9.5'], correct_answer: '5.5 – 6.5', points: 10 },
    ],
  },
  'Mushroom Cultivation Course': {
    title: 'Mushroom Cultivation — Final Assessment',
    pass_score: 70,
    timer_mins: 25,
    questions: [
      { id: 'q1', text: 'Mushroom spawn is essentially:', type: 'mcq', options: ['Chemical spores', 'Sterilised grain inoculated with mycelium', 'Fungal powder', 'Liquid compost'], correct_answer: 'Sterilised grain inoculated with mycelium', points: 10 },
      { id: 'q2', text: 'Which substrate is most common for Oyster Mushroom?', type: 'mcq', options: ['Red soil', 'Paddy straw', 'Sand', 'Coco peat alone'], correct_answer: 'Paddy straw', points: 10 },
    ],
  },
  'Mud Crab Farming Course': {
    title: 'Mud Crab Farming — Final Assessment',
    pass_score: 70,
    timer_mins: 25,
    questions: [
      { id: 'q1', text: 'FCR stands for:', type: 'mcq', options: ['Feed Cost Ratio', 'Feed Conversion Ratio', 'Fish Culture Rate', 'Fertiliser Content Ratio'], correct_answer: 'Feed Conversion Ratio', points: 10 },
      { id: 'q2', text: 'To prevent mud crabs from escaping, ponds must have:', type: 'mcq', options: ['Deeper water', 'Plastic fencing perimeter', 'High salinity', 'Constant aeration'], correct_answer: 'Plastic fencing perimeter', points: 10 },
    ],
  },
  'Open Cultivation & Precision Farming': {
    title: 'Precision Farming — Final Assessment',
    pass_score: 70,
    timer_mins: 25,
    questions: [
      { id: 'q1', text: 'Precision farming primarily relies on:', type: 'mcq', options: ['Heavy flooding', 'Data-driven irrigation & sensor inputs', 'Chemical sprays only', 'Manual labor'], correct_answer: 'Data-driven irrigation & sensor inputs', points: 10 },
      { id: 'q2', text: 'Which tool is used for automated crop scouting?', type: 'mcq', options: ['Tractor', 'Drone with multispectral camera', 'Water sprinkler', 'Hand shovel'], correct_answer: 'Drone with multispectral camera', points: 10 },
    ],
  },
  'Vertical Farming Training': {
    title: 'Vertical Farming — Final Assessment',
    pass_score: 70,
    timer_mins: 25,
    questions: [
      { id: 'q1', text: 'Indoor vertical farming relies on which light source?', type: 'mcq', options: ['Direct sun', 'LED grow lights', 'Fluorescent household tubes', 'Halogen lamps'], correct_answer: 'LED grow lights', points: 10 },
      { id: 'q2', text: 'Controlled Environment Agriculture manages which parameters?', type: 'mcq', options: ['Pond depth', 'CO2, temperature, humidity, and light', 'Rainfall', 'Wind speed only'], correct_answer: 'CO2, temperature, humidity, and light', points: 10 },
    ],
  },
  'Nursery Management Training': {
    title: 'Nursery Management — Final Assessment',
    pass_score: 70,
    timer_mins: 25,
    questions: [
      { id: 'q1', text: 'Which medium is most popular for seedling raising?', type: 'mcq', options: ['River sand', 'Coco peat + Vermiculite + Perlite', 'Urea mixture', 'Clayey mud'], correct_answer: 'Coco peat + Vermiculite + Perlite', points: 10 },
    ],
  },
  'Microgreens Master Program': {
    title: 'Microgreens Master Program — Final Assessment',
    pass_score: 70,
    timer_mins: 25,
    questions: [
      { id: 'q1', text: 'At what stage are microgreens harvested?', type: 'mcq', options: ['Before germination', 'When cotyledon leaves are fully developed', 'After flowering', 'When roots are 1 meter long'], correct_answer: 'When cotyledon leaves are fully developed', points: 10 },
    ],
  },
  'Goat Farming Training': {
    title: 'Goat Farming — Final Assessment',
    pass_score: 70,
    timer_mins: 25,
    questions: [
      { id: 'q1', text: 'Elevated slotted floor sheds are built primarily to:', type: 'mcq', options: ['Make goats taller', 'Maintain hygiene and quick waste clearing', 'Avoid wind', 'Increase feed speed'], correct_answer: 'Maintain hygiene and quick waste clearing', points: 10 },
    ],
  },
  'Rooftop Gardening & Urban Farming': {
    title: 'Rooftop Gardening — Final Assessment',
    pass_score: 70,
    timer_mins: 25,
    questions: [
      { id: 'q1', text: 'What is a critical structural constraint for rooftop gardening?', type: 'mcq', options: ['Pest count', 'Load-bearing capacity of the roof slab', 'Seed color', 'Tap size'], correct_answer: 'Load-bearing capacity of the roof slab', points: 10 },
    ],
  },
  'Industrial Visits & Practical Training': {
    title: 'Industrial Visits — Final Assessment',
    pass_score: 70,
    timer_mins: 25,
    questions: [
      { id: 'q1', text: 'Which setup is typically inspected on industrial farm visits?', type: 'mcq', options: ['Local village market', 'Commercial hydroponic polyhouses and cold stores', 'Hand tool factory', 'Tractor assembly line'], correct_answer: 'Commercial hydroponic polyhouses and cold stores', points: 10 },
    ],
  },
  'Other Specialized Trainings': {
    title: 'Specialized Trainings — Final Assessment',
    pass_score: 70,
    timer_mins: 25,
    questions: [
      { id: 'q1', text: 'Custom agribusiness plans are designed to help:', type: 'mcq', options: ['Cut crop water usage', 'Secure banking loans & governmental subsidies', 'Avoid labor', 'Double seed storage'], correct_answer: 'Secure banking loans & governmental subsidies', points: 10 },
    ],
  },
};

// ── Certificate data ──────────────────────────────────────────────────────
// 3 students who completed courses
const DEMO_CERTS = [
  { studentEmail: 'student.arjun@igoacademy.in',   courseTitle: 'Polyhouse Farming Certification Course', certId: 'IGO-2026-HY4X9K', issuedDaysAgo: 15 },
  { studentEmail: 'student.priya@igoacademy.in',    courseTitle: 'Hydroponics Farming Course',          certId: 'IGO-2026-OF7R2M', issuedDaysAgo: 8  },
  { studentEmail: 'student.karthik@igoacademy.in',  courseTitle: 'Rooftop Gardening & Urban Farming', certId: 'IGO-2026-SI3P5W', issuedDaysAgo: 3  },
];

exports.seed = async function (knex) {
  // ── Fetch all courses, students, trainer by email/title ─────────────────
  const courseRows = await knex('courses').select('id', 'title');
  const byTitle = Object.fromEntries(courseRows.map(r => [r.title, r.id]));

  const adminRow = await knex('users').where({ role: 'admin' }).first();

  const studentEmails = [
    'student.arjun@igoacademy.in',
    'student.priya@igoacademy.in',
    'student.karthik@igoacademy.in',
    'student.meena@igoacademy.in',
    'student.suresh@igoacademy.in',
  ];
  const studentRows = await knex('users').whereIn('email', studentEmails).select('id', 'email');
  const studentByEmail = Object.fromEntries(studentRows.map(r => [r.email, r.id]));

  // ── Modules ──────────────────────────────────────────────────────────────
  for (const [courseTitle, modules] of Object.entries(MODULES_BY_COURSE)) {
    const courseId = byTitle[courseTitle];
    if (!courseId) continue;

    for (const mod of modules) {
      const exists = await knex('class_modules')
        .where({ course_id: courseId, title: mod.title }).first();
      if (!exists) {
        await knex('class_modules').insert({ ...mod, course_id: courseId, is_published: true });
      } else if (mod.video_s3_key && !exists.video_s3_key) {
        await knex('class_modules').where({ id: exists.id }).update({ video_s3_key: mod.video_s3_key });
      }
    }
    console.log(`[Seed] ✅ Modules seeded for: ${courseTitle}`);
  }

  // ── Assessments ──────────────────────────────────────────────────────────
  const assessmentIds = {};
  for (const [courseTitle, quiz] of Object.entries(QUIZ_BY_COURSE)) {
    const courseId = byTitle[courseTitle];
    if (!courseId) continue;

    let assessment = await knex('assessments')
      .where({ course_id: courseId, title: quiz.title }).first();
    if (!assessment) {
      [assessment] = await knex('assessments').insert({
        course_id:         courseId,
        created_by:        adminRow?.id,
        title:             quiz.title,
        type:              'quiz',
        questions:         JSON.stringify(quiz.questions),
        max_score:         quiz.questions.length * 10,
        pass_score:        quiz.pass_score,
        timer_mins:        quiz.timer_mins,
        max_attempts:      3,
        shuffle_questions: true,
        shuffle_options:   true,
        is_published:      true,
      }).returning('*');
      console.log(`[Seed] ✅ Assessment created: ${quiz.title}`);
    }
    assessmentIds[courseTitle] = assessment.id;
  }

  // ── Submissions (graded, some passing) ────────────────────────────────────
  // Arjun: passed Hydroponics (90/100)
  // Priya: passed Organic Farming (80/80)
  // Karthik: passed Smart Irrigation (50/50)
  // Meena: submitted IPM (failed, score 40/50)
  // Suresh: submitted Organic (50/80, failed)

  const submissions = [
    {
      studentEmail: 'student.arjun@igoacademy.in',
      courseTitle:  'Polyhouse Farming Certification Course',
      score:        90, status: 'graded', attempt: 1,
      answers: [
        { question_id: 'q1', selected_answer: 'Nutrient Film Technique' },
        { question_id: 'q2', selected_answer: 'Electrical Conductivity' },
        { question_id: 'q3', selected_answer: '5.5 – 6.5' },
        { question_id: 'q4', selected_answer: 'LDPE UV film' },
        { question_id: 'q5', selected_answer: 'Aphids and whiteflies' },
        { question_id: 'q6', selected_answer: 'Tip burn on young leaves' },
        { question_id: 'q7', selected_answer: '80%' },
        { question_id: 'q8', selected_answer: 'Sugarcane' },
        { question_id: 'q9', selected_answer: 'Insect pests' },
        { question_id: 'q10', selected_answer: 'Remove field heat and extend shelf life' },
      ],
      feedback: 'Excellent work, Arjun! You demonstrated strong understanding of nutrient management and post-harvest handling.',
    },
    {
      studentEmail: 'student.priya@igoacademy.in',
      courseTitle:  'Hydroponics Farming Course',
      score:        30, status: 'graded', attempt: 1,
      answers: [
        { question_id: 'q1', selected_answer: 'Nutrient Film Technique' },
        { question_id: 'q2', selected_answer: 'Electrical Conductivity' },
        { question_id: 'q3', selected_answer: '5.5 – 6.5' },
      ],
      feedback: 'Great performance, Priya! All core hydroponics principles answered correctly.',
    },
    {
      studentEmail: 'student.karthik@igoacademy.in',
      courseTitle:  'Vertical Farming Training',
      score:        20, status: 'graded', attempt: 1,
      answers: [
        { question_id: 'q1', selected_answer: 'LED grow lights' },
        { question_id: 'q2', selected_answer: 'CO2, temperature, humidity, and light' },
      ],
      feedback: 'Well done, Karthik! Perfect score on the vertical farming assessment.',
    },
    {
      studentEmail: 'student.meena@igoacademy.in',
      courseTitle:  'Mud Crab Farming Course',
      score:        10, status: 'graded', attempt: 1,
      answers: [
        { question_id: 'q1', selected_answer: 'Feed Cost Ratio' },
        { question_id: 'q2', selected_answer: 'Plastic fencing perimeter' },
      ],
      feedback: 'Meena, you scored 10/20. Please review the crab de-escaping and pond construction modules.',
    },
    {
      studentEmail: 'student.suresh@igoacademy.in',
      courseTitle:  'Hydroponics Farming Course',
      score:        10, status: 'graded', attempt: 1,
      answers: [
        { question_id: 'q1', selected_answer: 'Wick System' },
        { question_id: 'q2', selected_answer: 'Electrical Conductivity' },
        { question_id: 'q3', selected_answer: '7.0 – 8.0' },
      ],
      feedback: 'Suresh, you scored 10/30. Please review pH ranges and wick system limits.',
    },
  ];

  for (const s of submissions) {
    const studentId  = studentByEmail[s.studentEmail];
    const assessmentId = assessmentIds[s.courseTitle];
    if (!studentId || !assessmentId) continue;

    const exists = await knex('submissions')
      .where({ assessment_id: assessmentId, student_id: studentId, attempt_number: s.attempt }).first();
    if (!exists) {
      const now = new Date();
      const submittedAt = new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000); // within last 7 days
      await knex('submissions').insert({
        assessment_id:  assessmentId,
        student_id:     studentId,
        answers:        JSON.stringify(s.answers),
        score:          s.score,
        feedback:       s.feedback,
        graded_by:      adminRow?.id,
        attempt_number: s.attempt,
        status:         s.status,
        submitted_at:   submittedAt,
        graded_at:      new Date(),
      });
    }
  }
  console.log('[Seed] ✅ Submissions seeded (5 graded submissions)');

  // ── Certificates ─────────────────────────────────────────────────────────
  for (const cert of DEMO_CERTS) {
    const existing = await knex('certificates').where({ certificate_id: cert.certId }).first();
    if (existing) continue;

    const studentId = studentByEmail[cert.studentEmail];
    const courseId  = byTitle[cert.courseTitle];
    if (!studentId || !courseId) continue;

    const issuedAt = new Date(Date.now() - cert.issuedDaysAgo * 24 * 60 * 60 * 1000);
    await knex('certificates').insert({
      certificate_id: cert.certId,
      student_id:     studentId,
      course_id:      courseId,
      pdf_s3_key:     `certificates/demo/${cert.certId}.pdf`,
      issued_at:      issuedAt,
      is_valid:       true,
    });
    console.log(`[Seed] ✅ Certificate issued: ${cert.certId} → ${cert.studentEmail}`);
  }
};
