/**
 * Disclaimer — no guaranteed outcomes (income/placement/yield/business
 * success), general information nature of course content. Doc §3 + §13.
 */
import PublicNav from '@/components/layout/PublicNav';
import SEO from '@/components/common/SEO';

const LAST_UPDATED = 'August 19, 2026';

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: '2.25rem' }}>
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#0C2014', marginBottom: '.75rem' }}>
        {title}
      </h2>
      <div style={{ color: '#4C5B50', fontSize: '.95rem', lineHeight: 1.75 }}>
        {children}
      </div>
    </section>
  );
}

export default function Disclaimer() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Manrope', sans-serif", background: '#F5F7F3' }}>
      <SEO
        title="Disclaimer — IGO Academy"
        description="Important disclaimers about outcomes, advice, and content on the IGo Academy platform."
        path="/disclaimer"
      />
      <PublicNav />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '3.5rem 1.5rem 5rem' }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 900, fontSize: 'clamp(1.8rem,4vw,2.4rem)', color: '#0C2014', marginBottom: '.5rem' }}>
          Disclaimer
        </h1>
        <p style={{ color: '#6b7280', fontSize: '.85rem', marginBottom: '2.5rem' }}>
          Last updated: {LAST_UPDATED}
        </p>

        <Section title="No guaranteed outcomes">
          <p>
            IGo Academy provides agricultural skill training, practical exposure, and career/entrepreneurship guidance. We do
            not guarantee employment, placement, income, crop yield, or business success. Outcomes depend on many factors —
            individual effort, market conditions, local agro-climatic conditions, and factors entirely outside our control —
            that no training program can promise.
          </p>
        </Section>

        <Section title="Educational content, not professional advice">
          <p>
            Course content, including guidance on crop management, farming techniques, and business planning, is provided for
            educational purposes. It is not a substitute for professional agronomic, financial, legal, or business advice
            specific to your land, climate, and circumstances. Consult qualified local experts before making significant
            farming or business decisions.
          </p>
        </Section>

        <Section title="Third-party recognition">
          <p>
            References to TNSDC (Tamil Nadu Skill Development Corporation) and MSME (Ministry of MSME, Government of India)
            recognition describe IGo Academy's own certification status with those bodies at the time of publishing. We are
            not affiliated with, and do not speak on behalf of, TNSDC or the Ministry of MSME beyond that recognition.
          </p>
        </Section>

        <Section title="External links and third-party services">
          <p>
            Our platform uses third-party services (Razorpay for payments, WhatsApp for messaging) that operate under their
            own terms and policies, which we do not control. Any external links are provided for convenience; we're not
            responsible for the content or practices of external sites.
          </p>
        </Section>

        <Section title="Accuracy of information">
          <p>
            We aim to keep course details, batch dates, fees, and other information accurate and current, but errors or
            changes can occur. Please confirm important details (fee, dates, eligibility) with us directly before making
            decisions based on them.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about this disclaimer? Reach us via the <a href="/contact" style={{ color: '#2d6a14' }}>Contact page</a>{' '}
            or at <a href="mailto:info@igoacademy.in" style={{ color: '#2d6a14' }}>info@igoacademy.in</a>.
          </p>
        </Section>
      </div>
    </div>
  );
}
