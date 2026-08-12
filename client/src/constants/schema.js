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
