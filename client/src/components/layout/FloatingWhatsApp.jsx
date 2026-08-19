/**
 * FloatingWhatsApp — persistent bottom-right WhatsApp CTA bubble.
 * Hidden on mobile widths where MobileStickyBar already covers WhatsApp.
 */
import { MessageCircle } from 'lucide-react';
import { whatsAppLink } from '@/constants/contact';

export default function FloatingWhatsApp() {
  return (
    <>
      <a
        href={whatsAppLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp"
        aria-label="Chat on WhatsApp"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 95,
          width: 56, height: 56, borderRadius: '50%',
          background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(34,197,94,.4)', textDecoration: 'none',
        }}
      >
        <MessageCircle size={26} color="white" strokeWidth={2} />
      </a>
      <style>{`
        @media (max-width: 767px) {
          .floating-whatsapp { display: none !important; }
        }
      `}</style>
    </>
  );
}
