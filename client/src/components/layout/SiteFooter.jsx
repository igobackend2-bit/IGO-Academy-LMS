/**
 * SiteFooter — shared footer used across all public pages
 * (website refinement spec, Section 13 — Footer Structure).
 *
 * Columns: Brand (with a Recognised By line) · Quick Links · Company ·
 * Contact · Follow Us, closed by a single line establishing the IGO GROUP
 * relationship. The Recognised By line and Company column (added 26 Aug
 * 2026) merge in the content from the site's original pre-redesign
 * footer — TNSDC/MSME recognition plus the IGO Group and legal-page
 * links — none of which had a home in the new 4-column footer yet.
 *
 * Follow Us shows only the two real, confirmed IGO Academy social
 * profiles (Facebook, Instagram — added 26 Aug 2026). YouTube and
 * LinkedIn were placeholder icons pointing nowhere real and have been
 * removed rather than left as dead links.
 */
import { useNavigate } from 'react-router-dom';
import { Instagram, Facebook, Phone, Mail, MapPin } from 'lucide-react';
import { IGO_META, IGO_CONTACT } from '@/constants/brand';

const QUICK_LINKS = [
  ['Programs', '/courses'],
  ['Workshops', '/workshops'],
  ['About Us', '/about'],
  ['Student Success', '/student-success'],
  ['Contact', '/contact'],
];

const COMPANY_LINKS = [
  ['IGO Group Brands', '/igo-brands'],
  ['About IGO Group', '/about'],
  ['Privacy Policy', '/privacy-policy'],
  ['Terms & Conditions', '/terms-and-conditions'],
  ['Refund Policy', '/refund-policy'],
  ['Disclaimer', '/disclaimer'],
];

const RECOGNITIONS = [
  'TNSDC — Tamil Nadu Skill Development Corp.',
  'MSME — Ministry of MSME, Govt. of India',
];

const SOCIALS = [
  { Icon: Facebook,  label: 'Facebook',  href: 'https://www.facebook.com/profile.php?id=61589212120511&sk=reels_tab' },
  { Icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/igo__academy?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==' },
];

export default function SiteFooter() {
  const navigate = useNavigate();

  function goQuickLink(to) {
    if (to.startsWith('/#')) {
      const id = to.slice(2);
      if (window.location.pathname === '/') {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        navigate('/');
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
      }
    } else {
      navigate(to);
    }
  }

  return (
    <footer style={{ background: '#0C2014', padding: '3.5rem 2rem 1.5rem' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>

        {/* Brand */}
        <div>
          <img src="/igo-logo.png" alt="IGO Academy" style={{ height: 36, filter: 'brightness(0) invert(1)', marginBottom: '.75rem', display: 'block' }} onError={e => { e.target.style.display = 'none'; }} />
          <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 900, fontSize: '1rem', color: 'white', marginBottom: '.5rem' }}>
            IGO Academy
          </div>
          <p style={{ fontSize: '.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
            Practical. Professional. Future-Ready Agriculture Education.
          </p>

          {/* Recognised By */}
          <div style={{ fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.2em', color: 'rgba(255,255,255,0.3)', marginBottom: '.6rem' }}>
            Recognised By
          </div>
          {RECOGNITIONS.map(r => (
            <div key={r} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: '.4rem' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#DAA520', flexShrink: 0, marginTop: 7 }} />
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '.8rem', lineHeight: 1.5 }}>{r}</span>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div>
          <div style={{ fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.2em', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
            Quick Links
          </div>
          {QUICK_LINKS.map(([label, to]) => (
            <div
              key={label}
              onClick={() => goQuickLink(to)}
              style={{ color: 'rgba(255,255,255,0.5)', fontSize: '.83rem', cursor: 'pointer', marginBottom: '.6rem' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#DAA520'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Company */}
        <div>
          <div style={{ fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.2em', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
            Company
          </div>
          {COMPANY_LINKS.map(([label, to]) => (
            <div
              key={label}
              onClick={() => goQuickLink(to)}
              style={{ color: 'rgba(255,255,255,0.5)', fontSize: '.83rem', cursor: 'pointer', marginBottom: '.6rem' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#DAA520'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Contact */}
        <div>
          <div style={{ fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.2em', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
            Contact
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: '.6rem' }}>
            <Phone size={14} color="#DAA520" style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '.8rem', lineHeight: 1.5 }}>
              {IGO_CONTACT.phone}
              {IGO_CONTACT.phone2 && <>, {IGO_CONTACT.phone2}</>}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: '.6rem' }}>
            <Mail size={14} color="#DAA520" style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '.8rem', lineHeight: 1.5 }}>
              {IGO_META.email}
              {IGO_CONTACT.email2 && <>, {IGO_CONTACT.email2}</>}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <MapPin size={14} color="#DAA520" style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '.8rem', lineHeight: 1.5 }}>{IGO_META.address}</span>
          </div>
        </div>

        {/* Follow Us */}
        <div>
          <div style={{ fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.2em', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
            Follow Us
          </div>
          <div style={{ display: 'flex', gap: '.6rem' }}>
            {SOCIALS.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.55)', textDecoration: 'none', flexShrink: 0,
                }}
              >
                <Icon size={15} strokeWidth={2} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: '1.5rem', textAlign: 'center' }}>
        <div style={{ color: '#DAA520', fontSize: '.8rem', fontWeight: 700, marginBottom: '.4rem' }}>
          IGO Academy — A Unit of IGO GROUP
        </div>
        <div style={{ color: 'rgba(255,255,255,.28)', fontSize: '.72rem' }}>
          &copy; 2026 IGO Academy. TNSDC + MSME Recognised | Chennai, Tamil Nadu
        </div>
      </div>
    </footer>
  );
}
