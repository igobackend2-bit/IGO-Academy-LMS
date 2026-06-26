/**
 * PaymentModal — Razorpay checkout modal for paid course enrollment
 * Props: { course, isOpen, onClose }
 * On success: shows toast + navigates to /student/dashboard
 */
import api from '@/services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Dynamically loads the Razorpay checkout.js script once
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PaymentModal({ course, isOpen, onClose }) {
  const navigate = useNavigate();

  const handlePayment = async () => {
    try {
      // 1. Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Payment service unavailable. Contact info@igoacademy.in');
        return;
      }

      // 2. Create order on backend
      const { data: res } = await api.post('/payments/create-order', { course_id: course.id });
      const { orderId, amount, currency, keyId, courseName, studentName, studentEmail } = res.data;

      // 3. Open Razorpay checkout
      const options = {
        key: keyId,
        amount,
        currency,
        name: 'IGo Academy',
        description: courseName,
        order_id: orderId,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              course_id: course.id,
            });
            toast.success('Payment successful! You are enrolled.');
            onClose();
            navigate('/student/dashboard');
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: { name: studentName, email: studentEmail },
        theme: { color: '#0C2014' },
        modal: { ondismiss: onClose },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
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
