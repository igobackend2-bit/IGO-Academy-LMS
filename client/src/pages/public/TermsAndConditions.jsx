/**
 * Terms & Conditions — governs use of the IGo Academy website, mobile app,
 * and course platform. Content reflects real platform behavior (single
 * active session, enrollment via Cashfree, certificate issuance rules),
 * not generic boilerplate.
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

export default function TermsAndConditions() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Manrope', sans-serif", background: '#F5F7F3' }}>
      <SEO
        title="Terms & Conditions — IGO Academy"
        description="The terms governing use of the IGo Academy website, mobile app, and course platform."
        path="/terms-and-conditions"
      />
      <PublicNav />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '3.5rem 1.5rem 5rem' }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 900, fontSize: 'clamp(1.8rem,4vw,2.4rem)', color: '#0C2014', marginBottom: '.5rem' }}>
          Terms &amp; Conditions
        </h1>
        <p style={{ color: '#6b7280', fontSize: '.85rem', marginBottom: '2.5rem' }}>
          Last updated: {LAST_UPDATED}
        </p>

        <Section title="Who this applies to">
          <p>
            These terms govern your use of the IGo Academy website (<strong>igoacademy.in</strong>) and mobile app, operated
            by the IGO Group, Chennai, Tamil Nadu, India. By registering an account, submitting an enquiry, or enrolling in a
            course, you agree to these terms.
          </p>
        </Section>

        <Section title="Accounts and access">
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li>You're responsible for keeping your login credentials confidential and for all activity under your account.</li>
            <li>Each account supports one active session at a time — signing in on a new device logs out any other active
              session. This is by design, to prevent credential sharing.</li>
            <li>Accounts are personal and non-transferable. Course access is granted to the enrolled individual only.</li>
          </ul>
        </Section>

        <Section title="Enrollment and course access">
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li>Free courses grant immediate access on enrollment. Paid courses require successful payment via Cashfree before
              access is granted.</li>
            <li>Course content, curriculum, trainers, batch dates, fees, and availability are set by IGo Academy and may be
              updated from time to time; we'll aim to communicate material changes to enrolled students.</li>
            <li>Access to a course may be time-limited (an enrollment expiry date). You'll be notified before access ends.</li>
          </ul>
        </Section>

        <Section title="Certification">
          <p>
            A certificate is issued only after you complete the required modules and pass the final assessment at the minimum
            score threshold set for that course. Certificates carry a unique QR code for independent verification at{' '}
            <code style={{ background: '#EDF6E4', padding: '2px 6px', borderRadius: 4 }}>igoacademy.in/verify/&lt;certificateId&gt;</code>.
            TNSDC and MSME recognition applies to the certificate as issued by IGo Academy, in line with each body's own
            published scope.
          </p>
        </Section>

        <Section title="Acceptable use">
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li>Don't share, resell, redistribute, or publicly post course videos, PDFs, or other materials.</li>
            <li>Don't attempt to circumvent enrollment, payment, or access controls.</li>
            <li>Don't submit false information on the enquiry form, registration form, or in support of a certificate.</li>
          </ul>
        </Section>

        <Section title="No guaranteed outcomes">
          <p>
            IGo Academy provides training, practical exposure, and — where applicable — career and entrepreneurship guidance.
            We do not guarantee employment, placement, income, crop yield, or business success as a result of completing any
            course; outcomes depend on many factors outside our control.
          </p>
        </Section>

        <Section title="Payments and fees">
          <p>
            Course fees are displayed on each course page and are payable in Indian Rupees via Cashfree. Fees may change for
            future batches without affecting an already-confirmed enrollment. See our{' '}
            <a href="/refund-policy" style={{ color: '#2d6a14' }}>Refund &amp; Cancellation Policy</a> for cancellation terms.
          </p>
        </Section>

        <Section title="Changes to these terms">
          <p>
            We may update these terms from time to time; the "Last updated" date above reflects the latest revision. Continued
            use of the platform after a change constitutes acceptance of the updated terms.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about these terms? Reach us via the <a href="/contact" style={{ color: '#2d6a14' }}>Contact page</a> or
            at <a href="mailto:info@igoacademy.in" style={{ color: '#2d6a14' }}>info@igoacademy.in</a>.
          </p>
        </Section>
      </div>
    </div>
  );
}
