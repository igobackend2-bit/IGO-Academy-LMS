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
  'Polyhouse & Hydroponics Farming': [
    { title: 'Introduction to Controlled-Environment Agriculture', description: 'Overview of polyhouse design types, materials (LDPE, shade nets), site selection, and climate control basics.', order_index: 1, duration_secs: 3240, completion_pct: 80, video_s3_key: DEMO_VIDEO_URL },
    { title: 'Nutrient Solution Management', description: 'EC & pH principles, macro/micro nutrient ratios, reservoir maintenance, and common deficiency diagnosis with photos.', order_index: 2, duration_secs: 4800, completion_pct: 80 },
    { title: 'Crop Selection & Planting Systems', description: 'NFT, DWC, and drip-to-waste compared; high-value crop calendar; seeding, transplant density, and spacing guides.', order_index: 3, duration_secs: 4200, completion_pct: 80 },
    { title: 'Pest & Disease Control in Enclosed Spaces', description: 'Biological agents, yellow sticky traps, IPM rotation, and disinfection protocols between crop cycles.', order_index: 4, duration_secs: 3600, completion_pct: 80 },
    { title: 'Harvest, Packaging & Market Linkage', description: 'Maturity indices, post-harvest cooling, FSSAI labelling, and connecting with modern retailers and online channels.', order_index: 5, duration_secs: 2700, completion_pct: 80 },
  ],
  'Organic Farming Mastery': [
    { title: 'Principles of Organic Agriculture', description: 'What organic means legally and agronomically — NPOP & PGS-India standards, prohibited inputs, and certification pathways.', order_index: 1, duration_secs: 2400, completion_pct: 80 },
    { title: 'Soil Health & Composting', description: 'Vermicompost, NADEP compost, Jeevamrit preparation, green manuring, and soil testing interpretation.', order_index: 2, duration_secs: 3600, completion_pct: 80 },
    { title: 'Crop Protection Without Chemicals', description: 'Neem-based sprays, Panchagavya, botanical pesticides, trap crops, and documenting inputs for certification audit.', order_index: 3, duration_secs: 3000, completion_pct: 80 },
    { title: 'Market Access & Premium Pricing', description: 'Organic melas, SAFAL, Jaivik Bharat portal, export registration, and negotiating farm-gate contracts.', order_index: 4, duration_secs: 2700, completion_pct: 80 },
  ],
  'Integrated Pest Management': [
    { title: 'IPM Philosophy & Economic Thresholds', description: 'ETL/EIL concepts, scouting protocols, pest population monitoring, and building decision trees for spray timing.', order_index: 1, duration_secs: 3000, completion_pct: 80 },
    { title: 'Biological Control Agents', description: 'Trichogramma, Chrysoperla, Beauveria bassiana, NPV virus — sourcing, storage, release rates, and compatibility with other inputs.', order_index: 2, duration_secs: 3600, completion_pct: 80 },
    { title: 'Mechanical & Cultural Controls', description: 'Sticky traps, pheromone traps, light traps, crop rotation sequences, and border crop strategies for major South Indian crops.', order_index: 3, duration_secs: 2700, completion_pct: 80 },
    { title: 'Safe & Targeted Pesticide Use', description: 'Reading labels, PHI intervals, resistance management, mixing compatibility, and protective equipment standards.', order_index: 4, duration_secs: 3300, completion_pct: 80 },
    { title: 'Building a Farm IPM Calendar', description: 'Season-wise scheduling, record keeping for certification, and conducting a post-season performance review.', order_index: 5, duration_secs: 2400, completion_pct: 80 },
  ],
  'Agri Supply Chain Management': [
    { title: 'Understanding the Agri Value Chain', description: 'Farm gate → processor → retailer → consumer: margin analysis, who captures value, and where disruption opportunities exist.', order_index: 1, duration_secs: 3000, completion_pct: 80 },
    { title: 'Forming & Running a Farmer Producer Organisation', description: 'FPO registration, bylaws, board structure, equity model, government schemes (SFAC, NABARD), and first-year operations checklist.', order_index: 2, duration_secs: 4200, completion_pct: 80 },
    { title: 'Post-Harvest Handling & Cold Chain', description: 'Pre-cooling, CA/MA storage, ripening chambers, refrigerated transport norms, and reducing spoilage losses.', order_index: 3, duration_secs: 3600, completion_pct: 80 },
    { title: 'Digital Channels & E-commerce for Farmers', description: 'Kisan e-mandi, AgriBazaar, eNAM, direct-to-consumer (D2C) on Amazon/Meesho — account setup, cataloguing, and fulfilment.', order_index: 4, duration_secs: 3000, completion_pct: 80 },
    { title: 'Contract Farming & Agri Finance', description: 'Drafting buyback agreements, KCC loan, PMFME grant, WDRA warehouse receipt financing, and basic P&L modelling.', order_index: 5, duration_secs: 3600, completion_pct: 80 },
  ],
  'Commercial Aquaculture': [
    { title: 'Site Selection & Pond Construction', description: 'Soil suitability tests, water source analysis, bund design for vannamei & freshwater species, and govt clearance requirements.', order_index: 1, duration_secs: 3600, completion_pct: 80 },
    { title: 'Species Biology & Stocking', description: 'Vannamei, tilapia, rohu, catla — growth rates, optimal densities, seed quality assessment, and sourcing from certified hatcheries.', order_index: 2, duration_secs: 4200, completion_pct: 80 },
    { title: 'Feed Management & FCR Optimisation', description: 'Feed formulation, feeding frequency, FCR calculation, auto-feeders, and cost-per-kg benchmarks for profit planning.', order_index: 3, duration_secs: 3600, completion_pct: 80 },
    { title: 'Water Quality & Aeration', description: 'DO, pH, ammonia, salinity monitoring; paddle-wheel aerator sizing; probiotics; water exchange strategies.', order_index: 4, duration_secs: 3000, completion_pct: 80 },
    { title: 'Disease Prevention & Export Standards', description: 'WSSV, EMS prevention; antibiotic-free protocols; MPEDA & APEDA registration; traceability for European buyers.', order_index: 5, duration_secs: 3300, completion_pct: 80 },
  ],
  'Smart Irrigation & Water Management': [
    { title: 'Water Audit & Crop Water Requirement', description: 'Penman-Monteith method, ET crop coefficients, soil moisture deficit calculation, and identifying inefficiencies in existing systems.', order_index: 1, duration_secs: 3000, completion_pct: 80 },
    { title: 'Drip Irrigation System Design', description: 'Lateral spacing, emitter selection, pressure vs. flow curves, filtration (disc, sand, screen), and flushing schedules.', order_index: 2, duration_secs: 4200, completion_pct: 80 },
    { title: 'Fertigation & Nutrient Scheduling', description: 'Water-soluble fertilisers, venturi injectors, fertigation scheduling with crop growth stages, and EC monitoring.', order_index: 3, duration_secs: 3600, completion_pct: 80 },
    { title: 'IoT Sensors & Automation', description: 'Soil moisture sensors, tensiometers, weather stations, micro-controllers (Arduino/ESP), and SMS/app alert systems.', order_index: 4, duration_secs: 3600, completion_pct: 80 },
    { title: 'PMKSY Subsidies & Watershed Structures', description: 'Applying for drip subsidy, farm pond construction under PMKSY, check dams, and water harvesting pits for dry-land farms.', order_index: 5, duration_secs: 2700, completion_pct: 80 },
  ],
};

