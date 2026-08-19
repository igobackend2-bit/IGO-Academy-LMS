/**
 * Refund & Cancellation Policy — applies since online payment (via
 * Razorpay) is in scope for this platform. Doc §13 / §1 scope note.
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

export default function RefundPolicy() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Manrope', sans-serif", background: '#F5F7F3' }}>
      <SEO
        title="Refund & Cancellation Policy — IGO Academy"
        description="IGo Academy's refund and cancellation policy for paid course enrollments."
        path="/refund-policy"
      />
      <PublicNav />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '3.5rem 1.5rem 5rem' }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 900, fontSize: 'clamp(1.8rem,4vw,2.4rem)', color: '#0C2014', marginBottom: '.5rem' }}>
          Refund &amp; Cancellation Policy
        </h1>
        <p style={{ color: '#6b7280', fontSize: '.85rem', marginBottom: '1.5rem' }}>
          Last updated: {LAST_UPDATED}
        </p>

        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '2.5rem', fontSize: '.85rem', color: '#92400e' }}>
          <strong>Draft — pending Academy sign-off.</strong> The specific timeframes and refund percentages below
          (7 days / 50% / 3 days) are placeholder defaults, not confirmed business policy. Please review and tell us
          the Academy's actual refund terms before this page goes live — they're easy to change once confirmed.
        </div>

        <Section title="Scope">
          <p>
            This policy applies to course fees paid online through Razorpay on the IGo Academy website or app. It does not
            cover any fees paid offline directly to IGo Academy staff — for those, please contact us directly to discuss
            cancellation.
          </p>
        </Section>

        <Section title="Cancellation before a batch starts">
          <p>
            If you cancel your enrollment at least 7 days before your batch's start date, you're eligible for a full refund,
            minus any payment-gateway transaction fee already deducted by Razorpay.
          </p>
        </Section>

        <Section title="Cancellation after a batch starts">
          <p>
            If you cancel within the first 3 days after a batch begins and have not accessed more than one course module, a
            50% refund applies. Beyond that point — or once you've accessed more than one module — the enrollment is
            considered utilized and is non-refundable, since course materials and instructor time have already been
            committed.
          </p>
        </Section>

        <Section title="Non-refundable situations">
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li>Change of mind after substantially completing a course.</li>
            <li>Failure to attend live sessions or complete modules by their own choice.</li>
            <li>Enrollments where a certificate has already been issued.</li>
            <li>Any enrollment found to violate our Terms &amp; Conditions (e.g. sharing account access).</li>
          </ul>
        </Section>

        <Section title="How to request a refund">
          <p>
            Submit a request through the <a href="/contact" style={{ color: '#2d6a14' }}>Contact page</a> or email{' '}
            <a href="mailto:info@igoacademy.in" style={{ color: '#2d6a14' }}>info@igoacademy.in</a> with your registered email
            and the course name. Approved refunds are processed back to the original payment method within 7–10 business
            days, subject to your bank's or payment provider's own timelines.
          </p>
        </Section>

        <Section title="Batch postponement or cancellation by IGo Academy">
          <p>
            If IGo Academy postpones or cancels a batch, you may choose to transfer to the next available batch at no extra
            cost, or receive a full refund.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about a refund? Reach us via the <a href="/contact" style={{ color: '#2d6a14' }}>Contact page</a> or at{' '}
            <a href="mailto:info@igoacademy.in" style={{ color: '#2d6a14' }}>info@igoacademy.in</a>.
          </p>
        </Section>
      </div>
    </div>
  );
}
