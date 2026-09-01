/**
 * Privacy Policy — how IGO Academy (operated by IGO Group) collects, uses,
 * shares, stores and protects personal data across the mobile app, website
 * and related Services. Aligned with the Digital Personal Data Protection
 * Act, 2023 and applicable Indian data-protection law.
 */
import { useNavigate } from 'react-router-dom';
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

function SubHeading({ children }) {
  return (
    <p style={{ fontWeight: 700, color: '#0C2014', marginTop: '1rem', marginBottom: '.35rem' }}>
      {children}
    </p>
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

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Manrope', sans-serif", background: '#F5F7F3' }}>
      <SEO
        title="Privacy Policy — IGO Academy"
        description="How IGO Academy collects, uses, shares, stores and protects your personal data across the mobile app, website and related Services."
        path="/privacy-policy"
      />
      <PublicNav />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '3.5rem 1.5rem 5rem' }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 900, fontSize: 'clamp(1.8rem,4vw,2.4rem)', color: '#0C2014', marginBottom: '.5rem' }}>
          Privacy Policy
        </h1>
        <p style={{ color: '#6b7280', fontSize: '.85rem', marginBottom: '1.5rem' }}>
          Last Updated: {LAST_UPDATED}
        </p>

        <p style={{ color: '#4C5B50', fontSize: '.95rem', lineHeight: 1.75, marginBottom: '2.5rem' }}>
          This Privacy Policy explains how IGO Academy, operated by IGO Group, collects, uses, shares, stores and
          protects personal data when you use the IGO Academy mobile application, website and related Services. We
          process personal data in accordance with applicable Indian data-protection and privacy laws, including the
          Digital Personal Data Protection Act, 2023 and applicable rules and regulations as and when they come into
          force.
        </p>

        <div style={{
          background: '#F0FBF0', border: '1px solid #cfe8bd', borderRadius: 12,
          padding: '.9rem 1.25rem', marginBottom: '2.5rem', fontSize: '.85rem', color: '#234023', lineHeight: 1.7,
        }}>
          This Privacy Policy applies to the IGO Academy website and mobile app. A copy of the mobile app&rsquo;s
          privacy policy, hosted for app-store reference, is also available at{' '}
          <a
            href="https://igobackend6.github.io/IGO_Academy_Client/privacy.html"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#2d6a14', fontWeight: 700 }}
          >
            igobackend6.github.io/IGO_Academy_Client/privacy.html
          </a>.
        </div>

        <Section title="1. Data We Collect">
          <SubHeading>Account Data</SubHeading>
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li>Full name</li>
            <li>Email address</li>
            <li>Mobile number</li>
            <li>Password information stored in protected/hashed form</li>
            <li>Profile photo, where provided</li>
          </ul>

          <SubHeading>Verification Data</SubHeading>
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li>OTP verification information</li>
            <li>Date and time of successful verification</li>
          </ul>

          <SubHeading>Learning Data</SubHeading>
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li>Courses viewed</li>
            <li>Courses enrolled in</li>
            <li>Course enquiries</li>
            <li>Lesson and video progress</li>
            <li>Quiz attempts</li>
            <li>Assessment scores</li>
            <li>Certificates earned</li>
            <li>Learning history</li>
          </ul>

          <SubHeading>Transaction Data</SubHeading>
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li>Order reference</li>
            <li>Payment reference</li>
            <li>Amount</li>
            <li>Currency</li>
            <li>Payment status</li>
          </ul>
          <p style={{ marginTop: '.5rem' }}>
            We do not directly receive or store complete card, UPI or bank-account credentials through the Platform.
          </p>

          <SubHeading>Enquiry &amp; Support Data</SubHeading>
          <p>
            Information submitted through enquiry forms, support requests, reviews, feedback, applications and
            communications.
          </p>

          <SubHeading>Device &amp; Usage Data</SubHeading>
          <p>Depending on the Platform configuration, this may include:</p>
          <ul style={{ paddingLeft: '1.25rem', margin: '.5rem 0 0' }}>
            <li>Device model</li>
            <li>Operating system</li>
            <li>App version</li>
            <li>Language</li>
            <li>Approximate location derived from IP address</li>
            <li>In-app events</li>
            <li>Diagnostic information</li>
            <li>Crash logs</li>
            <li>Push-notification token</li>
          </ul>

          <SubHeading>On-Device Data</SubHeading>
          <p>
            Preferences such as theme settings and notification-related information may be stored locally on your
            device.
          </p>
        </Section>

        <Section title="2. How We Use Your Data">
          <p>We may use personal data to:</p>
          <ul style={{ paddingLeft: '1.25rem', margin: '.75rem 0 0' }}>
            <li>Create and secure accounts.</li>
            <li>Verify mobile numbers.</li>
            <li>Provide courses and services.</li>
            <li>Track learning progress.</li>
            <li>Issue certificates.</li>
            <li>Process payments.</li>
            <li>Confirm enrolment.</li>
            <li>Respond to enquiries.</li>
            <li>Provide customer support.</li>
            <li>Send service-related communications.</li>
            <li>Send course updates and announcements.</li>
            <li>Improve Platform functionality.</li>
            <li>Detect and prevent fraud or abuse.</li>
            <li>Maintain security.</li>
            <li>Comply with legal obligations.</li>
          </ul>
        </Section>

        <Section title="3. Legal Basis">
          <p>
            Depending on the circumstances and applicable law, personal data may be processed for providing requested
            Services, based on consent where required, for legitimate operational and security purposes where
            legally applicable, and for compliance with legal obligations. Where processing is based on consent, you
            may withdraw consent where legally applicable.
          </p>
        </Section>

        <Section title="4. Notifications">
          <p>With appropriate permission, IGO Academy may send:</p>
          <ul style={{ paddingLeft: '1.25rem', margin: '.75rem 0' }}>
            <li>Course updates</li>
            <li>Class reminders</li>
            <li>Purchase confirmations</li>
            <li>Registration updates</li>
            <li>Important announcements</li>
            <li>Push notifications</li>
          </ul>
          <p>
            Optional notifications can generally be disabled through your device settings. Essential service
            communications relating to your account, enrolment or transactions may still be sent where necessary.
          </p>
        </Section>

        <Section title="5. Sharing Your Data">
          <p>IGO Academy does not sell your personal data. Information may be shared with authorised service providers, including:</p>
          <ul style={{ paddingLeft: '1.25rem', margin: '.75rem 0' }}>
            <li>Supabase</li>
            <li>Razorpay</li>
            <li>SMS/OTP providers</li>
            <li>Google Firebase</li>
          </ul>
          <p>
            IGO Group and authorised IGO Academy administrators may access relevant information for course
            management, enrolment, student support and Platform administration. Information may also be disclosed
            where required by law or necessary to protect rights, property or safety.
          </p>
        </Section>

        <Section title="6. Data Storage &amp; International Transfers">
          <p>
            Personal data may be stored on cloud infrastructure operated by our service providers. Depending on
            provider configuration, data may be stored or processed in India or other countries. Where applicable,
            IGO Academy will take reasonable steps to protect personal data in accordance with applicable law.
          </p>
        </Section>

        <Section title="7. Data Retention">
          <p>We may retain personal data for as long as necessary to:</p>
          <ul style={{ paddingLeft: '1.25rem', margin: '.75rem 0' }}>
            <li>Maintain your account.</li>
            <li>Provide services.</li>
            <li>Maintain learning and certificate records.</li>
            <li>Process transactions.</li>
            <li>Meet legal, tax and accounting requirements.</li>
            <li>Resolve disputes.</li>
            <li>Prevent fraud.</li>
            <li>Maintain security.</li>
          </ul>
          <p>
            When information is no longer required, it may be deleted or anonymised subject to applicable
            requirements.
          </p>
        </Section>

        <Section title="8. Your Rights">
          <p>Subject to applicable law, you may have rights relating to:</p>
          <ul style={{ paddingLeft: '1.25rem', margin: '.75rem 0' }}>
            <li>Accessing personal data held about you.</li>
            <li>Correcting inaccurate information.</li>
            <li>Requesting deletion of your account and applicable personal data.</li>
            <li>Withdrawing consent where applicable.</li>
            <li>Exercising other rights available under applicable law.</li>
          </ul>
          <p>Identity verification may be required before processing certain requests.</p>
        </Section>

        <Section title="9. Security">
          <p>IGO Academy uses reasonable technical and organisational measures designed to protect personal data, including:</p>
          <ul style={{ paddingLeft: '1.25rem', margin: '.75rem 0' }}>
            <li>Encryption in transit</li>
            <li>Secure authentication</li>
            <li>Hashed password storage</li>
            <li>Access controls</li>
            <li>Server-side validation</li>
            <li>Payment verification</li>
            <li>Security monitoring</li>
          </ul>
          <p>No electronic transmission or storage system is completely secure.</p>
        </Section>

        <Section title="10. Children's Privacy">
          <p>
            The Platform is primarily intended for users aged 18 and above. Users between 13 and 18 may use eligible
            services with appropriate parental or guardian involvement and consent. IGO Academy does not knowingly
            collect personal data from children below 13 years.
          </p>
        </Section>

        <Section title="11. Changes to Privacy Policy">
          <p>
            IGO Academy may update this Privacy Policy from time to time. The Last Updated date will be revised when
            changes are made. Significant changes may be communicated through the Platform.
          </p>
        </Section>

        <Section title="12. Contact">
          <p style={{ marginBottom: '1rem' }}>
            Questions about this policy or your data — reach out below.
          </p>
          <GrievanceBox />
        </Section>

        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: '1rem', background: 'transparent', border: '1.5px solid #4FA02E',
            color: '#3F8A24', padding: '.7rem 1.5rem', borderRadius: 50, fontWeight: 700,
            fontSize: '.9rem', cursor: 'pointer',
          }}
        >
          &larr; Back
        </button>
      </div>

      <footer style={{ background: '#0C2014', color: 'rgba(255,255,255,0.65)', textAlign: 'center', padding: '1.5rem 1rem', fontSize: '.82rem' }}>
        &copy; IGO Academy 2026 | TNSDC + MSME Recognised | Chennai, Tamil Nadu
      </footer>
    </div>
  );
}
