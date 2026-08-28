/**
 * MobileStickyCta — mobile-only sticky bottom bar: CALL | WHATSAPP | ENQUIRE
 * (requirement doc Section 7 & 12). Call/WhatsApp only render once real
 * numbers are set in IGO_CONTACT (client/src/constants/brand.js) — no
 * placeholder/fake numbers are ever shown to a visitor.
 */
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, MessageCircle, Send } from 'lucide-react';
import { IGO_CONTACT } from '@/constants/brand';

const itemStyle = {
  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'center', gap: 2, padding: '.55rem 0', textDecoration: 'none',
  fontSize: '.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.04em',
  border: 'none', background: 'transparent', cursor: 'pointer',
};

export default function MobileStickyCta({ enquireHref = '/enquire' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const hasPhone = Boolean(IGO_CONTACT.phone);
  const hasWhatsapp = Boolean(IGO_CONTACT.whatsapp);

  // Same fix as PublicNav's Enquire Now: a plain <Link> silently does nothing
  // when you're already on the target page, since React Router won't
  // re-navigate to the current route. Scroll directly in that case instead.
  function goToEnquiry() {
    const scroll = () => document.getElementById('enquiry-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (location.pathname === enquireHref) {
      scroll();
    } else {
      navigate(enquireHref);
      setTimeout(scroll, 120);
    }
  }

  return (
    <div
      className="mobile-sticky-cta"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
        display: 'none', background: 'white',
        boxShadow: '0 -4px 20px rgba(0,0,0,.12)',
        borderTop: '1px solid rgba(0,0,0,.06)',
      }}
    >
      <div style={{ display: 'flex' }}>
        {hasPhone && (
          <a href={`tel:${IGO_CONTACT.phone}`} style={{ ...itemStyle, color: '#0C2014' }}>
            <Phone size={18} strokeWidth={2} />
            Call
          </a>
        )}
        {hasWhatsapp && (
          <a
            href={`https://wa.me/${IGO_CONTACT.whatsapp}`}
            target="_blank" rel="noopener noreferrer"
            style={{ ...itemStyle, color: '#16a34a' }}
          >
            <MessageCircle size={18} strokeWidth={2} />
            WhatsApp
          </a>
        )}
        <button onClick={goToEnquiry} style={{ ...itemStyle, color: 'white', background: '#DAA520' }}>
          <Send size={16} strokeWidth={2} />
          Enquire
        </button>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .mobile-sticky-cta { display: block !important; }
          body { padding-bottom: 54px; }
        }
      `}</style>
    </div>
  );
}
