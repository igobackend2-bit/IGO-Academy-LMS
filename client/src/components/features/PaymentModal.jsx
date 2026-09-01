/**
 * PaymentModal — Razorpay checkout modal for paid course enrollment
 * Props: { course, isOpen, onClose }
 * On success: shows toast + navigates to /student/dashboard
 */
import { useEffect, useRef } from 'react';
import api from '@/services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

/** Loads Razorpay's Checkout.js once and reuses it on subsequent opens. */
function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${CHECKOUT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = CHECKOUT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PaymentModal({ course, isOpen, onClose }) {
  const navigate = useNavigate();
  const inFlight = useRef(false);

  // Warm the script as soon as the modal opens, so clicking "Pay" doesn't
  // have to wait on the network round-trip to checkout.razorpay.com.
  useEffect(() => {
    if (isOpen) loadRazorpayScript();
  }, [isOpen]);

  const handlePayment = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const ok = await loadRazorpayScript();
      if (!ok || !window.Razorpay) {
        toast.error('Could not load the payment SDK — check your connection and try again.');
        return;
      }

      // 1. Create order on backend
      const { data: res } = await api.post('/payments/create-order', { course_id: course.id });
      const { orderId, keyId, amount, currency, courseName, studentName, studentEmail, studentPhone } = res.data;

      // 2. Open Razorpay's modal checkout
      const rzp = new window.Razorpay({
        key: keyId,
        order_id: orderId,
        amount,
        currency,
        name: 'IGo Academy',
        // Absolute URL — Razorpay's checkout is a cross-origin iframe, so a
        // relative path wouldn't resolve against the right origin. Derives
        // from window.location so it's correct on both localhost and prod
        // without hardcoding a domain.
        image: `${window.location.origin}/igo-logo.webp`,
        description: courseName,
        prefill: {
          name: studentName || undefined,
          email: studentEmail || undefined,
          contact: studentPhone || undefined,
        },
        theme: { color: '#0C2014' },
        handler: async (response) => {
          // Payment completed client-side — confirm with our backend, which
          // re-checks the signature rather than trusting anything from the
          // client directly.
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Payment successful! You are enrolled.');
            onClose();
            navigate('/student/dashboard');
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed. Contact support.');
          }
        },
        modal: {
          // User closed the popup without paying — not a failure worth
          // alarming over, just release the in-flight guard.
          ondismiss: () => { inFlight.current = false; },
        },
      });

      rzp.on('payment.failed', (response) => {
        toast.error(response.error?.description || 'Payment failed. Please try again.');
      });

      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment');
    } finally {
      inFlight.current = false;
    }
  };

  if (!isOpen || !course) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <div style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0C2014', marginBottom: '.5rem' }}>
            Enroll in Course
          </h2>
          <p style={{ color: '#6b7280', fontSize: '.875rem', marginBottom: '1.5rem' }}>
            {course.title}
          </p>

          <div style={{
            background: '#F0FBF0',
            borderRadius: 12,
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280', fontSize: '.875rem' }}>Course fee</span>
              <span style={{ fontWeight: 800, color: '#0C2014', fontSize: '1.1rem' }}>
                ₹{Number(course.price).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <p style={{ fontSize: '.75rem', color: '#9ca3af', marginBottom: '1.25rem' }}>
            Secured by Razorpay · UPI / Cards / Net Banking / Wallets accepted
          </p>

          <div style={{ display: 'flex', gap: '.75rem' }}>
            <button
              onClick={handlePayment}
              style={{
                flex: 1,
                padding: '.75rem',
                background: 'linear-gradient(135deg,#0C2014,#235C39)',
                color: 'white',
                borderRadius: 10,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                fontSize: '.95rem',
              }}
            >
              Pay ₹{Number(course.price).toLocaleString('en-IN')}
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '.75rem 1.25rem',
                border: '1.5px solid #d1d5db',
                borderRadius: 10,
                background: 'white',
                cursor: 'pointer',
                fontWeight: 600,
                color: '#374151',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
