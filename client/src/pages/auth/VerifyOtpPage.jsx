import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '@/services/api';
export default function VerifyOtpPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit } = useForm({
    defaultValues: { identifier: location.state?.identifier || '' },
  });
  const onSubmit = async ({ identifier, otp, new_password }) => {
    setLoading(true); setError('');
    // identifier may be an email or a phone number — send whichever shape
    // it is under the field name auth.controller.js actually branches on.
    const isEmail = identifier.includes('@');
    const payload = isEmail
      ? { email: identifier, otp, new_password }
      : { phone: identifier, otp, new_password };
    try {
      await api.post('/auth/verify-otp', payload);
      navigate('/login', { state: { message: 'Password updated. Please log in.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    }
    setLoading(false);
  };
  return (
    <div className="min-h-[100dvh] bg-igo-green-light flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-igo-card-hover p-8">
        <h2 className="text-xl font-bold text-igo-navy mb-6">Verify OTP</h2>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="text" placeholder="Email or mobile number" className="igo-input" {...register('identifier', { required: true })} />
          <input type="text" placeholder="6-digit OTP" maxLength={6} className="igo-input tracking-widest text-center text-xl" {...register('otp', { required: true })} />
          <input type="password" placeholder="New Password" className="igo-input" {...register('new_password', { required: true, minLength: 6 })} />
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Verifying…' : 'Reset Password'}</button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          <Link to="/login" className="text-igo-green font-semibold">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
