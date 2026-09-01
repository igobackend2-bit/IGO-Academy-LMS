/**
 * Refund & Cancellation Policy — applies to courses, workshops, internships,
 * practical training, farm visits, project guidance and other paid
 * Services offered by IGO Academy (operated by IGO Group).
 */
import PublicNav from '@/components/layout/PublicNav';
import SEO from '@/components/common/SEO';

const LAST_UPDATED = 'August 31, 2026';

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

function GrievanceBox() {
  return (
    <div style={{
      background: '#EDF6E4', border: '1px solid #cfe8bd', borderRadius: 12,
      padding: '1.25rem 1.5rem', fontSize: '.9rem', color: '#234023', lineHeight: 1.8,
    }}>
      <p style={{ margin: 0 }}><strong>Grievance Officer:</strong> Shanmathi</p>
      <p style={{ margin: '.35rem 0 0' }}>
        <strong>Email:</strong>{' '}
        <a href="mailto:igoacademy2026@gmail.com" style={{ color: '#2d6a14' }}>igoacademy2026@gmail.com</a>
      </p>
      <p style={{ margin: '.35rem 0 0' }}>
        <strong>Support:</strong>{' '}
        <a href="mailto:head@igoacademy.in" style={{ color: '#2d6a14' }}>head@igoacademy.in</a>
      </p>
      <p style={{ margin: '.35rem 0 0' }}>
        <strong>Phone:</strong>{' '}
        <a href="tel:+918925893318" style={{ color: '#2d6a14' }}>+91 89258 93318</a>
      </p>
      <p style={{ margin: '.35rem 0 0' }}>
        <strong>Address:</strong> 17, 2nd Main Rd, Kovalan Street, Uthandi, Kanathur, Chennai, Tamil Nadu – 600119
      </p>
    </div>
  );
}