// ── Assessment quiz questions per course ──────────────────────────────────
const QUIZ_BY_COURSE = {
  'Polyhouse & Hydroponics Farming': {
    title: 'Hydroponics & Polyhouse — Final Assessment',
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
  'Organic Farming Mastery': {
    title: 'Organic Farming — Final Assessment',
    pass_score: 70,
    timer_mins: 25,
    questions: [
      { id: 'q1', text: 'Which body governs organic certification in India?', type: 'mcq', options: ['FSSAI', 'APEDA / NPOP', 'BIS', 'IARI'], correct_answer: 'APEDA / NPOP', points: 10 },
      { id: 'q2', text: 'Jeevamrit is prepared using:', type: 'mcq', options: ['Chemical fertilisers', 'Cow dung, cow urine, jaggery, pulse flour, and soil', 'Neem oil and water', 'Fish emulsion'], correct_answer: 'Cow dung, cow urine, jaggery, pulse flour, and soil', points: 10 },
      { id: 'q3', text: 'The conversion period for a farm to become certified organic is typically:', type: 'mcq', options: ['6 months', '12 months', '2–3 years', '5 years'], correct_answer: '2–3 years', points: 10 },
      { id: 'q4', text: 'NADEP composting is named after:', type: 'mcq', options: ['A government scheme', 'Narayan Deotao Pandhari Panzade (its inventor)', 'A fertiliser brand', 'A ministry circular'], correct_answer: 'Narayan Deotao Pandhari Panzade (its inventor)', points: 10 },
      { id: 'q5', text: 'Which of the following is allowed under NPOP standards?', type: 'mcq', options: ['Synthetic growth regulators', 'Vermicompost', 'Chlorpyrifos', 'Urea'], correct_answer: 'Vermicompost', points: 10 },
      { id: 'q6', text: 'Panchagavya is classified as a:', type: 'mcq', options: ['Synthetic pesticide', 'Organic growth promoter', 'Chemical fertiliser', 'Fungicide'], correct_answer: 'Organic growth promoter', points: 10 },
      { id: 'q7', text: 'Green manuring improves soil primarily by:', type: 'mcq', options: ['Adding potassium', 'Adding organic matter and nitrogen', 'Reducing soil pH', 'Killing pests'], correct_answer: 'Adding organic matter and nitrogen', points: 10 },
      { id: 'q8', text: 'Jaivik Bharat is:', type: 'mcq', options: ['An NGO', 'A government logo for certified organic products sold in India', 'A pesticide brand', 'A soil testing service'], correct_answer: 'A government logo for certified organic products sold in India', points: 10 },
    ],
  },
  'Integrated Pest Management': {
    title: 'Integrated Pest Management — Final Assessment',
    pass_score: 70,
    timer_mins: 30,
    questions: [
      { id: 'q1', text: 'ETL stands for:', type: 'mcq', options: ['Economic Threshold Level', 'Estimated Toxicity Limit', 'Effective Treatment Level', 'Entomological Trap Load'], correct_answer: 'Economic Threshold Level', points: 10 },
      { id: 'q2', text: 'Trichogramma is used to control:', type: 'mcq', options: ['Stem borers (egg parasitoid)', 'Soil-borne fungi', 'Whiteflies by feeding on them', 'Nematodes'], correct_answer: 'Stem borers (egg parasitoid)', points: 10 },
      { id: 'q3', text: 'A pheromone trap works by:', type: 'mcq', options: ['Killing insects on contact', 'Attracting insects using synthetic sex pheromones', 'Repelling insects with smell', 'Disrupting feeding behaviour'], correct_answer: 'Attracting insects using synthetic sex pheromones', points: 10 },
      { id: 'q4', text: 'PHI (Pre-Harvest Interval) refers to:', type: 'mcq', options: ['Days between two pesticide applications', 'Days between last spray and harvest', 'Days of storage after harvest', 'Hours before spraying stops rain wash-off'], correct_answer: 'Days between last spray and harvest', points: 10 },
      { id: 'q5', text: 'Crop rotation helps manage pests primarily by:', type: 'mcq', options: ['Adding more nutrients', 'Breaking the pest lifecycle by changing host plant', 'Increasing yield directly', 'Reducing irrigation needs'], correct_answer: 'Breaking the pest lifecycle by changing host plant', points: 10 },
    ],
  },
  'Agri Supply Chain Management': {
    title: 'Agri Supply Chain — Final Assessment',
    pass_score: 70,
    timer_mins: 25,
    questions: [
      { id: 'q1', text: 'FPO stands for:', type: 'mcq', options: ['Farm Procurement Order', 'Farmer Producer Organisation', 'Food Processing Operation', 'Financial Planning Office'], correct_answer: 'Farmer Producer Organisation', points: 10 },
      { id: 'q2', text: 'eNAM is:', type: 'mcq', options: ['A fertiliser brand', 'Electronic National Agriculture Market', 'An NGO for farmers', 'A cold storage scheme'], correct_answer: 'Electronic National Agriculture Market', points: 10 },
      { id: 'q3', text: 'SFAC promotes FPO formation and is under:', type: 'mcq', options: ['Ministry of Finance', 'Ministry of Agriculture & Farmers Welfare', 'NABARD directly', 'RBI'], correct_answer: 'Ministry of Agriculture & Farmers Welfare', points: 10 },
      { id: 'q4', text: 'A Warehouse Receipt allows farmers to:', type: 'mcq', options: ['Export directly without tax', 'Pledge stored produce as collateral for a loan', 'Bypass APMC mandis legally', 'Get crop insurance automatically'], correct_answer: 'Pledge stored produce as collateral for a loan', points: 10 },
      { id: 'q5', text: 'Cold chain logistics primarily reduces:', type: 'mcq', options: ['Water content of produce', 'Post-harvest spoilage losses', 'Seed costs', 'Transport taxes'], correct_answer: 'Post-harvest spoilage losses', points: 10 },
    ],
  },
  'Commercial Aquaculture': {
    title: 'Commercial Aquaculture — Final Assessment',
    pass_score: 70,
    timer_mins: 25,
    questions: [
      { id: 'q1', text: 'FCR stands for:', type: 'mcq', options: ['Feed Cost Ratio', 'Feed Conversion Ratio', 'Fish Culture Rate', 'Fertiliser Content Ratio'], correct_answer: 'Feed Conversion Ratio', points: 10 },
      { id: 'q2', text: 'The ideal DO (Dissolved Oxygen) level in a vannamei shrimp pond is:', type: 'mcq', options: ['1-2 mg/L', '3-4 mg/L', '>5 mg/L', '>10 mg/L'], correct_answer: '>5 mg/L', points: 10 },
      { id: 'q3', text: 'WSSV stands for:', type: 'mcq', options: ['Water Surface Speed Velocity', 'White Spot Syndrome Virus', 'Water Safety Standards Verification', 'Wide-Spectrum Shrimp Vaccine'], correct_answer: 'White Spot Syndrome Virus', points: 10 },
      { id: 'q4', text: 'MPEDA is the body that issues:', type: 'mcq', options: ['Fishing licences', 'Export registration for marine products', 'FPO certificates', 'Farm pond subsidies'], correct_answer: 'Export registration for marine products', points: 10 },
      { id: 'q5', text: 'Adding probiotics to aquaculture ponds helps by:', type: 'mcq', options: ['Increasing pond depth', 'Improving gut health and competitive exclusion of pathogens', 'Reducing water temperature', 'Increasing saline content'], correct_answer: 'Improving gut health and competitive exclusion of pathogens', points: 10 },
    ],
  },
  'Smart Irrigation & Water Management': {
    title: 'Smart Irrigation & Water Management — Final Assessment',
    pass_score: 70,
    timer_mins: 25,
    questions: [
      { id: 'q1', text: 'Drip irrigation achieves water savings primarily by:', type: 'mcq', options: ['Flooding the field faster', 'Delivering water directly to the root zone with minimal evaporation', 'Using recycled wastewater', 'Spraying at night only'], correct_answer: 'Delivering water directly to the root zone with minimal evaporation', points: 10 },
      { id: 'q2', text: 'PMKSY stands for:', type: 'mcq', options: ['Pradhan Mantri Krishi Sinchayee Yojana', 'Pradhan Mantri Khet Suraksha Yojana', 'Prime Minister Kisan Sahayata Yojana', 'Pradhan Mantri Krishi Samridhi Yojana'], correct_answer: 'Pradhan Mantri Krishi Sinchayee Yojana', points: 10 },
      { id: 'q3', text: 'A tensiometer measures:', type: 'mcq', options: ['Water temperature', 'Soil moisture tension (how hard roots must work to extract water)', 'Water pH', 'Rainfall'], correct_answer: 'Soil moisture tension (how hard roots must work to extract water)', points: 10 },
      { id: 'q4', text: 'Fertigation means:', type: 'mcq', options: ['Fertilising between seasons', 'Applying dissolved fertilisers through the irrigation system', 'Using organic fertiliser only', 'Injecting pesticides via drip lines'], correct_answer: 'Applying dissolved fertilisers through the irrigation system', points: 10 },
      { id: 'q5', text: 'ESP32 / Arduino in farm automation is used to:', type: 'mcq', options: ['Process satellite images', 'Read sensor data and trigger valves/alerts via mobile', 'Replace drip emitters', 'Perform soil testing chemically'], correct_answer: 'Read sensor data and trigger valves/alerts via mobile', points: 10 },
    ],
  },
};

// ── Certificate data ──────────────────────────────────────────────────────
// 3 students who completed courses
const DEMO_CERTS = [
  { studentEmail: 'student.arjun@igoacademy.in',   courseTitle: 'Polyhouse & Hydroponics Farming', certId: 'IGO-2026-HY4X9K', issuedDaysAgo: 15 },
  { studentEmail: 'student.priya@igoacademy.in',    courseTitle: 'Organic Farming Mastery',          certId: 'IGO-2026-OF7R2M', issuedDaysAgo: 8  },
  { studentEmail: 'student.karthik@igoacademy.in',  courseTitle: 'Smart Irrigation & Water Management', certId: 'IGO-2026-SI3P5W', issuedDaysAgo: 3  },
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
      courseTitle:  'Polyhouse & Hydroponics Farming',
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
      courseTitle:  'Organic Farming Mastery',
      score:        80, status: 'graded', attempt: 1,
      answers: [
        { question_id: 'q1', selected_answer: 'APEDA / NPOP' },
        { question_id: 'q2', selected_answer: 'Cow dung, cow urine, jaggery, pulse flour, and soil' },
        { question_id: 'q3', selected_answer: '2–3 years' },
        { question_id: 'q4', selected_answer: 'Narayan Deotao Pandhari Panzade (its inventor)' },
        { question_id: 'q5', selected_answer: 'Vermicompost' },
        { question_id: 'q6', selected_answer: 'Organic growth promoter' },
        { question_id: 'q7', selected_answer: 'Adding organic matter and nitrogen' },
        { question_id: 'q8', selected_answer: 'A government logo for certified organic products sold in India' },
      ],
      feedback: 'Great performance, Priya! All core organic principles answered correctly.',
    },
    {
      studentEmail: 'student.karthik@igoacademy.in',
      courseTitle:  'Smart Irrigation & Water Management',
      score:        50, status: 'graded', attempt: 1,
      answers: [
        { question_id: 'q1', selected_answer: 'Delivering water directly to the root zone with minimal evaporation' },
        { question_id: 'q2', selected_answer: 'Pradhan Mantri Krishi Sinchayee Yojana' },
        { question_id: 'q3', selected_answer: 'Soil moisture tension (how hard roots must work to extract water)' },
        { question_id: 'q4', selected_answer: 'Applying dissolved fertilisers through the irrigation system' },
        { question_id: 'q5', selected_answer: 'Read sensor data and trigger valves/alerts via mobile' },
      ],
      feedback: 'Well done, Karthik! Perfect score on the final assessment.',
    },
    {
      studentEmail: 'student.meena@igoacademy.in',
      courseTitle:  'Integrated Pest Management',
      score:        30, status: 'graded', attempt: 1,
      answers: [
        { question_id: 'q1', selected_answer: 'Estimated Toxicity Limit' },
        { question_id: 'q2', selected_answer: 'Stem borers (egg parasitoid)' },
        { question_id: 'q3', selected_answer: 'Repelling insects with smell' },
        { question_id: 'q4', selected_answer: 'Days between last spray and harvest' },
        { question_id: 'q5', selected_answer: 'Adding more nutrients' },
      ],
      feedback: 'Meena, you need to review ETL/EIL concepts and pest control strategies. Please re-attempt after completing Module 1 again.',
    },
    {
      studentEmail: 'student.suresh@igoacademy.in',
      courseTitle:  'Organic Farming Mastery',
      score:        50, status: 'graded', attempt: 1,
      answers: [
        { question_id: 'q1', selected_answer: 'FSSAI' },
        { question_id: 'q2', selected_answer: 'Neem oil and water' },
        { question_id: 'q3', selected_answer: '2–3 years' },
        { question_id: 'q4', selected_answer: 'Narayan Deotao Pandhari Panzade (its inventor)' },
        { question_id: 'q5', selected_answer: 'Vermicompost' },
        { question_id: 'q6', selected_answer: 'Organic growth promoter' },
        { question_id: 'q7', selected_answer: 'Reducing soil pH' },
        { question_id: 'q8', selected_answer: 'An NGO' },
      ],
      feedback: 'Suresh, you scored 50/80. Review certification bodies and organic input preparation. One more attempt available.',
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
