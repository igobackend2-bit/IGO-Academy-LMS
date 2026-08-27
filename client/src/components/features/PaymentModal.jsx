/**
 * PaymentModal — Cashfree checkout modal for paid course enrollment
 * Props: { course, isOpen, onClose }
 * On success: shows toast + navigates to /student/dashboard
 */
import { load } from '@cashfreepayments/cashfree-js';
import api from '@/services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function PaymentModal({ course, isOpen, onClose }) {
  const navigate = useNavigate();

  const handlePayment = async () => {
    try {
      // 1. Create order on backend
      const { data: res } = await api.post('/payments/create-order', { course_id: course.id });
      const { orderId, paymentSessionId, mode } = res.data;

      // 2. Load Cashfree SDK (mode comes from the backend so the frontend
      // never hardcodes sandbox vs production)
      const cashfree = await load({ mode });

      // 3. Open Cashfree's modal checkout
      const result = await cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_modal',
      });

      if (result.error) {
        // User closed the popup, or a payment error occurred — not
        // necessarily a failure worth alarming over (could just be a
        // cancel), so stay quiet unless there's a real message.
        if (result.error.message) toast.error(result.error.message);
        return;
      }

      if (result.paymentDetails) {
        // Payment completed (any status) — confirm with our backend, which
        // re-checks the order status directly against Cashfree's server
        // rather than trusting anything from the client.
        try {
          await api.post('/payments/verify', { order_id: orderId });
          toast.success('Payment successful! You are enrolled.');
          onClose();
          navigate('/student/dashboard');
        } catch (err) {
          toast.error(err.response?.data?.message || 'Payment verification failed. Contact support.');
        }
      }
      // result.redirect === true: Cashfree redirected the browser itself
      // (rare in-app-browser fallback) — the return_url lands the student
      // back on the dashboard; nothing further to do here.
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment');
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
              <span style={{ color: '#6b7280', fontSize: '.875rem' }}>Course fee</span>
              <span style={{ fontWeight: 800, color: '#0C2014', fontSize: '1.1rem' }}>
                ₹{Number(course.price).toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280', fontSize: '.875rem' }}>Access duration</span>
              <span style={{ fontSize: '.875rem', color: '#0C2014', fontWeight: 600 }}>1 Year</span>
            </div>
          </div>

          <p style={{ fontSize: '.75rem', color: '#9ca3af', marginBottom: '1.25rem' }}>
            Secured by Cashfree · UPI / Cards / Net Banking / Wallets accepted
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