export default function RefundPolicy() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Manrope', sans-serif", background: '#F5F7F3' }}>
      <SEO
        title="Refund & Cancellation Policy — IGO Academy"
        description="IGO Academy's refund and cancellation policy for courses, workshops, internships, practical training, farm visits and other paid Services."
        path="/refund-policy"
      />
      <PublicNav />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '3.5rem 1.5rem 5rem' }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 900, fontSize: 'clamp(1.8rem,4vw,2.4rem)', color: '#0C2014', marginBottom: '.5rem' }}>
          Refund &amp; Cancellation Policy
        </h1>
        <p style={{ color: '#6b7280', fontSize: '.85rem', marginBottom: '1.5rem' }}>
          Last Updated: {LAST_UPDATED}
        </p>

        <p style={{ color: '#4C5B50', fontSize: '.95rem', lineHeight: 1.75, marginBottom: '2.5rem' }}>
          This Policy applies to courses, workshops, internships, practical training, farm visits, project guidance
          and other paid Services offered by IGO Academy.
        </p>

        <Section title="1. Payment">
          <p>
            All fees are displayed in Indian Rupees (₹). Payments may be processed through authorised payment
            partners including Razorpay. Registration is confirmed after successful payment verification or
            enrolment confirmation.
          </p>
        </Section>

        <Section title="2. Online Course Refunds">
          <p>
            Unless specifically stated otherwise, course fees are non-refundable once course access has been
            provided or course materials have been accessed. This includes situations where the learner:
          </p>
          <ul style={{ paddingLeft: '1.25rem', margin: '.75rem 0 0' }}>
            <li>Changes their mind.</li>
            <li>Does not complete the course.</li>
            <li>Does not watch the videos.</li>
            <li>Has personal scheduling issues.</li>
            <li>Does not meet certification requirements.</li>
          </ul>
        </Section>

        <Section title="3. Payment Failure / No Course Access">
          <p>
            If your payment has been deducted but course access has not been activated, contact{' '}
            <a href="mailto:head@igoacademy.in" style={{ color: '#2d6a14' }}>head@igoacademy.in</a> within 7 days
            with your transaction details. IGO Academy will verify the transaction and, where appropriate, process
            the eligible refund.
          </p>
        </Section>

        <Section title="4. Duplicate Payment">
          <p>
            If you are charged more than once for the same transaction due to a payment or technical error, the
            duplicate payment will be investigated. Eligible duplicate amounts will be refunded to the original
            payment method.
          </p>
        </Section>

        <Section title="5. Workshops &amp; Offline Programs">
          <p>Refund and cancellation terms may vary for:</p>
          <ul style={{ paddingLeft: '1.25rem', margin: '.75rem 0' }}>
            <li>Workshops</li>
            <li>College programs</li>
            <li>Offline training</li>
            <li>Practical training</li>
            <li>Farm visits</li>
            <li>Special events</li>
            <li>Institutional programs</li>
          </ul>
          <p>Applicable conditions will be communicated before registration wherever appropriate.</p>
        </Section>

        <Section title="6. Internship Programs">
          <p>
            Internship cancellation and refund conditions may vary according to the specific program. Once an
            internship has commenced or resources have been provided, fees may become non-refundable.
          </p>
        </Section>

        <Section title="7. Cancellation by IGO Academy">
          <p>
            IGO Academy may postpone, reschedule or cancel a program due to operational requirements, trainer
            availability, technical issues, insufficient registrations, safety concerns, government restrictions,
            force majeure events or circumstances beyond reasonable control. Where IGO Academy cancels a program and
            cannot provide a suitable alternative, an eligible refund may be offered according to the applicable
            program terms.
          </p>
        </Section>

        <Section title="8. Participant Cancellation">
          <p>
            Participant cancellation is subject to the specific cancellation terms applicable to the purchased
            program. Once digital course access has been provided or a program has commenced, refunds will
            generally not be available unless specifically stated otherwise.
          </p>
        </Section>

        <Section title="9. Refund Request Period">
          <p>
            For payment errors, duplicate payments or non-receipt of paid access, contact IGO Academy within 7 days
            from the transaction date.
          </p>
          <p style={{ marginTop: '.5rem' }}>
            Email: <a href="mailto:head@igoacademy.in" style={{ color: '#2d6a14' }}>head@igoacademy.in</a><br />
            Phone: <a href="tel:+918925893318" style={{ color: '#2d6a14' }}>+91 89258 93318</a>
          </p>
        </Section>

        <Section title="10. Refund Processing">
          <p>
            Approved refunds will generally be processed to the original payment method. The time taken for the
            refund to appear may depend on the payment gateway, bank or financial institution.
          </p>
        </Section>

        <Section title="11. Non-Refundable Situations">
          <p>Refunds will generally not be provided for:</p>
          <ul style={{ paddingLeft: '1.25rem', margin: '.75rem 0 0' }}>
            <li>Change of mind after course access.</li>
            <li>Failure to attend without applicable cancellation eligibility.</li>
            <li>Failure to complete the course.</li>
            <li>Failure to watch course materials.</li>
            <li>Personal scheduling conflicts.</li>
            <li>Lack of internet/device access.</li>
            <li>Failure to meet eligibility requirements.</li>
            <li>Failure to meet assessment requirements.</li>
            <li>Failure to achieve expected farming, business, employment or financial results.</li>
          </ul>
        </Section>

        <Section title="12. Course Transfer">
          <p>
            Where appropriate, IGO Academy may, at its discretion, allow transfer to another batch, session or
            eligible course subject to availability and applicable terms.
          </p>
        </Section>

        <Section title="13. Promotional Offers">
          <p>
            Promotional prices and discounts may have separate conditions. Once promotional course access is
            provided, the promotional fee will generally be non-refundable unless otherwise specified.
          </p>
        </Section>

        <Section title="14. Consumer Rights">
          <p>
            Nothing in this Policy is intended to exclude or restrict any consumer right or legal remedy that
            cannot lawfully be excluded or restricted under applicable Indian law.
          </p>
        </Section>

        <Section title="15. Contact &amp; Grievance">
          <p style={{ marginBottom: '1rem' }}>
            IGO Academy aims to acknowledge complaints promptly. Reach us via the details below.
          </p>
          <GrievanceBox />
        </Section>
      </div>
    </div>
  );
}
