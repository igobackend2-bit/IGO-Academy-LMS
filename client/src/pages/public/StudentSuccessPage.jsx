/**
 * StudentSuccessPage — dedicated "Student Success" page.
 *
 * Nav item per the website refinement spec, Section 3.1 ("Student Success
 * → Testimonials / success stories page"). Originally this scrolled to a
 * section on the homepage; it now opens this standalone page so the full
 * list of real success stories has room to breathe, per the Academy Head's
 * direct request (26 Aug 2026).
 *
 * SUCCESS_STORIES data (name, role, role description, testimonial, and the
 * matching real IGO Group department link) lives in one shared place now —
 * @/constants/successStories.js — imported here and by HomePage.jsx and
 * StudentProfilePage.jsx, so all three stay in sync automatically instead
 * of three hand-maintained copies. See that file for the full data-handling
 * notes (real names from the Academy Head, no fabricated testimonials).
 *
 * Each card here links to its own profile page at /student-success/:slug
 * (StudentProfilePage.jsx) — which explains the role and shows the
 * testimonial (or a "coming soon" note) before offering a "verify at IGO
 * Group" button out to the real department page. Cards on this page no
 * longer redirect straight to IGO Group themselves (changed 26 Aug 2026).
 */
import { Link } from 'react-router-dom';
import PublicNav from '@/components/layout/PublicNav';
import MobileStickyCta from '@/components/layout/MobileStickyCta';
import EnquiryForm from '@/components/features/EnquiryForm';
import SEO from '@/components/common/SEO';
import SiteFooter from '@/components/layout/SiteFooter';
import { ArrowRight } from 'lucide-react';
import { SUCCESS_STORIES } from '@/constants/successStories';

const SUCCESS_STATS = [
  { num: '800+', label: 'Students Trained' },
  { num: '50+', label: 'Students Placed' },
  { num: 'Multiple', label: 'Live Agriculture Projects' },
  { num: 'Agri Career Launchpad', label: 'Industry-Focused Programs' },
];

export default function StudentSuccessPage() {
  return (
    <div className="page-enter" style={{ minHeight: '100vh', fontFamily: "'Manrope', sans-serif", background: '#F5F7F3' }}>
      <SEO
        title="Student Success — IGO Academy"
        description="Real IGO Academy trainees who went on to build careers within the IGO Group itself — from classroom and live farm training to a job on the team."
        path="/student-success"
      />
      <PublicNav />

      <section style={{ background: 'linear-gradient(135deg, #0C2014 0%, #235C39 100%)', padding: '3.5rem 2rem', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 900, marginBottom: '.6rem' }}>
          From Learner to Professional
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', maxWidth: 640, margin: '0 auto' }}>
          IGO Academy trainees who went on to build real careers — several of them right here,
          now working with us as part of the IGO Group team.
        </p>
      </section>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '3.5rem 1.5rem 5rem' }}>

        {/* Stats band */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
          {SUCCESS_STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center', minWidth: 130 }}>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.9rem', fontWeight: 900, color: '#0C2014' }}>{s.num}</div>
              <div style={{ color: '#6b7280', fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Success stories — now with IGO Group */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{
            display: 'inline-block', background: '#e8f5e8', color: '#2d6a14',
            fontSize: '.65rem', fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '.2em', padding: '4px 14px', borderRadius: 20, marginBottom: '1rem',
          }}>Now With IGO Group</span>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.5rem', fontWeight: 900, color: '#0C2014' }}>
            Some of Our Trainees, Now Colleagues
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem', marginBottom: '3.5rem' }}>
          {SUCCESS_STORIES.map((t, i) => (
            <Link key={i} to={`/student-success/${t.slug}`} style={{
              background: 'white', border: '1px solid rgba(0,0,0,.06)', borderRadius: 18,
              padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1rem',
              boxShadow: '0 2px 12px rgba(0,0,0,.04)', textDecoration: 'none', cursor: 'pointer',
            }}>
              <div style={{
                width: 160, height: 160, borderRadius: '50%', background: '#DAA520',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 800, fontSize: '3rem', flexShrink: 0, overflow: 'hidden',
              }}>
                {t.photo ? (
                  <img src={t.photo} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : t.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '.98rem', color: '#0C2014' }}>{t.name}</div>
                <div style={{ fontSize: '.8rem', color: '#6b7280' }}>{t.role}</div>
                <div style={{ fontSize: '.72rem', color: '#3F8A24', fontWeight: 700, marginTop: 2 }}>IGO Group</div>
              </div>
              <ArrowRight size={14} color="#9ca3af" style={{ flexShrink: 0 }} />
            </Link>
          ))}
        </div>

        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '.88rem', marginBottom: '3rem', maxWidth: 620, margin: '0 auto 3rem' }}>
          More success stories are added as new batches graduate and go on to placements, businesses
          of their own, or roles within the IGO Group itself.
        </p>

        <div id="enquiry-form" style={{ background: 'white', border: '1px solid rgba(0,0,0,.06)', borderRadius: 20, padding: '2rem', maxWidth: 640, margin: '0 auto', scrollMarginTop: 80 }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, color: '#0C2014', marginBottom: '.4rem', textAlign: 'center' }}>
            Start Your Own Success Story
          </h3>
          <p style={{ color: '#6b7280', fontSize: '.85rem', textAlign: 'center', marginBottom: '1.25rem' }}>
            Tell us which program you're interested in and our team will reach out with details.
          </p>
          <EnquiryForm
            source="student_success_page"
            compact
            fields={['name', 'mobile', 'email', 'course_interest_text', 'message']}
          />
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <a href="/courses" style={{ color: '#2d6a14', fontWeight: 700, fontSize: '.88rem', display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
            Explore Programs <ArrowRight size={14} />
          </a>
        </div>
      </div>

      <SiteFooter />
      <MobileStickyCta enquireHref="/student-success" />
    </div>
  );
}
