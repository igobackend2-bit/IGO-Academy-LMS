/**
 * StudentProfilePage — individual success-story profile at
 * /student-success/:slug (added 26 Aug 2026, per the Academy Head's
 * explicit direction).
 *
 * Each card on the homepage teaser and on StudentSuccessPage.jsx now opens
 * this page first, instead of redirecting straight to IGO Group — it
 * explains the person's role and shows their testimonial (or a "coming
 * soon" note when one hasn't been supplied yet), and only THEN offers a
 * "verify at IGO Group" button out to the real department page for that
 * role, confirmed live on igogroups.in.
 *
 * Data comes entirely from the shared @/constants/successStories.js list —
 * no data is duplicated here. `roleDescription` is a neutral, factual
 * description of the job itself, not a personal quote. `testimonial` stays
 * `null` (rendered as a placeholder) until the Academy Head supplies each
 * person's own words — no first-person quote is ever fabricated and
 * attached to a real named person.
 */
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PublicNav from '@/components/layout/PublicNav';
import MobileStickyCta from '@/components/layout/MobileStickyCta';
import EnquiryForm from '@/components/features/EnquiryForm';
import SEO from '@/components/common/SEO';
import SiteFooter from '@/components/layout/SiteFooter';
import { ArrowLeft, ExternalLink, Quote, X } from 'lucide-react';
import { SUCCESS_STORIES } from '@/constants/successStories';

