import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '@/services/api';
export default function VerifyOtpPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const onSubmit = async (data) => {
    setLoading(true); setError('');
    try {
      await api.post('/auth/verify-otp', data);
      navigate('/login', { state: { message: 'Password updated. Please log in.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    }
    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-igo-green-light flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-igo-card-hover p-8">
        <h2 className="text-xl font-bold text-igo-navy mb-6">Verify OTP</h2>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="email" placeholder="Email" className="igo-input" {...register('email', { required: true })} />
          <input type="text" placeholder="6-digit OTP" maxLength={6} className="igo-input tracking-widest text-center text-xl" {...register('otp', { required: true })} />
          <input type="password" placeholder="New Password" className="igo-input" {...register('new_password', { required: true, minLength: 6 })} />
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Verifying…' : 'Reset Password'}</button>
        </form>
      </div>
    </div>
  );
}
