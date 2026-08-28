/**
 * WorkshopsPage — standalone "Upcoming Agriculture Workshops" page
 * (website refinement spec, Section 11 — Workshops Section).
 *
 * Workshops are a distinct, lower-commitment product from the full
 * programs, so they get their own page rather than living inside the
 * Programs/Catalog grid. The three workshops below are the ones named in
 * the spec; add more here as new dates/fees are confirmed — this list is
 * intentionally simple/static for now rather than a fake filter UI over
 * data we don't have yet.
 */
import PublicNav from '@/components/layout/PublicNav';
import MobileStickyCta from '@/components/layout/MobileStickyCta';
import EnquiryForm from '@/components/features/EnquiryForm';
import SEO from '@/components/common/SEO';
import SiteFooter from '@/components/layout/SiteFooter';
import { Sprout } from 'lucide-react';

const WORKSHOPS = [
  {
    name: 'Hydroponics Workshop',
    details: '1 Day · Practical Learning · ₹300 / Student',
  },
  {
    name: 'Polyhouse Farming Workshop',
    details: '1 Day · Campus Program · Practical Demonstration',
  },
  {
    name: 'Microgreens Workshop',
    details: 'Hands-on Training · Entrepreneurship Focus',
  },
];

export default function WorkshopsPage() {
  return (
    <div className="page-enter" style={{ minHeight: '100vh', fontFamily: "'Manrope', sans-serif", background: '#F5F7F3' }}>
      <SEO
        title="Upcoming Workshops — IGO Academy"
        description="Short, hands-on agriculture workshops from IGO Academy — Hydroponics, Polyhouse Farming, Microgreens and more. Practical, bookable, entry-level."
        path="/workshops"
      />
      <PublicNav />

      <section style={{ background: 'linear-gradient(135deg, #0C2014 0%, #235C39 100%)', padding: '3.5rem 2rem', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 900, marginBottom: '.6rem' }}>
          Upcoming Agriculture Workshops
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', maxWidth: 620, margin: '0 auto' }}>
          Short, hands-on sessions — a lower-commitment, faster way to get a real feel for a domain before enrolling in a full program.
        </p>
      </section>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '3.5rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
          {WORKSHOPS.map(w => (
            <div key={w.name} style={{ background: 'white', border: '1px solid rgba(0,0,0,.07)', borderRadius: 20, padding: '1.75rem', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: '#EDF6E4',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.1rem',
              }}>
                <Sprout size={22} color="#3F8A24" strokeWidth={1.75} />
              </div>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, color: '#0C2014', fontSize: '1.05rem', marginBottom: '.6rem' }}>
                {w.name}
              </h3>
              <p style={{ color: '#6b7280', fontSize: '.85rem', lineHeight: 1.6, margin: 0 }}>{w.details}</p>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '.88rem', marginBottom: '3rem' }}>
          New workshops and dates are added regularly. Enquire below and our team will confirm the next available date, location and seats.
        </p>

        <div id="enquiry-form" style={{ background: 'white', border: '1px solid rgba(0,0,0,.06)', borderRadius: 20, padding: '2rem', maxWidth: 640, margin: '0 auto', scrollMarginTop: 80 }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, color: '#0C2014', marginBottom: '1rem', textAlign: 'center' }}>
            Enquire About a Workshop
          </h3>
          <EnquiryForm
            source="workshops_page"
            compact
            fields={['name', 'mobile', 'email', 'location', 'course_interest_text', 'message']}
            messagePlaceholder="Which workshop, and any preferred dates?"
          />
        </div>
      </div>

      {/* Closing line — website refinement spec, Section 1 & 15 explicitly
          call out "the footer of the smallest workshop page" as a place
          this positioning statement (shortened form) must appear. */}
      <section style={{ background: 'white', padding: '2.5rem 2rem', textAlign: 'center' }}>
        <p style={{
          fontFamily: "'Sora', sans-serif", fontStyle: 'italic', fontWeight: 700,
          fontSize: '1rem', color: '#0C2014', lineHeight: 1.6, maxWidth: 640, margin: '0 auto',
        }}>
          IGO Academy is a practical agriculture learning ecosystem connecting education,
          live farm exposure, industry skills, careers and entrepreneurship.
        </p>
      </section>

      <SiteFooter />
      <MobileStickyCta enquireHref="/workshops" />
    </div>
  );
}
