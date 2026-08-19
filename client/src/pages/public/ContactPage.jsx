/**
 * ContactPage — centralized enquiry form + direct contact channels.
 * Per requirements doc §7 (Lead Generation and WhatsApp).
 */
import { Phone, MessageCircle, Mail, MapPin } from 'lucide-react';
import PublicNav from '@/components/layout/PublicNav';
import MobileStickyBar from '@/components/layout/MobileStickyBar';
import FloatingWhatsApp from '@/components/layout/FloatingWhatsApp';
import SEO from '@/components/common/SEO';
import EnquiryForm from '@/components/features/EnquiryForm';
import { PHONE_NUMBER, CONTACT_EMAIL, whatsAppLink } from '@/constants/contact';

function ChannelCard({ Icon, label, value, href, external }) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: '.9rem',
        background: 'white', border: '1px solid rgba(0,0,0,.07)',
        borderRadius: 16, padding: '1.1rem 1.3rem', textDecoration: 'none',
        transition: 'all .18s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#DAA52070'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(218,165,32,.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,.07)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ width: 42, height: 42, borderRadius: 12, background: '#e8f5e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={19} color="#2d6a14" strokeWidth={2} />
      </div>
      <div>
        <div style={{ fontSize: '.7rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
        <div style={{ fontSize: '.92rem', fontWeight: 700, color: '#0C2014' }}>{value}</div>
      </div>
    </a>
  );
}

export default function ContactPage() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Manrope', sans-serif", background: '#F5F7F3' }}>
      <SEO
        title="Contact Us — IGO Academy"
        description="Get in touch with IGO Academy — enquire about courses, practical training, certification, internships and career support."
        path="/contact"
      />
      <PublicNav />

      {/* Header */}
      <section style={{ background: 'linear-gradient(135deg, #0C2014 0%, #1a3d26 100%)', padding: '4rem 1.5rem 3rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 900, fontSize: 'clamp(2rem,4vw,2.8rem)', color: 'white', marginBottom: '.75rem' }}>
          Let's Build Your Future in Agriculture
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', maxWidth: 560, margin: '0 auto' }}>
          Tell us what you're interested in and our team will reach out with course details, batch dates and guidance.
        </p>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div className="contact-grid" style={{ maxWidth: 1000, margin: '0 auto', padding: '3rem 1.5rem 6rem', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(260px, 340px)', gap: '2.5rem' }}>

        {/* Form */}
        <div style={{ background: 'white', borderRadius: 20, padding: '2rem', border: '1px solid rgba(0,0,0,.06)', boxShadow: '0 2px 16px rgba(0,0,0,.05)' }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: '1.3rem', color: '#0C2014', marginBottom: '1.5rem' }}>
            Send an Enquiry
          </h2>
          <EnquiryForm />
        </div>

        {/* Direct channels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <ChannelCard Icon={Phone}          label="Call us"    value={PHONE_NUMBER} href={`tel:${PHONE_NUMBER.replace(/\s/g, '')}`} />
          <ChannelCard Icon={MessageCircle}  label="WhatsApp"   value="Chat with us"  href={whatsAppLink()} external />
          <ChannelCard Icon={Mail}           label="Email"      value={CONTACT_EMAIL} href={`mailto:${CONTACT_EMAIL}`} />
          <ChannelCard Icon={MapPin}         label="Based in"   value="Chennai, Tamil Nadu" href="/about" />
        </div>
      </div>

      <FloatingWhatsApp />
      <MobileStickyBar />
    </div>
  );
}
