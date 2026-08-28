/**
 * EnquirePage — standalone "Enquire Now" page, separate from /contact.
 * Contact info + map view live on the Contact page; this page is just the
 * lead-capture form, reached via the site-wide "Enquire Now" button.
 */
import PublicNav from '@/components/layout/PublicNav';
import MobileStickyCta from '@/components/layout/MobileStickyCta';
import EnquiryForm from '@/components/features/EnquiryForm';
import SEO from '@/components/common/SEO';
import SiteFooter from '@/components/layout/SiteFooter';

export default function EnquirePage() {
  return (
    <div className="page-enter" style={{ minHeight: '100vh', fontFamily: "'Manrope', sans-serif", background: '#F5F7F3' }}>
      <SEO
        title="Enquire Now — IGO Academy"
        description="Tell us a bit about you and the IGO Academy team will reach out with course details, fees and upcoming batches."
        path="/enquire"
      />
      <PublicNav />

      <section style={{ background: 'linear-gradient(135deg, #0C2014 0%, #235C39 100%)', padding: '3.5rem 2rem', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 900, marginBottom: '.6rem' }}>
          Enquire Now
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', maxWidth: 560, margin: '0 auto' }}>
          Tell us a bit about you and our team will reach out with course details, fees and upcoming batches.
        </p>
      </section>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '3.5rem 1.5rem 5rem' }}>
        <div id="enquiry-form" style={{ background: 'white', border: '1px solid rgba(0,0,0,.06)', borderRadius: 20, padding: '2rem', scrollMarginTop: 80 }}>
          <EnquiryForm source="enquire_page" />
        </div>
      </div>

      <SiteFooter />

      <MobileStickyCta />
    </div>
  );
}