export default function StudentProfilePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const person = SUCCESS_STORIES.find(s => s.slug === slug);
  const [photoOpen, setPhotoOpen] = useState(false);

  if (!person) {
    return (
      <div style={{ minHeight: '100vh', fontFamily: "'Manrope', sans-serif", background: '#F5F7F3' }}>
        <SEO
          title="Success Story Not Found — IGO Academy"
          description="This success story could not be found."
          path={`/student-success/${slug || ''}`}
        />
        <PublicNav />
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '5rem 1.5rem', textAlign: 'center' }}>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 900, fontSize: '1.6rem', color: '#0C2014', marginBottom: '.75rem' }}>
            Story Not Found
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            We couldn't find that success story. Browse the full list instead.
          </p>
          <Link to="/student-success" style={{ color: '#2d6a14', fontWeight: 700, textDecoration: 'none' }}>
            ← Back to Student Success
          </Link>
        </div>
        <SiteFooter />
        <MobileStickyCta enquireHref="/student-success" />
      </div>
    );
  }

  const firstName = person.name.split(' ')[0];

  return (
    <div className="page-enter" style={{ minHeight: '100vh', fontFamily: "'Manrope', sans-serif", background: '#F5F7F3' }}>
      <SEO
        title={`${person.name} — Student Success — IGO Academy`}
        description={`${person.name}, ${person.role} at IGO Group — a real IGO Academy trainee now working within the IGO Group.`}
        path={`/student-success/${person.slug}`}
      />
      <PublicNav />

      <section style={{ background: 'linear-gradient(135deg, #0C2014 0%, #235C39 100%)', padding: '3rem 2rem', textAlign: 'center', color: 'white' }}>
        <div
          onClick={() => navigate('/student-success')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.7)', fontSize: '.82rem', fontWeight: 700, cursor: 'pointer', marginBottom: '1.5rem' }}
        >
          <ArrowLeft size={14} /> All Success Stories
        </div>
        <div
          onClick={() => person.photo && setPhotoOpen(true)}
          style={{
            width: 140, height: 140, borderRadius: '50%', background: '#DAA520', margin: '0 auto .9rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 900, fontSize: '2.6rem', overflow: 'hidden',
            cursor: person.photo ? 'pointer' : 'default',
          }}
        >
          {person.photo ? (
            <img src={person.photo} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : person.name.charAt(0)}
        </div>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.5rem,3.5vw,2.1rem)', fontWeight: 900, marginBottom: '.35rem' }}>
          {person.name}
        </h1>
        <p style={{ color: '#DAA520', fontWeight: 700, fontSize: '.95rem', marginBottom: '.2rem' }}>{person.role}</p>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '.8rem' }}>Now with IGO Group</p>
      </section>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem 4rem' }}>

        {/* Role at IGO Group */}
        <div style={{ background: 'white', border: '1px solid rgba(0,0,0,.06)', borderRadius: 18, padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.15em', color: '#9ca3af', marginBottom: '.6rem' }}>
            Role at IGO Group
          </div>
          <p style={{ color: '#374151', fontSize: '.92rem', lineHeight: 1.7, margin: 0 }}>{person.roleDescription}</p>
        </div>

        {/* Testimonial */}
        <div style={{ background: 'white', border: '1px solid rgba(0,0,0,.06)', borderRadius: 18, padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.15em', color: '#9ca3af', marginBottom: '.6rem' }}>
            In {firstName}'s Words
          </div>
          {person.testimonial ? (
            <>
              <Quote size={20} color="#DAA520" style={{ marginBottom: '.5rem' }} />
              <p style={{ color: '#0C2014', fontSize: '1rem', fontStyle: 'italic', lineHeight: 1.7, margin: 0 }}>
                "{person.testimonial}"
              </p>
            </>
          ) : (
            <p style={{ color: '#9ca3af', fontSize: '.88rem', lineHeight: 1.7, margin: 0 }}>
              A testimonial from {firstName} will be added here soon.
            </p>
          )}
        </div>

        {/* Video message — only present when the person has recorded one;
            renders nothing when person.video is absent. */}
        {person.video && (
          <div style={{ background: 'white', border: '1px solid rgba(0,0,0,.06)', borderRadius: 18, padding: '1.75rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.15em', color: '#9ca3af', marginBottom: '.9rem' }}>
              Video Message from {firstName}
            </div>
            <video
              src={person.video}
              poster={person.photo || undefined}
              controls
              preload="none"
              playsInline
              style={{ width: '100%', maxWidth: 360, display: 'block', margin: '0 auto', borderRadius: 12, background: '#0C2014' }}
            />
          </div>
        )}

        {/* Verify at IGO Group — secondary action, not the click destination itself */}
        <a
          href={person.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#0C2014', color: 'white', borderRadius: 18, padding: '1.25rem 1.5rem',
            textDecoration: 'none', marginBottom: '3rem',
          }}
        >
          <span style={{ fontSize: '.9rem', fontWeight: 700 }}>Verify — visit {person.linkLabel} at IGO Group</span>
          <ExternalLink size={16} style={{ flexShrink: 0 }} />
        </a>

        <div id="enquiry-form" style={{ background: 'white', border: '1px solid rgba(0,0,0,.06)', borderRadius: 20, padding: '2rem', scrollMarginTop: 80 }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, color: '#0C2014', marginBottom: '.4rem', textAlign: 'center' }}>
            Start Your Own Success Story
          </h3>
          <p style={{ color: '#6b7280', fontSize: '.85rem', textAlign: 'center', marginBottom: '1.25rem' }}>
            Tell us which program you're interested in and our team will reach out with details.
          </p>
          <EnquiryForm
            source="student_profile_page"
            compact
            fields={['name', 'mobile', 'email', 'course_interest_text', 'message']}
          />
        </div>
      </div>

      <SiteFooter />
      <MobileStickyCta enquireHref="/student-success" />

      {/* Full-size photo lightbox — opens when the profile photo is clicked.
          Rendered via a portal directly into document.body so its
          `position: fixed` is relative to the real viewport, not to the
          `.page-enter` wrapper above (which has a CSS transform on it —
          any ancestor transform makes `fixed` behave like `absolute`
          relative to that ancestor instead of the screen, which is why
          the photo was rendering far off-screen instead of centered). */}
      {photoOpen && person.photo && createPortal(
        <div
          onClick={() => setPhotoOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(12,32,20,0.92)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
            cursor: 'zoom-out',
          }}
        >
          <button
            onClick={() => setPhotoOpen(false)}
            aria-label="Close"
            style={{
              position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.12)',
              border: 'none', borderRadius: '50%', width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white',
            }}
          >
            <X size={20} />
          </button>
          <img
            src={person.photo}
            alt={person.name}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '90vw', maxHeight: '85vh', borderRadius: 12,
              boxShadow: '0 10px 50px rgba(0,0,0,0.5)', cursor: 'default',
            }}
          />
        </div>,
        document.body
      )}
    </div>
  );
}
