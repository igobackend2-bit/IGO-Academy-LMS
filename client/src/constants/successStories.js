/**
 * SUCCESS_STORIES — single shared source of truth for the "Student Success"
 * feature (website refinement spec, Section 3.1). Used by HomePage.jsx
 * (homepage teaser grid), StudentSuccessPage.jsx (full list), and
 * StudentProfilePage.jsx (individual profile at /student-success/:slug).
 *
 * Previously this list was duplicated separately in HomePage.jsx and
 * StudentSuccessPage.jsx with a comment saying "kept in sync manually" —
 * moved here (26 Aug 2026) so there's exactly one copy to update and no risk
 * of the two drifting apart, now that a third page (the profile page) also
 * needs the same data.
 *
 * name / role: real IGO Academy trainees now working within the IGO Group
 * itself, provided directly by the Academy Head.
 *
 * roleDescription: a neutral, factual description of what that job role
 * generally involves at IGO Group — written from the role title itself,
 * NOT a personal quote or claim attributed to the individual.
 *
 * testimonial: intentionally `null` for everyone until the Academy Head
 * supplies each person's own words. No first-person quote is ever fabricated
 * and attached to a real named person — StudentProfilePage.jsx shows a
 * "coming soon" placeholder instead of a testimonial when this is null.
 *
 * link / linkLabel: the real IGO Group page for that person's department,
 * verified live on igogroups.in before being added (26 Aug 2026) — shown as
 * a "verify at IGO Group" button on the profile page, not a direct redirect
 * from the card.
 *
 * photo: optional real headshot, supplied by the Academy Head as each
 * person's photo becomes available — cards and profile pages fall back to
 * the initials-circle avatar when this is absent. Stored under
 * /public/success-photos/.
 *
 * video: optional real video message, recorded by the person themselves and
 * supplied by the Academy Head — StudentProfilePage.jsx plays it when
 * present, and shows nothing extra when it's absent. Stored under
 * /public/success-videos/.
 */
export const SUCCESS_STORIES = [
  {
    slug: 'ashmi-berona-ks',
    name: 'Ashmi Berona KS',
    role: 'Academy Junior Manager',
    roleDescription: 'Supports day-to-day Academy operations — coordinating training schedules, student communication and on-campus program delivery.',
    testimonial: null,
    link: 'https://igogroups.in/brands/igo-academy.html',
    linkLabel: 'IGO Academy at IGO Group',
    photo: '/success-photos/ashmi-berona-ks.jpg',
  },
  {
    slug: 'kannan-t',
    name: 'Kannan T',
    role: 'Site Visit Executive',
    roleDescription: 'Conducts field inspections and site visits, verifying farm and training locations to support real, hands-on learning.',
    testimonial: null,
    link: 'https://igogroups.in/departments/site-visit.html',
    linkLabel: 'IGO Site Visit Department',
    photo: '/success-photos/kannan-t.jpg',
  },
  {
    slug: 'punith-m',
    name: 'Punith M',
    role: 'Site Visit SMO',
    roleDescription: 'Handles site monitoring and operations for field visits — quality checks and compliance documentation across farm and project locations.',
    testimonial: null,
    link: 'https://igogroups.in/departments/site-visit.html',
    linkLabel: 'IGO Site Visit Department',
    photo: '/success-photos/punith-m.jpg',
  },
  {
    slug: 'sivani-m',
    name: 'Sivani M',
    role: 'Data Analyst',
    roleDescription: 'Works with Academy and placement data — tracking batch outcomes and performance, and reporting insights back to the team.',
    testimonial: null,
    link: 'https://igogroups.in/departments/data-analytics-legal.html',
    linkLabel: 'IGO Data Analytics & Legal Department',
    photo: '/success-photos/sivani-m.jpg',
    video: '/success-videos/sivani-m.mp4',
  },
  {
    slug: 'subanu-r',
    name: 'Subanu R',
    role: 'Data Analyst',
    roleDescription: 'Works with Academy and placement data — tracking batch outcomes and performance, and reporting insights back to the team.',
    testimonial: null,
    link: 'https://igogroups.in/departments/data-analytics-legal.html',
    linkLabel: 'IGO Data Analytics & Legal Department',
    photo: '/success-photos/subanu-r.jpg',
    video: '/success-videos/subanu-r.mp4',
  },
  {
    slug: 'jenifer-a',
    name: 'Jenifer A',
    role: 'Data Analyst',
    roleDescription: 'Works with Academy and placement data — tracking batch outcomes and performance, and reporting insights back to the team.',
    testimonial: null,
    link: 'https://igogroups.in/departments/data-analytics-legal.html',
    linkLabel: 'IGO Data Analytics & Legal Department',
    photo: '/success-photos/jenifer-a.jpg',
  },
  {
    slug: 'sobin-g',
    name: 'Sobin G',
    role: 'Agri Estate Executive',
    roleDescription: 'Manages on-ground agricultural estate operations, supporting IGO Group’s farm sites.',
    testimonial: null,
    link: 'https://igogroups.in/departments/agri-operations.html',
    linkLabel: 'IGO Agri Operations Department',
    photo: '/success-photos/sobin-g.jpg',
  },
];
