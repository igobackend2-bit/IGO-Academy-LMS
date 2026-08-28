/**
 * PartnerProfilePage — individual partner/collaboration profile at
 * /partners/:slug (added 26 Aug 2026, per the Academy Head's explicit
 * direction to make each card in the "Academic & Industry Partnerships"
 * section on the homepage clickable).
 *
 * Data comes from the shared @/constants/partners.js list — imported here
 * and by HomePage.jsx, matching the pattern already used for
 * SUCCESS_STORIES, so there's exactly one copy to update.
 *
 * description: a neutral, factual description of the partnership itself,
 * not a fabricated quote or claim.
 *
 * externalLink (IGO Group only): a real, live IGO Group brand site.
 * certVerifyId (TNSDC, MSME only): the certificate number of a real,
 * independently verifiable certificate already issued to an IGO Academy
 * student (Selvabharathi D, TN Skill Corporation) — links to the site's
 * own /verify/:certificateId page. This only resolves once that
 * certificate has actually been added in Admin → Certificates on the
 * live database; until then the verify page will correctly report it as
 * not found, the same as it would for any not-yet-issued certificate ID.
 *
 * Partners without a logo yet fall back to a generic icon — real photos
 * will be added the same way the Student Success photos were, one at a
 * time as they're supplied.
 */
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PublicNav from '@/components/layout/PublicNav';
import MobileStickyCta from '@/components/layout/MobileStickyCta';
import EnquiryForm from '@/components/features/EnquiryForm';
import SEO from '@/components/common/SEO';
import SiteFooter from '@/components/layout/SiteFooter';
import { ArrowLeft, ExternalLink, ShieldCheck, School, X } from 'lucide-react';
import { PARTNERS } from '@/constants/partners';

