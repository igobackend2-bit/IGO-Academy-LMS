/**
 * EnquiryForm — reusable lead-capture form used on the homepage, course
 * detail pages, the Contact page, and every page-specific landing page
 * (Careers, Colleges, Workshops, Student Success, Partner Profile, etc).
 * Posts to POST /api/enquiries (public, no auth required).
 *
 * Props: {
 *   defaultCourse?: string,
 *   compact?: boolean,
 *   source?: string,            // which page this came from, for lead attribution
 *   fields?: string[],          // subset of FIELD keys to show; omit = show all
 *   messagePlaceholder?: string // override the message textarea's placeholder
 *   coursePlaceholder?: string  // override the "Course Interested In" placeholder
 *                               // (default keeps the original "e.g. Hydroponics
 *                               // Farming" example — pass a farm-free string for
 *                               // callers, like Workshops/Contact/Student Success,
 *                               // that want a generic example instead)
 *   twoStep?: boolean,          // Website Refinement Action Plan, Sept 2026 — item 9
 * }
 *
 * `fields` entries use the caller-facing names below (matching what the
 * page-specific landing pages pass in) — FIELD_KEY_MAP translates them to
 * this form's internal state keys / the API's actual field names.
 *
 * `twoStep`: splits the default full-field form into two screens — Step 1
 * collects only name, phone and course of interest behind a "Get Course
 * Details" button, Step 2 collects the rest before the single real submit.
 * Purely client-side (still one POST /api/enquiries call, on Step 2's
 * submit) — opt-in, only passed by callers using the full field set
 * (HomePage's Enquire Now section, EnquirePage). Every other caller's
 * shorter custom `fields` form is unaffected.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { useRecaptcha } from '@/hooks/useRecaptcha';

const CANDIDATE_TYPES = [
  'Farmer', 'Agriculture Student', 'Agriculture Graduate', 'Entrepreneur',
  'Rural Youth', 'FPO Member', 'SHG Member', 'Working Professional',
  'Student', 'Existing Farm Owner', 'Other',
];
const MODES = ['Online', 'Offline', 'Hybrid', 'Institutional / Corporate Training'];

// Caller-facing field name -> internal state key (most already match; only
// the two renamed ones need a translation).
const FIELD_KEY_MAP = {
  name: 'name', mobile: 'phone', email: 'email', location: 'location',
  course_interest_text: 'course_interested', candidate_type: 'candidate_type',
  preferred_mode: 'preferred_mode', message: 'message',
};
const ALL_FIELDS = Object.keys(FIELD_KEY_MAP);

// Step 1 of the two-step form (`twoStep` prop) — name, phone, course of
// interest. These use INTERNAL state keys (name/phone/course_interested),
// since `show()` below checks against the already-mapped `visible` Set.
const STEP1_KEYS = ['name', 'phone', 'course_interested'];

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

const submitButtonStyle = (loading) => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
  background: loading ? '#c9a45f' : 'linear-gradient(135deg, #DAA520, #C5A03F)',
  color: 'white', padding: '.9rem 2rem', borderRadius: 50,
  fontWeight: 800, fontSize: '.9rem', border: 'none',
  cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '.04em',
  boxShadow: '0 8px 24px rgba(218,165,32,.30)',
});

export default function EnquiryForm({
  defaultCourse = '', compact = false, source = 'website',
  fields = null, messagePlaceholder, coursePlaceholder = 'e.g. Hydroponics Farming',
  twoStep = false,
}) {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', location: '',
    course_interested: defaultCourse, candidate_type: '', preferred_mode: '', message: '',
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // only meaningful when twoStep
  const { execute: executeRecaptcha } = useRecaptcha();

  // fields=null (the default) means show every field, same as before this
  // prop existed — callers that don't pass it (ContactPage, CourseDetail)
  // are unaffected.
  const visible = fields
    ? new Set(fields.map(f => FIELD_KEY_MAP[f] || f))
    : new Set(ALL_FIELDS.map(f => FIELD_KEY_MAP[f]));
  const show = (key) => visible.has(key) && !(twoStep && step === 2 && STEP1_KEYS.includes(key));

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  // Step 1 → Step 2 (twoStep only). No API call yet — the real submit still
  // happens once, in handleSubmit, on Step 2.
  function handleContinue(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    setStep(2);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error('Name and phone number are required');
      return;
    }
    setLoading(true);
    try {
      const recaptcha_token = await executeRecaptcha('enquiry_submit');
      await api.post('/enquiries', { ...form, source, recaptcha_token, landing_page: window.location.pathname });
      toast.success('Enquiry received — our team will reach out shortly.');
      setForm({ name: '', phone: '', email: '', location: '', course_interested: defaultCourse, candidate_type: '', preferred_mode: '', message: '' });
      setStep(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 1 (twoStep only): name + phone + course, nothing else ──
  if (twoStep && step === 1) {
    return (
      <form onSubmit={handleContinue} style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Name *</label>
          <input style={inputStyle} value={form.name} onChange={set('name')} placeholder="Your full name" required />
        </div>
        <div>
          <label style={labelStyle}>WhatsApp / Mobile Number *</label>
          <input style={inputStyle} value={form.phone} onChange={set('phone')} placeholder="10-digit mobile number" required />
        </div>
        <div>
          <label style={labelStyle}>Course Interested In</label>
          <input style={inputStyle} value={form.course_interested} onChange={set('course_interested')} placeholder={coursePlaceholder} />
        </div>
        <button type="submit" style={submitButtonStyle(false)}>
          Get Course Details
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: compact ? '.85rem' : '1.1rem' }}>
      {twoStep && step === 2 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '.82rem', fontWeight: 700, color: '#4C5B50' }}>
            Thanks{form.name ? `, ${form.name.split(' ')[0]}` : ''} — just a few more details:
          </span>
          <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#2d6a14', fontWeight: 700, fontSize: '.78rem', cursor: 'pointer', padding: 0 }}>
            ← Back
          </button>
        </div>
      )}

      {!(twoStep && step === 2) && (
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
      )}

      {(show('email') || show('location')) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {show('email') && (
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
            </div>
          )}
          {show('location') && (
            <div>
              <label style={labelStyle}>Location</label>
              <input style={inputStyle} value={form.location} onChange={set('location')} placeholder="City / District" />
            </div>
          )}
        </div>
      )}

      {(show('course_interested') || show('candidate_type')) && (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {show('course_interested') && (
        <div>
          <label style={labelStyle}>Course Interested In</label>
          <input style={inputStyle} value={form.course_interested} onChange={set('course_interested')} placeholder={coursePlaceholder} />
        </div>
        )}
        {show('candidate_type') && (
        <div>
          <label style={labelStyle}>Candidate Type</label>
          <select style={inputStyle} value={form.candidate_type} onChange={set('candidate_type')}>
            <option value="">Select one</option>
            {CANDIDATE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        )}
      </div>
      )}

      {show('preferred_mode') && (
      <div>
        <label style={labelStyle}>Preferred Learning Mode</label>
        <select style={inputStyle} value={form.preferred_mode} onChange={set('preferred_mode')}>
          <option value="">Select one</option>
          {MODES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      )}

      {show('message') && (
      <div>
        <label style={labelStyle}>Message</label>
        <textarea
          style={{ ...inputStyle, minHeight: 90, resize: 'vertical', fontFamily: "'Manrope', sans-serif" }}
          value={form.message} onChange={set('message')}
          placeholder={messagePlaceholder || 'Tell us anything else that would help us guide you'}
        />
      </div>
      )}

      <button type="submit" disabled={loading} style={submitButtonStyle(loading)}>
        {loading ? 'Submitting…' : (twoStep && step === 2 ? 'Submit Enquiry' : 'Submit Enquiry')}
      </button>
    </form>
  );
}
