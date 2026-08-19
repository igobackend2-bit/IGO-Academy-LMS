/**
 * EnquiryForm — reusable lead-capture form used on the homepage, course
 * detail pages, and the Contact page. Posts to POST /api/enquiries
 * (public, no auth required).
 * Props: { defaultCourse?: string, compact?: boolean }
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/services/api';

const CANDIDATE_TYPES = [
  'Farmer', 'Agriculture Student', 'Agriculture Graduate', 'Entrepreneur',
  'Rural Youth', 'FPO Member', 'SHG Member', 'Working Professional',
  'Student', 'Existing Farm Owner', 'Other',
];
const MODES = ['Online', 'Offline', 'Hybrid', 'Institutional / Corporate Training'];

const inputStyle = {
  width: '100%', padding: '.75rem 1rem', borderRadius: 12,
  border: '1.5px solid rgba(0,0,0,.1)', fontSize: '.9rem',
  fontFamily: "'Manrope', sans-serif", color: '#0C2014', background: 'white',
  outline: 'none', boxSizing: 'border-box',
};
const labelStyle = {
  display: 'block', fontSize: '.75rem', fontWeight: 700, color: '#4C5B50',
  textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.4rem',
};

export default function EnquiryForm({ defaultCourse = '', compact = false }) {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', location: '',
    course_interested: defaultCourse, candidate_type: '', preferred_mode: '', message: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error('Name and phone number are required');
      return;
    }
    setLoading(true);
    try {
      await api.post('/enquiries', { ...form, landing_page: window.location.pathname });
      toast.success('Enquiry received — our team will reach out shortly.');
      setForm({ name: '', phone: '', email: '', location: '', course_interested: defaultCourse, candidate_type: '', preferred_mode: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: compact ? '.85rem' : '1.1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Name *</label>
          <input style={inputStyle} value={form.name} onChange={set('name')} placeholder="Your full name" required />
        </div>
        <div>
          <label style={labelStyle}>Mobile Number *</label>
          <input style={inputStyle} value={form.phone} onChange={set('phone')} placeholder="10-digit mobile number" required />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
        </div>
        <div>
          <label style={labelStyle}>Location</label>
          <input style={inputStyle} value={form.location} onChange={set('location')} placeholder="City / District" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Course Interested In</label>
          <input style={inputStyle} value={form.course_interested} onChange={set('course_interested')} placeholder="e.g. Hydroponics Farming" />
        </div>
        <div>
          <label style={labelStyle}>Candidate Type</label>
          <select style={inputStyle} value={form.candidate_type} onChange={set('candidate_type')}>
            <option value="">Select one</option>
            {CANDIDATE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Preferred Learning Mode</label>
        <select style={inputStyle} value={form.preferred_mode} onChange={set('preferred_mode')}>
          <option value="">Select one</option>
          {MODES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div>
        <label style={labelStyle}>Message</label>
        <textarea
          style={{ ...inputStyle, minHeight: 90, resize: 'vertical', fontFamily: "'Manrope', sans-serif" }}
          value={form.message} onChange={set('message')}
          placeholder="Tell us anything else that would help us guide you"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          background: loading ? '#c9a45f' : 'linear-gradient(135deg, #DAA520, #C5A03F)',
          color: 'white', padding: '.9rem 2rem', borderRadius: 50,
          fontWeight: 800, fontSize: '.9rem', border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '.04em',
          boxShadow: '0 8px 24px rgba(218,165,32,.30)',
        }}
      >
        {loading ? 'Submitting…' : 'Submit Enquiry'}
      </button>
    </form>
  );
}
