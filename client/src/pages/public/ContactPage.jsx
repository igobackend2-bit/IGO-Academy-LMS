/**
 * Contact — requirement doc Section 6 (nav item) + Section 7 (lead capture).
 * Real contact email comes from the Privacy Policy's existing contact
 * address. Phone/WhatsApp render only once set in IGO_CONTACT (brand.js) —
 * no placeholder number is ever shown to a visitor.
 */
import PublicNav from '@/components/layout/PublicNav';
import MobileStickyCta from '@/components/layout/MobileStickyCta';
import EnquiryForm from '@/components/features/EnquiryForm';
import SEO from '@/components/common/SEO';
import SiteFooter from '@/components/layout/SiteFooter';
import { IGO_META, IGO_CONTACT } from '@/constants/brand';
import { Mail, MapPin, Phone, MessageCircle } from 'lucide-react';

function ContactRow({ Icon, label, value, href }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.85rem', marginBottom: '1.25rem' }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, background: '#EDF6E4',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={18} color="#3F8A24" strokeWidth={2} />
      </div>
      <div>
        <div style={{ fontSize: '.72rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>{label}</div>
        {href ? (
          <a href={href} style={{ color: '#0C2014', fontWeight: 700, fontSize: '.95rem', textDecoration: 'none' }}>{value}</a>
        ) : (
          <div style={{ color: '#0C2014', fontWeight: 700, fontSize: '.95rem' }}>{value}</div>
        )}
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="page-enter" style={{ minHeight: '100vh', fontFamily: "'Manrope', sans-serif", background: '#F5F7F3' }}>
      <SEO
        title="Contact Us — IGO Academy"
        description="Get in touch with IGO Academy — course enquiries, admissions, and support."
        path="/contact"
      />
      <PublicNav />

      <section style={{ background: 'linear-gradient(135deg, #0C2014 0%, #235C39 100%)', padding: '3.5rem 2rem', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 900, marginBottom: '.6rem' }}>
          Contact Us
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', maxWidth: 560, margin: '0 auto' }}>
          Have a question about a course, fees, or upcoming batches? Reach out — we're happy to help.
        </p>
      </section>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '3.5rem 1.5rem 5rem', display: 'grid', gridTemplateColumns: 'minmax(240px, 340px) 1fr', gap: '2.5rem' }}>
        <div>
          {/* Uses the real, actively-referenced contact address (matches Privacy Policy /
              Terms / Refund / Disclaimer) — head@igoacademy.in, replacing the retired
              igotnskills@gmail.com address (removed sitewide 26 Aug 2026). Reads from
              IGO_CONTACT.email2 (brand.js) so this stays in sync with the other pages. */}
          <ContactRow Icon={Mail} label="Email" value={IGO_CONTACT.email2} href={`mailto:${IGO_CONTACT.email2}`} />
          {IGO_CONTACT.phone && <ContactRow Icon={Phone} label="Phone" value={IGO_CONTACT.phone} href={`tel:${IGO_CONTACT.phone}`} />}
          {IGO_CONTACT.phone2 && <ContactRow Icon={Phone} label="Phone (Alternate)" value={IGO_CONTACT.phone2} href={`tel:${IGO_CONTACT.phone2}`} />}
          {IGO_CONTACT.whatsapp && <ContactRow Icon={MessageCircle} label="WhatsApp" value="Chat with us" href={`https://wa.me/${IGO_CONTACT.whatsapp}`} />}
          <ContactRow Icon={MapPin} label="Address" value={IGO_META.address} />

          <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,0,0,.08)', marginTop: '.5rem' }}>
            <iframe
              title="IGO Academy location — Uthandi, Kanathur, Chennai"
              src={`https://www.google.com/maps?q=${encodeURIComponent(IGO_META.address)}&output=embed`}
              width="100%"
              height="220"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div id="enquiry-form" style={{ background: 'white', border: '1px solid rgba(0,0,0,.06)', borderRadius: 20, padding: '2rem', scrollMarginTop: 80 }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: '1.2rem', color: '#0C2014', marginBottom: '1.25rem' }}>
            Send an Enquiry
          </h2>
          <EnquiryForm source="contact_page" compact fields={['name', 'mobile', 'email', 'location', 'course_interest_text', 'message']} />
        </div>
      </div>

      <SiteFooter />

      <MobileStickyCta />
    </div>
  );
}
