/**
 * CollegesPage — "For Colleges & Institutions" B2B page
 * (website refinement spec, Section 12 — For Colleges & Institutions).
 *
 * Positions IGO Academy as an industry-exposure partner for educational
 * institutions, separate from direct-to-student training. The enquiry form
 * below reuses the shared EnquiryForm — institution name, contact person,
 * designation and engagement type are captured via the message box for
 * now (a clearly-marked placeholder approach) rather than inventing new
 * backend fields the enquiries table doesn't have yet.
 */
import PublicNav from '@/components/layout/PublicNav';
import MobileStickyCta from '@/components/layout/MobileStickyCta';
import EnquiryForm from '@/components/features/EnquiryForm';
import SEO from '@/components/common/SEO';
import SiteFooter from '@/components/layout/SiteFooter';
import { School, Building2, GraduationCap, Users2, ClipboardCheck, Wrench, Award, FileCheck } from 'lucide-react';

const AUDIENCE = [
  { Icon: School,        label: 'Colleges' },
  { Icon: Building2,     label: 'Universities' },
  { Icon: GraduationCap, label: 'Schools' },
  { Icon: Users2,        label: 'Skill Development Institutions' },
];

const SERVICES = [
  { Icon: ClipboardCheck, label: '1-Day Campus Workshops' },
  { Icon: Wrench,         label: 'Industrial Visits' },
  { Icon: Users2,         label: 'Faculty Development Programs' },
  { Icon: Award,          label: 'Agriculture Skill Training' },
  { Icon: FileCheck,      label: 'Customized Certification Programs' },
];

export default function CollegesPage() {
  return (
    <div className="page-enter" style={{ minHeight: '100vh', fontFamily: "'Manrope', sans-serif", background: '#F5F7F3' }}>
      <SEO
        title="For Colleges & Institutions — IGO Academy"
        description="Agriculture industry exposure programs for colleges, universities, schools and skill development institutions — campus workshops, industrial visits, faculty development and custom certification."
        path="/for-colleges"
      />
      <PublicNav />

      <section style={{ background: 'linear-gradient(135deg, #0C2014 0%, #235C39 100%)', padding: '3.5rem 2rem', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 900, marginBottom: '.6rem' }}>
          Agriculture Industry Exposure Programs
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', maxWidth: 640, margin: '0 auto' }}>
          IGO Academy is not just an online course platform. It is a practical agriculture learning ecosystem — and an industry-exposure partner for institutions, not only individual students.
        </p>
      </section>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '3.5rem 1.5rem' }}>

        {/* Audience */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 900, fontSize: '1.5rem', color: '#0C2014', marginBottom: '1.5rem', textAlign: 'center' }}>
            Who We Work With
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
            {AUDIENCE.map(({ Icon, label }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: '.6rem',
                background: 'white', border: '1.5px solid rgba(79,160,46,.28)', borderRadius: 50,
                padding: '.7rem 1.3rem',
              }}>
                <Icon size={17} color="#2d6a14" strokeWidth={1.75} />
                <span style={{ fontWeight: 700, fontSize: '.88rem', color: '#0C2014' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 900, fontSize: '1.5rem', color: '#0C2014', marginBottom: '1.5rem', textAlign: 'center' }}>
            Services Offered
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.1rem' }}>
            {SERVICES.map(({ Icon, label }) => (
              <div key={label} style={{
                background: 'white', border: '1px solid rgba(0,0,0,.07)', borderRadius: 18,
                padding: '1.4rem', display: 'flex', alignItems: 'center', gap: '.85rem',
                boxShadow: '0 2px 12px rgba(0,0,0,.04)',
              }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: '#EDF6E4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={19} color="#3F8A24" strokeWidth={1.75} />
                </div>
                <span style={{ fontWeight: 700, fontSize: '.9rem', color: '#0C2014' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA / form */}
        <div id="enquiry-form" style={{ background: 'white', border: '1px solid rgba(0,0,0,.06)', borderRadius: 20, padding: '2rem', maxWidth: 640, margin: '0 auto', scrollMarginTop: 80 }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, color: '#0C2014', marginBottom: '.4rem', textAlign: 'center' }}>
            Partner With IGO Academy
          </h3>
          <p style={{ color: '#6b7280', fontSize: '.85rem', textAlign: 'center', marginBottom: '1.25rem' }}>
            Please include your institution's name, your designation and the type of engagement you're looking for in the message box below — our institutional training team will follow up directly.
          </p>
          <EnquiryForm
            source="colleges_partner"
            compact
            fields={['name', 'mobile', 'email', 'message']}
            messagePlaceholder="Institution name, your designation, and the engagement you're interested in (workshop, industrial visit, faculty development, etc.)"
          />
        </div>
      </div>

      <SiteFooter />
      <MobileStickyCta enquireHref="/for-colleges" />
    </div>
  );
}
