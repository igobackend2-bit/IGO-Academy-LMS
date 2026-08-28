/**
 * PARTNERS — single shared source of truth for the "Academic & Industry
 * Partnerships" feature (website refinement spec, Section 9). Used by
 * HomePage.jsx (the partnerships grid + Featured Collaboration card) and
 * PartnerProfilePage.jsx (individual partner page at /partners/:slug).
 *
 * Moved here (26 Aug 2026) so there's exactly one copy to update, matching
 * the same pattern already used for SUCCESS_STORIES.
 *
 * description: a neutral, factual description of the partnership itself,
 * not a fabricated quote or claim.
 *
 * externalLink (IGO Group only): a real, live IGO Group brand site.
 *
 * certVerifyId (TNSDC, MSME only): the certificate number of a real,
 * independently verifiable certificate already issued to an IGO Academy
 * student (Selvabharathi D, TN Skill Corporation) — links to the site's
 * own /verify/:certificateId page. This only resolves once that
 * certificate has actually been added in Admin → Certificates on the
 * live database; until then the verify page will correctly report it as
 * not found, the same as it would for any not-yet-issued certificate ID.
 *
 * logo: optional real logo, supplied for each partner as available —
 * cards and the profile page fall back to a generic icon when this is
 * absent. Stored under /public/partners/.
 *
 * gallery (Gandhigram University): the real MOU signing photo at The
 * Gandhigram Rural Institute - Deemed to be University, Ministry of
 * Education, Government of India, supplied by the Academy Head.
 *
 * gallery (VELS University): real, geo-tagged photos from an actual value
 * added course session delivered on VELS's own campus (Technology Business
 * Incubation Center, Pallavaram, Chennai — 9 Mar 2026) and the live
 * polyhouse farm visit that followed it (Paiyanur, Tamil Nadu — 25 Mar
 * 2026), supplied by the Academy Head. Each photo's caption states only
 * what the photo itself documents — nothing fabricated beyond that.
 */
export const PARTNERS = [
  {
    slug: 'gandhigram-university', name: 'Gandhigram University', label: 'MOU Partner',
    logo: '/partners/gandhigram-university-logo.png',
    description: "IGO Academy has entered into a formal MOU with Gandhigram University, extending collaborative agriculture skill development and practical training into the university's academic framework — a model we're scaling with further institutions.",
    gallery: [
      { src: '/partners/gandhigram-university/gandhigram-mou-signing-1.jpg', caption: 'MOU signing between IGO Group and The Gandhigram Rural Institute - Deemed to be University, Ministry of Education, Government of India' },
    ],
  },
  {
    slug: 'vels-university', name: 'VELS University', label: 'Value Added Course Partner',
    logo: '/partners/vels-university-logo.png',
    description: "VELS University partners with IGO Academy to bring a value-added agriculture skill course to its students — delivered on VELS's own campus at the Technology Business Incubation Center, and paired with a hands-on field visit to a live polyhouse farm so classroom learning is backed by real practice.",
    gallery: [
      { src: '/partners/vels-university/vels-campus-1.jpg', caption: "On-campus session at VELS University's Technology Business Incubation Center, Pallavaram, Chennai" },
      { src: '/partners/vels-university/vels-campus-2.jpg', caption: "On-campus session at VELS University's Technology Business Incubation Center, Pallavaram, Chennai" },
      { src: '/partners/vels-university/vels-class-1.jpg', caption: 'IGO Academy Head Shanmathi V teaching protected cultivation techniques as part of the Value Added Course' },
      { src: '/partners/vels-university/vels-class-2.jpg', caption: 'Classroom session covering polyhouse farming and precision agriculture concepts' },
      { src: '/partners/vels-university/vels-farmvisit-1.jpg', caption: 'VELS University students on a live polyhouse farm visit in Paiyanur, Tamil Nadu' },
      { src: '/partners/vels-university/vels-farmvisit-2.jpg', caption: 'VELS University students on a live polyhouse farm visit in Paiyanur, Tamil Nadu' },
    ],
  },
  {
    slug: 'igo-group', name: 'IGO GROUP', label: 'Parent Group',
    logo: '/partners/igo-group-logo.jpg',
    description: 'IGO Academy is the education arm of the IGO Group — a network of 7 divisions and 26 brands transforming Indian agriculture, from live farms and agri-tech to placement and entrepreneurship support for every trainee.',
    externalLink: 'https://www.igoagritechfarms.com/',
    externalLinkLabel: 'Visit IGO Agri Techfarms',
  },
  {
    slug: 'tnsdc-msme', name: 'TNSDC, MSME', label: 'Recognised By',
    logo: '/partners/tnsdc-msme-logo.png',
    description: "IGO Academy's skill training is recognised by TN Skill Corporation (TNSDC) and MSME. Students who clear a government-recognised skill assessment are issued a real, independently verifiable certificate — like the one below.",
    certVerifyId: 'TNSC-NMFS-AGR-POL-1025-0045',
    certVerifyLabel: 'View a Recognised Certificate',
  },
  {
    slug: 'industry-partners', name: 'Industry Partners', label: 'Placement & Project Partner',
    description: 'IGO Academy works with industry partners on placement opportunities and live project collaborations, giving trainees real, hands-on exposure beyond the classroom.',
  },
  {
    slug: 'future-institutional-collaborations', name: 'Future Institutional Collaborations', label: 'Coming Soon',
    description: "Additional institutional collaborations are in progress and will be announced here as they're finalised.",
  },
];
