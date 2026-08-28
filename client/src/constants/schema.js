/**
 * JSON-LD schema builders — only real, verifiable facts about the platform.
 * No fabricated review counts, ratings, or social profile links.
 */

export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'IGo Academy',
  url: 'https://igoacademy.in',
  logo: 'https://igoacademy.in/igo-logo.png',
  description: "India's agri-entrepreneurship training platform — TNSDC and MSME recognised certification for students, farmers and entrepreneurs.",
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Chennai',
    addressRegion: 'Tamil Nadu',
    addressCountry: 'IN',
  },
  parentOrganization: {
    '@type': 'Organization',
    name: 'IGO Group',
  },
};

export const HOME_FAQS = [
  {
    question: 'Who is eligible to join IGo Academy courses?',
    answer: 'Our courses are open to farmers, agriculture students and graduates, entrepreneurs, rural youth, FPO/SHG members, working professionals and existing farm owners — no strict prior qualification is required for most courses.',
  },
  {
    question: 'Is the training practical, or just theory?',
    answer: 'Practical training is central to every course — polyhouse, hydroponics, vertical farming, mushroom cultivation, microgreens, nursery management and more are taught hands-on at real IGO Academy farms, alongside the online curriculum.',
  },
  {
    question: 'How long do courses take, and what does it cost?',
    answer: 'Duration and fees vary by course — check each course page for exact details, or use the Enquire Now form and our team will guide you to the right program and batch for your budget and schedule.',
  },
  {
    question: 'Is IGo Academy certification government-recognised?',
    answer: 'Yes. IGo Academy courses are recognised by TNSDC (Tamil Nadu Skill Development Corporation) and certified by MSME (Ministry of MSME, Government of India).',
  },
  {
    question: 'How do I get my certificate after finishing a course?',
    answer: 'Complete all course modules and pass the final assessment with 70% or higher — your QR-verified digital certificate unlocks instantly for download.',
  },
  {
    question: "Can I verify someone's IGo Academy certificate?",
    answer: 'Yes. Every certificate has a unique QR code and can be independently verified at igoacademy.in/verify/{certificateId}.',
  },
  {
    question: 'Do you offer internship or placement support?',
    answer: 'Yes — our Career Path guides students from training through certification, internship and placement support toward employment in agriculture and allied fields.',
  },
  {
    question: 'Can this help me start my own farm business?',
    answer: 'Yes — our Business Path supports learners from training through business and project planning, farm setup, and ongoing technical guidance as you grow your own agri-enterprise.',
  },
  {
    question: 'How do I register for a course?',
    answer: 'Browse Courses to see what’s available, or submit an enquiry with your course interest — our team will confirm the next batch, fee and registration steps with you directly.',
  },
  {
    question: 'Is IGo Academy connected to other IGO Group businesses?',
    answer: 'Yes. IGo Academy is the education arm of the IGO Group, a network of 7 divisions and 26 brands working across Indian agriculture.',
  },
];

export function buildFaqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}

/** Single-course structured data for the course-detail page (Section SEO). */
export function buildCourseSchema(course) {
  if (!course) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.short_description || course.description || undefined,
    provider: { '@type': 'Organization', name: 'IGO Academy', sameAs: 'https://igoacademy.in' },
  };
}

export function buildCourseListSchema(courses = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: courses.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Course',
        name: c.title,
        description: c.short_description || c.description || undefined,
        provider: { '@type': 'Organization', name: 'IGo Academy', sameAs: 'https://igoacademy.in' },
      },
    })),
  };
}
