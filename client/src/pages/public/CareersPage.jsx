/**
 * CareersPage — placement & career outcomes page.
 *
 * The website refinement spec's navigation table (Section 3.1) lists
 * "Careers → Placement & career outcomes page" as a top-level nav item, but
 * no later section in the spec defines this page's content in detail. Per
 * the agreed approach for content the spec doesn't fully specify, this is
 * a clearly-scoped placeholder: it reuses the two career/business pathways
 * already defined elsewhere on the site (rather than inventing job listings
 * that don't exist) and routes visitors to the enquiry form for anything
 * more specific. Expand with real placement listings/outcomes as they
 * become available.
 */
import PublicNav from '@/components/layout/PublicNav';
import MobileStickyCta from '@/components/layout/MobileStickyCta';
import EnquiryForm from '@/components/features/EnquiryForm';
import SEO from '@/components/common/SEO';
import SiteFooter from '@/components/layout/SiteFooter';
import { Award, TrendingUp, ArrowRight } from 'lucide-react';

const PATHWAYS = [
  { title: 'Career Pathway', icon: <Award size={18} color="#1d4ed8" />, steps: ['Training', 'Certification', 'Internship', 'Placement Support', 'Employment'] },
  { title: 'Business Pathway', icon: <TrendingUp size={18} color="#ea580c" />, steps: ['Training', 'Business Planning', 'Project Planning', 'Farm Setup', 'Technical Guidance', 'Business Growth'] },
];

export default function CareersPage() {
  return (
    <div className="page-enter" style={{ minHeight: '100vh', fontFamily: "'Manrope', sans-serif", background: '#F5F7F3' }}>
      <SEO
        title="Careers — IGO Academy"
        description="Placement guidance, internship support and entrepreneurship pathways for IGO Academy graduates."
        path="/careers"
      />
      <PublicNav />

      <section style={{ background: 'linear-gradient(135deg, #0C2014 0%, #235C39 100%)', padding: '3.5rem 2rem', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 900, marginBottom: '.6rem' }}>
          Careers &amp; Placement Support
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', maxWidth: 620, margin: '0 auto' }}>
          Two ways forward after training with IGO Academy — a job, or a business of your own.
        </p>
      </section>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '3.5rem 1.5rem' }}>
        {PATHWAYS.map(path => (
          <div key={path.title} style={{ background: 'white', border: '1px solid rgba(0,0,0,.07)', borderRadius: 20, padding: '1.75rem', marginBottom: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.1rem' }}>
              {path.icon}
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0C2014', fontFamily: "'Sora', sans-serif" }}>{path.title}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '.6rem' }}>
              {path.steps.map((step, i, arr) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                  <span style={{
                    background: '#F5F7F3', border: '1px solid rgba(0,0,0,.08)', color: '#0C2014',
                    fontWeight: 700, fontSize: '.82rem', padding: '.55rem 1.05rem', borderRadius: 12,
                  }}>{step}</span>
                  {i < arr.length - 1 && <ArrowRight size={14} color="#9ca3af" />}
                </div>
              ))}
            </div>
          </div>
        ))}

        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '.88rem', margin: '2rem 0 3rem' }}>
          Specific placement listings and outcomes are published as batches complete. Use the form below to ask about current opportunities for a program you're interested in.
        </p>

        <div id="enquiry-form" style={{ background: 'white', border: '1px solid rgba(0,0,0,.06)', borderRadius: 20, padding: '2rem', maxWidth: 640, margin: '0 auto', scrollMarginTop: 80 }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, color: '#0C2014', marginBottom: '1rem', textAlign: 'center' }}>
            Ask About Career &amp; Placement Support
          </h3>
          <EnquiryForm
            source="careers_page"
            compact
            fields={['name', 'mobile', 'email', 'course_interest_text', 'message']}
          />
        </div>
      </div>

      <SiteFooter />
      <MobileStickyCta enquireHref="/careers" />
    </div>
  );
}
