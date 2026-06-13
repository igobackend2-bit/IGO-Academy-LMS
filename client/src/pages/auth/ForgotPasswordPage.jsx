import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '@/services/api';
export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm();
  const onSubmit = async ({ email }) => {
    setLoading(true);
    await api.post('/auth/forgot-password', { email });
    setSent(true); setLoading(false);
  };
  return (
    <div className="min-h-screen bg-igo-green-light flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-igo-card-hover p-8">
        <Link to="/login" className="text-igo-green text-sm font-semibold mb-6 block">← Back to Login</Link>
        <h2 className="text-xl font-bold text-igo-navy mb-2">Reset Password</h2>
        <p className="text-gray-500 text-sm mb-6">Enter your registered email and we'll send an OTP.</p>
        {sent ? (
          <div className="bg-igo-green-light border border-igo-green rounded-lg p-4 text-igo-green-800 text-sm">
            ✓ OTP sent! <Link to="/verify-otp" className="underline font-semibold">Enter OTP →</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="email" placeholder="your@email.com" className="igo-input" {...register('email', { required: true })} />
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Sending…' : 'Send OTP'}</button>
          </form>
        )}
      </div>
    </div>
  );
}
