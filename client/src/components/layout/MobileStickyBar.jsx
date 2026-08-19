/**
 * MobileStickyBar — fixed bottom bar shown only on small screens:
 * Call | WhatsApp | Enquire. Per requirements doc §7.
 */
import { useNavigate } from 'react-router-dom';
import { Phone, MessageCircle, Mail } from 'lucide-react';
import { PHONE_NUMBER, whatsAppLink } from '@/constants/contact';

export default function MobileStickyBar() {
  const navigate = useNavigate();

  const items = [
    { icon: Phone,          label: 'Call',     href: `tel:${PHONE_NUMBER.replace(/\s/g, '')}`, color: '#2d6a14' },
    { icon: MessageCircle,  label: 'WhatsApp', href: whatsAppLink(), color: '#22c55e', external: true },
    { icon: Mail,           label: 'Enquire',  onClick: () => navigate('/contact'), color: '#DAA520' },
  ];

  return (
    <>
      <div className="mobile-sticky-bar" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90,
        display: 'none', background: 'white',
        borderTop: '1px solid rgba(0,0,0,.08)',
        boxShadow: '0 -4px 20px rgba(0,0,0,.08)',
      }}>
        {items.map(item => {
          const Icon = item.icon;
          const content = (
            <>
              <Icon size={18} color={item.color} strokeWidth={2} />
              <span style={{ fontSize: '.68rem', fontWeight: 700, color: '#0C2014', marginTop: 2 }}>{item.label}</span>
            </>
          );
          const style = {
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '.6rem 0', textDecoration: 'none', cursor: 'pointer',
          };
          return item.onClick ? (
            <button key={item.label} onClick={item.onClick} style={{ ...style, background: 'none', border: 'none' }}>{content}</button>
          ) : (
            <a key={item.label} href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noopener noreferrer' : undefined} style={style}>
              {content}
            </a>
          );
        })}
      </div>
      <style>{`
        @media (max-width: 767px) {
          .mobile-sticky-bar { display: flex !important; }
        }
      `}</style>
    </>
  );
}