export default function PartnerProfilePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const partner = PARTNERS.find(p => p.slug === slug);
  const [openPhoto, setOpenPhoto] = useState(null);

  if (!partner) {
    return (
      <div style={{ minHeight: '100vh', fontFamily: "'Manrope', sans-serif", background: '#F5F7F3' }}>
        <SEO
          title="Partner Not Found — IGO Academy"
          description="This partner could not be found."
          path={`/partners/${slug || ''}`}
        />
        <PublicNav />
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '5rem 1.5rem', textAlign: 'center' }}>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 900, fontSize: '1.6rem', color: '#0C2014', marginBottom: '.75rem' }}>
            Partner Not Found
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            We couldn't find that partner. Browse the homepage instead.
          </p>
          <Link to="/" style={{ color: '#2d6a14', fontWeight: 700, textDecoration: 'none' }}>
            ← Back to Home
          </Link>
        </div>
        <SiteFooter />
        <MobileStickyCta enquireHref="/" />
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ minHeight: '100vh', fontFamily: "'Manrope', sans-serif", background: '#F5F7F3' }}>
      <SEO
        title={`${partner.name} — Partnerships — IGO Academy`}
        description={`${partner.name}, ${partner.label} — IGO Academy's academic and industry ecosystem.`}
        path={`/partners/${partner.slug}`}
      />
      <PublicNav />

      <section style={{ background: 'linear-gradient(135deg, #0C2014 0%, #235C39 100%)', padding: '3rem 2rem', textAlign: 'center', color: 'white' }}>
        <div
          onClick={() => navigate('/')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.7)', fontSize: '.82rem', fontWeight: 700, cursor: 'pointer', marginBottom: '1.5rem' }}
        >
          <ArrowLeft size={14} /> Back to Home
        </div>
        <div style={{
          width: 110, height: 110, borderRadius: 24, background: 'white', margin: '0 auto .9rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        }}>
          {partner.logo ? (
            <img src={partner.logo} alt={partner.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 10 }} />
          ) : (
            <School size={40} color="#3F8A24" strokeWidth={1.75} />
          )}
        </div>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.5rem,3.5vw,2.1rem)', fontWeight: 900, marginBottom: '.35rem' }}>
          {partner.name}
        </h1>
        <p style={{ color: '#DAA520', fontWeight: 700, fontSize: '.95rem' }}>{partner.label}</p>
      </section>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem 4rem' }}>

        {/* About the partnership */}
        <div style={{ background: 'white', border: '1px solid rgba(0,0,0,.06)', borderRadius: 18, padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.15em', color: '#9ca3af', marginBottom: '.6rem' }}>
            About This Partnership
          </div>
          <p style={{ color: '#374151', fontSize: '.92rem', lineHeight: 1.7, margin: 0 }}>{partner.description}</p>
        </div>

        {/* Photo gallery — real photos from the collaboration, click to view full size */}
        {partner.gallery && partner.gallery.length > 0 && (
          <div style={{ background: 'white', border: '1px solid rgba(0,0,0,.06)', borderRadius: 18, padding: '1.75rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.15em', color: '#9ca3af', marginBottom: '1rem' }}>
              From the Collaboration
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '.75rem' }}>
              {partner.gallery.map((g, i) => (
                <div
                  key={i}
                  onClick={() => setOpenPhoto(g)}
                  style={{ borderRadius: 12, overflow: 'hidden', cursor: 'zoom-in', aspectRatio: '4 / 3', background: '#F5F7F3' }}
                >
                  <img src={g.src} alt={g.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IGO Group — external link to the real, live brand site */}
        {partner.externalLink && (
          <a
            href={partner.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#0C2014', color: 'white', borderRadius: 18, padding: '1.25rem 1.5rem',
              textDecoration: 'none', marginBottom: '1.5rem',
            }}
          >
            <span style={{ fontSize: '.9rem', fontWeight: 700 }}>{partner.externalLinkLabel || 'Visit Website'}</span>
            <ExternalLink size={16} style={{ flexShrink: 0 }} />
          </a>
        )}

        {/* TNSDC, MSME — link to a real, independently verifiable certificate */}
        {partner.certVerifyId && (
          <Link
            to={`/verify/${partner.certVerifyId}`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#0C2014', color: 'white', borderRadius: 18, padding: '1.25rem 1.5rem',
              textDecoration: 'none', marginBottom: '1.5rem',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '.9rem', fontWeight: 700 }}>
              <ShieldCheck size={16} style={{ flexShrink: 0 }} /> {partner.certVerifyLabel || 'View Certificate'}
            </span>
            <ArrowLeft size={16} style={{ flexShrink: 0, transform: 'rotate(180deg)' }} />
          </Link>
        )}

        <div id="enquiry-form" style={{ background: 'white', border: '1px solid rgba(0,0,0,.06)', borderRadius: 20, padding: '2rem', scrollMarginTop: 80 }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, color: '#0C2014', marginBottom: '.4rem', textAlign: 'center' }}>
            Interested in a Similar Collaboration?
          </h3>
          <p style={{ color: '#6b7280', fontSize: '.85rem', textAlign: 'center', marginBottom: '1.25rem' }}>
            Tell us about your institution or organisation and our team will reach out.
          </p>
          <EnquiryForm
            source="partner_profile_page"
            compact
            fields={['name', 'mobile', 'email', 'course_interest_text', 'message']}
          />
        </div>
      </div>

      <SiteFooter />
      <MobileStickyCta enquireHref="/" />

      {/* Full-size gallery photo lightbox — rendered via a portal directly
          into document.body so its `position: fixed` is relative to the
          real viewport, not to the `.page-enter` wrapper above (which has
          a CSS transform on it — see StudentProfilePage.jsx for the full
          explanation of why that matters). */}
      {openPhoto && createPortal(
        <div
          onClick={() => setOpenPhoto(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(12,32,20,0.92)', zIndex: 1000,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem',
            cursor: 'zoom-out',
          }}
        >
          <button
            onClick={() => setOpenPhoto(null)}
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
            src={openPhoto.src}
            alt={openPhoto.caption}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '90vw', maxHeight: '78vh', borderRadius: 12,
              boxShadow: '0 10px 50px rgba(0,0,0,0.5)', cursor: 'default',
            }}
          />
          {openPhoto.caption && (
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '.85rem', marginTop: '1rem', maxWidth: 500, textAlign: 'center' }}>
              {openPhoto.caption}
            </p>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
