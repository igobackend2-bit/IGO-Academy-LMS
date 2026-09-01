/**
 * Terms & Conditions — governs use of the IGO Academy mobile app, website,
 * online courses, offline training, workshops, internships, practical
 * training, farm visits, project guidance, entrepreneurship programs and
 * certification programs, operated by IGO Group.
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

export default function TermsAndConditions() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Manrope', sans-serif", background: '#F5F7F3' }}>
      <SEO
        title="Terms & Conditions — IGO Academy"
        description="The terms governing use of the IGO Academy mobile app, website, online courses, offline training, workshops, internships and certification programs."
        path="/terms-and-conditions"
      />
      <PublicNav />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '3.5rem 1.5rem 5rem' }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 900, fontSize: 'clamp(1.8rem,4vw,2.4rem)', color: '#0C2014', marginBottom: '.5rem' }}>
          Terms &amp; Conditions
        </h1>
        <p style={{ color: '#6b7280', fontSize: '.85rem', marginBottom: '1.5rem' }}>
          Last Updated: {LAST_UPDATED}
        </p>

        <p style={{ color: '#4C5B50', fontSize: '.95rem', lineHeight: 1.75, marginBottom: '2.5rem' }}>
          These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your access to and use of the IGO Academy mobile
          application, website, online courses, offline training, workshops, internships, practical training, farm
          visits, project guidance, entrepreneurship programs, certification programs and related services
          (&ldquo;Platform&rdquo; or &ldquo;Services&rdquo;). IGO Academy is operated by IGO Group (&ldquo;IGO
          Academy&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo;). By creating an account, submitting
          an enquiry, registering for a program, making a payment or using the Platform, you agree to these Terms and
          our <a href="/privacy-policy" style={{ color: '#2d6a14' }}>Privacy Policy</a>. If you do not agree, please
          do not use the Platform.
        </p>

        <Section title="1. Eligibility">
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li>You must generally be at least 18 years old to independently create an account.</li>
            <li>Users between 13 and 18 years of age may use eligible services with the involvement and consent of a
              parent or legal guardian, who accepts these Terms on their behalf.</li>
            <li>By using the Platform, you confirm that the information you provide is accurate and that you have
              the legal capacity to enter into these Terms.</li>
            <li>IGO Academy may refuse participation where applicable eligibility requirements are not met.</li>
          </ul>
        </Section>

        <Section title="2. Your Account">
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li>You may register using your full name, email address, mobile number, password and other information
              required for account management or enrolment.</li>
            <li>Your mobile number may be verified using a one-time password (OTP) sent through an authorised SMS
              service provider.</li>
            <li>You are responsible for keeping your account credentials and device secure and for activity occurring
              through your account.</li>
            <li>You must notify IGO Academy promptly at{' '}
              <a href="mailto:head@igoacademy.in" style={{ color: '#2d6a14' }}>head@igoacademy.in</a> if you suspect
              unauthorised use of your account.</li>
            <li>One person may maintain only one account unless otherwise authorised by IGO Academy.</li>
            <li>IGO Academy may refuse, suspend or close an account reasonably believed to be fraudulent, abusive or
              in violation of these Terms.</li>
          </ul>
        </Section>

        <Section title="3. Courses, Enquiries &amp; Enrolment">
          <p>IGO Academy provides online, offline and practical educational and skill-development programs. These may include:</p>
          <ul style={{ paddingLeft: '1.25rem', margin: '.75rem 0 0' }}>
            <li>Online and recorded courses</li>
            <li>Live training</li>
            <li>Agriculture and allied-sector workshops</li>
            <li>Practical training</li>
            <li>Internships</li>
            <li>Farm visits</li>
            <li>Project guidance</li>
            <li>Entrepreneurship programs</li>
            <li>Certification programs</li>
            <li>Industry-oriented skill-development programs</li>
          </ul>
          <p style={{ marginTop: '.75rem' }}>
            Course descriptions, curriculum, duration, schedules, trainers, locations and practical components may be
            modified where reasonably necessary. Submitting an enquiry does not guarantee admission or participation.
            Access to a paid course is provided only after successful payment verification or confirmation of
            enrolment.
          </p>
        </Section>

        <Section title="4. Pricing, Offers &amp; Payments">
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li>All prices are displayed in Indian Rupees (₹), unless otherwise stated.</li>
            <li>Applicable taxes, where relevant, will be indicated during purchase or registration.</li>
            <li>Promotional and time-limited offers are valid only for the period specified by IGO Academy and may
              be changed or withdrawn.</li>
            <li>Payments may be processed through authorised payment partners, including Razorpay.</li>
            <li>IGO Academy does not directly receive or store complete card, UPI or bank-account credentials
              through its Platform.</li>
            <li>The final payable amount will be confirmed at checkout. A purchase is complete only after successful
              payment verification.</li>
          </ul>
        </Section>

        <Section title="5. Refunds &amp; Cancellations">
          <p>
            Unless a specific course or program states otherwise, fees are generally non-refundable once online
            course access has been granted or course materials have been accessed. For workshops, internships,
            practical training, farm visits and special programs, separate cancellation and refund conditions may
            apply. If you were charged twice, charged incorrectly, or successfully paid but did not receive access,
            contact <a href="mailto:head@igoacademy.in" style={{ color: '#2d6a14' }}>head@igoacademy.in</a> within 7
            days with your transaction details. Eligible refunds will generally be processed to the original payment
            method, subject to applicable law and payment-provider procedures. See our{' '}
            <a href="/refund-policy" style={{ color: '#2d6a14' }}>Refund &amp; Cancellation Policy</a> for full details.
          </p>
        </Section>

        <Section title="6. Intellectual Property">
          <p>
            All course videos, PDFs, notes, assessments, presentations, graphics, logos, curriculum, training
            materials and other Platform content belong to IGO Academy, IGO Group or their respective licensors.
            You receive a limited, personal, non-transferable and non-exclusive licence to use the content for your
            own educational purposes. You must not copy, record, screen-capture protected content, republish, sell,
            distribute, publicly display, commercially exploit or share paid course content without written
            permission. You must not use IGO Academy content to create a competing product or service.
          </p>
        </Section>

        <Section title="7. Assessments &amp; Certificates">
          <p>
            Certificates may be issued only when the participant satisfies the requirements of the relevant program.
            Requirements may include attendance, course completion, assessments, assignments, practical
            participation or minimum progress. Unless specifically stated otherwise, an IGO Academy certificate
            acknowledges completion or participation in an IGO Academy program and is not a government-recognised
            or accredited academic qualification.
          </p>
        </Section>

        <Section title="8. Practical Training, Workshops &amp; Farm Visits">
          <p>Participants must follow all reasonable instructions provided by IGO Academy trainers, employees and authorised personnel. Participants must:</p>
          <ul style={{ paddingLeft: '1.25rem', margin: '.75rem 0 0' }}>
            <li>Follow safety instructions.</li>
            <li>Use equipment responsibly.</li>
            <li>Follow farm and training-centre rules.</li>
            <li>Respect IGO Academy property.</li>
            <li>Follow attendance requirements.</li>
            <li>Conduct themselves safely and respectfully.</li>
          </ul>
          <p style={{ marginTop: '.75rem' }}>
            IGO Academy may restrict participation where conduct creates a safety, security or operational risk.
          </p>
        </Section>

        <Section title="9. Internship &amp; Project Guidance">
          <p>
            IGO Academy may provide internship opportunities, project guidance, practical exposure and
            industry-oriented learning. Participation does not automatically guarantee employment, placement,
            salary, funding, investment, government approval or commercial success. Specific programs may have
            additional eligibility requirements and terms.
          </p>
        </Section>

        <Section title="10. Agriculture &amp; Entrepreneurship Disclaimer">
          <p>
            IGO Academy provides education and skill development in agriculture, agribusiness and allied fields.
            Training is provided for educational purposes and does not guarantee any particular:
          </p>
          <ul style={{ paddingLeft: '1.25rem', margin: '.75rem 0' }}>
            <li>Crop yield</li>
            <li>Income</li>
            <li>Profit</li>
            <li>Business result</li>
            <li>Employment</li>
            <li>Return on investment</li>
            <li>Market outcome</li>
          </ul>
          <p>
            Actual results may depend on climate, location, soil, water, crop selection, inputs, labour, management,
            market conditions, government policies and other factors. Participants are responsible for making
            independent decisions and obtaining appropriate professional or technical advice where necessary.
          </p>
        </Section>

        <Section title="11. User Conduct">
          <p>You must not:</p>
          <ul style={{ paddingLeft: '1.25rem', margin: '.75rem 0 0' }}>
            <li>Use the Platform for unlawful purposes.</li>
            <li>Upload harmful, defamatory, obscene or infringing material.</li>
            <li>Attempt unauthorised access.</li>
            <li>Interfere with Platform operations.</li>
            <li>Circumvent security measures.</li>
            <li>Share paid course access.</li>
            <li>Impersonate another person.</li>
            <li>Manipulate assessments or certificates.</li>
            <li>Scrape or extract Platform data using automated means without permission.</li>
          </ul>
        </Section>

        <Section title="12. Content You Submit">
          <p>
            When you submit enquiries, reviews, feedback, support requests or other content, you confirm that the
            information is accurate and that you have the right to provide it. You grant IGO Academy a non-exclusive,
            royalty-free licence to use submitted content where reasonably necessary to operate, improve and promote
            the Platform, subject to applicable law and our{' '}
            <a href="/privacy-policy" style={{ color: '#2d6a14' }}>Privacy Policy</a>.
          </p>
        </Section>

        <Section title="13. Third-Party Services">
          <p>
            The Platform may use third-party providers for hosting, databases, authentication, payment processing,
            OTP delivery, notifications and analytics. These may include Supabase, Razorpay, SMS/OTP providers and
            Google Firebase, where applicable. Third-party providers may have their own terms and privacy policies.
          </p>
        </Section>

        <Section title="14. Disclaimers">
          <p>
            The Platform and its content are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo;
            basis. IGO Academy does not guarantee uninterrupted, error-free or completely secure operation of the
            Platform.
          </p>
        </Section>

        <Section title="15. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, IGO Academy and IGO Group will not be liable for indirect,
            incidental, special or consequential losses arising from use of the Platform or Services. Our aggregate
            liability for a claim relating to the Platform will not exceed the amount actually paid by you for the
            specific course or service giving rise to the claim during the applicable period. Nothing in these
            Terms excludes liability that cannot legally be excluded under applicable law.
          </p>
        </Section>

        <Section title="16. Indemnity">
          <p>
            To the extent permitted by applicable law, you agree to indemnify and hold harmless IGO Academy and IGO
            Group from claims, losses, liabilities or reasonable expenses arising from your breach of these Terms or
            misuse of the Platform or its content.
          </p>
        </Section>

        <Section title="17. Suspension &amp; Termination">
          <p>
            You may stop using the Platform and request account deletion by contacting{' '}
            <a href="mailto:head@igoacademy.in" style={{ color: '#2d6a14' }}>head@igoacademy.in</a>. IGO Academy may
            suspend or terminate access where reasonably necessary due to breach of these Terms, fraud, misuse,
            security risks or legal requirements. Provisions that by their nature should survive termination will
            continue to apply.
          </p>
        </Section>

        <Section title="18. Changes to Platform &amp; Terms">
          <p>
            IGO Academy may modify, add, suspend or remove courses, features, schedules, pricing or Platform
            functionality. IGO Academy may also update these Terms. The Last Updated date will be revised when
            changes are made. Significant changes may be communicated through the Platform.
          </p>
        </Section>

        <Section title="19. Governing Law &amp; Disputes">
          <p>
            These Terms are governed by the laws of India. Subject to applicable consumer rights and statutory
            remedies, disputes relating to these Terms or the Platform shall be subject to the jurisdiction of the
            appropriate courts at Chennai, Tamil Nadu, India, unless otherwise required by applicable law.
          </p>
        </Section>

        <Section title="20. General">
          <p>
            If any provision is found unenforceable, the remaining provisions will continue to apply. These Terms,
            together with the{' '}
            <a href="/privacy-policy" style={{ color: '#2d6a14' }}>Privacy Policy</a> and applicable
            program-specific terms, constitute the agreement between you and IGO Academy concerning the Platform.
          </p>
        </Section>

        <Section title="Contact">
          <p style={{ marginBottom: '1rem' }}>
            For questions about these Terms, or to raise a complaint, reach out below.
          </p>
          <GrievanceBox />
        </Section>
      </div>
    </div>
  );
}
