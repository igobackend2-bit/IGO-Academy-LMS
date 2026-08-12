/**
 * Privacy Policy — plain-language description of what IGo Academy actually
 * collects and does with user data. Content reflects the real data flows in
 * this codebase (auth.controller, payment.routes, certificate.service,
 * mobileAuthSync.service) — not generic boilerplate.
 */
import { useNavigate } from 'react-router-dom';
import PublicNav from '@/components/layout/PublicNav';
import SEO from '@/components/common/SEO';

const LAST_UPDATED = 'July 30, 2026';

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

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Manrope', sans-serif", background: '#F5F7F3' }}>
      <SEO
        title="Privacy Policy — IGO Academy"
        description="How IGo Academy collects, uses, and protects your personal data — account details, course progress, certificates, and payments."
        path="/privacy-policy"
      />
      <PublicNav />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '3.5rem 1.5rem 5rem' }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 900, fontSize: 'clamp(1.8rem,4vw,2.4rem)', color: '#0C2014', marginBottom: '.5rem' }}>
          Privacy Policy
        </h1>
        <p style={{ color: '#6b7280', fontSize: '.85rem', marginBottom: '2.5rem' }}>
          Last updated: {LAST_UPDATED}
        </p>

        <Section title="Who we are">
          <p>
            IGo Academy (<strong>igoacademy.in</strong>) is an online agri-entrepreneurship training platform, recognised by
            TNSDC (Tamil Nadu Skill Development Corporation) and certified by MSME (Ministry of MSME, Government of India).
            IGo Academy is operated by the IGO Group, Chennai, Tamil Nadu, India. This policy explains what personal data we
            collect through the website and mobile app, why, and what rights you have over it.
          </p>
        </Section>

        <Section title="Information we collect">
          <p><strong>Account information</strong> — when you register or an administrator creates your account: your full name,
          email address, phone number, and password (stored as a one-way cryptographic hash — we never store or can see your
          plaintext password).</p>
          <p style={{ marginTop: '.75rem' }}><strong>Course activity</strong> — your enrollments, video-watch progress, quiz and
          assessment submissions and scores, attendance records, and any certificates you earn.</p>
          <p style={{ marginTop: '.75rem' }}><strong>Payment information</strong> — if you enroll in a paid course, payment is
          processed directly by Razorpay, our payment gateway. We receive confirmation that a payment succeeded and a
          transaction reference; we do not receive or store your card, UPI, or bank account details at any point.</p>
          <p style={{ marginTop: '.75rem' }}><strong>Technical data</strong> — a single httpOnly session cookie used to keep you
          signed in. We do not use third-party advertising or analytics tracking cookies on this site.</p>
        </Section>

        <Section title="How we use your information">
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li>To create and manage your account, and to let you sign in securely.</li>
            <li>To track your course progress and unlock quizzes and certificates once you meet the completion requirements.</li>
            <li>To generate and issue your certificate, including a QR code that lets anyone independently verify it at{' '}
              <code style={{ background: '#EDF6E4', padding: '2px 6px', borderRadius: 4 }}>igoacademy.in/verify/&lt;certificateId&gt;</code>.</li>
            <li>To send you account-related emails: welcome/account-created notices, OTP codes for password resets, and
              certificate-ready notifications.</li>
            <li>To process enrollment payments for paid courses via Razorpay.</li>
          </ul>
        </Section>

        <Section title="Certificate verification is public by design">
          <p>
            A certificate's verification page (accessible via its QR code or a direct link) is intentionally public — that is
            what lets employers, institutions, or anyone else confirm a certificate is genuine. It shows the certificate holder's
            name, course, and issue date. It does not show your email, phone number, or any other account details.
          </p>
        </Section>

        <Section title="Mobile app account sync">
          <p>
            If you use both the IGo Academy website and the IGo Academy mobile app, your account is the same identity across
            both — signing in with the same email and password on either one accesses the same enrollments, progress, and
            certificates. Your password is never transmitted or stored in plaintext between systems.
          </p>
        </Section>

        <Section title="Who we share data with">
          <p>
            We do not sell your personal data. We share it only where it's necessary to operate the platform:
          </p>
          <ul style={{ paddingLeft: '1.25rem', margin: '.75rem 0 0' }}>
            <li><strong>Razorpay</strong> — to process course payments.</li>
            <li><strong>Supabase</strong> — our database and file-storage provider, which hosts account records, course videos,
              PDFs, and certificate files.</li>
            <li>Government-recognition bodies (TNSDC, MSME), only to the extent needed to validate certification, and only where
              applicable.</li>
          </ul>
        </Section>

        <Section title="Data retention and deletion">
          <p>
            We retain your account and course records for as long as your account is active, so your progress, certificates,
            and enrollment history remain accessible to you. If you'd like your account permanently deleted, contact us at the
            email below — this removes your account record and login access. Certificates already issued and independently
            verifiable via their QR code may remain verifiable, since that is their intended purpose (proof of an accomplishment
            that occurred), similar to a paper certificate.
          </p>
        </Section>

        <Section title="Your rights">
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li>Access or correct your account details at any time by contacting us, or via your account settings where available.</li>
            <li>Request a copy of the personal data we hold about you.</li>
            <li>Request deletion of your account, as described above.</li>
            <li>Reset your password at any time via the "Forgot password" flow, which emails you a one-time code.</li>
          </ul>
        </Section>

        <Section title="Children's privacy">
          <p>
            IGo Academy is intended for students, farmers, and entrepreneurs generally aged 16 and above. We do not knowingly
            collect personal data from children under 13.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            If we make material changes to how we collect or use your data, we'll update the "Last updated" date at the top of
            this page.
          </p>
        </Section>

        <Section title="Contact us">
          <p>
            Questions about this policy or your data — email us at{' '}
            <a href="mailto:igotnskills@gmail.com" style={{ color: '#3F8A24', fontWeight: 700 }}>igotnskills@gmail.com</a>,
            or write to IGo Academy, IGO Group, Chennai, Tamil Nadu, India.
          </p>
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
