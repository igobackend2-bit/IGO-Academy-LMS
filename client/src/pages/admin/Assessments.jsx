import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import toast from 'react-hot-toast';

const EMPTY_QUESTION = () => ({
  id: crypto.randomUUID(),
  text: '',
  options: ['', '', '', ''],
  correct_answer: '',
  points: 1,
});

const EMPTY_ASSESSMENT = () => ({
  title: '',
  type: 'quiz',
  max_score: 100,
  pass_score: 60,
  max_attempts: 1,
  timer_mins: '',
  questions: [EMPTY_QUESTION()],
  is_published: false,
});

export default function AdminAssessments() {
  const qc = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [activeModule, setActiveModule] = useState(null); // module for current modal
  const [form, setForm] = useState(EMPTY_ASSESSMENT());

  // All courses
  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get('/courses').then(r => r.data.data),
  });

  // Modules for selected course (comes with course detail)
  const { data: courseDetail } = useQuery({
    queryKey: ['course-detail', selectedCourse?.id],
    queryFn: () => api.get(`/courses/${selectedCourse.id}`).then(r => r.data.data),
    enabled: !!selectedCourse,
  });
  const modules = courseDetail?.modules ?? [];

  // Assessments for selected course (all at once, we group by module_id in UI)
  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments', selectedCourse?.id],
    queryFn: () =>
      api.get('/assessments', { params: { course_id: selectedCourse.id } }).then(r => r.data.data),
    enabled: !!selectedCourse,
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/assessments', data),
    onSuccess: () => {
      qc.invalidateQueries(['assessments', selectedCourse?.id]);
      toast.success('Assessment created');
      closeModal();
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to create'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/assessments/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries(['assessments', selectedCourse?.id]);
      toast.success('Assessment saved');
      closeModal();
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to save'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/assessments/${id}`),
    onSuccess: () => {
      qc.invalidateQueries(['assessments', selectedCourse?.id]);
      toast.success('Deleted');
    },
  });

  const togglePublish = (a) =>
    updateMutation.mutate({ id: a.id, data: { ...a, is_published: !a.is_published } });

  function openCreate(mod) {
    setActiveModule(mod);
    setEditing(null);
    setForm(EMPTY_ASSESSMENT());
    setShowModal(true);
  }

  function openEdit(a, mod) {
    setActiveModule(mod);
    setEditing(a);
    setForm({
      title: a.title,
      type: a.type,
      max_score: a.max_score,
      pass_score: a.pass_score,
      max_attempts: a.max_attempts,
      timer_mins: a.timer_mins || '',
      questions: Array.isArray(a.questions) && a.questions.length > 0
        ? a.questions.map(q => ({
            id: q.id || crypto.randomUUID(),
            text: q.text || '',
            options: q.options?.length === 4 ? q.options : ['', '', '', ''],
            correct_answer: q.correct_answer || '',
            points: q.points || 1,
          }))
        : [EMPTY_QUESTION()],
      is_published: a.is_published,
    });
    setShowModal(true);
  }

  function closeModal() { setShowModal(false); setEditing(null); setActiveModule(null); }

  function setQ(idx, field, value) {
    setForm(f => {
      const qs = [...f.questions];
      qs[idx] = { ...qs[idx], [field]: value };
      return { ...f, questions: qs };
    });
  }

  function setOption(qIdx, oIdx, value) {
    setForm(f => {
      const qs = [...f.questions];
      const opts = [...qs[qIdx].options];
      opts[oIdx] = value;
      qs[qIdx] = { ...qs[qIdx], options: opts };
      return { ...f, questions: qs };
    });
  }

  function addQuestion() {
    setForm(f => ({ ...f, questions: [...f.questions, EMPTY_QUESTION()] }));
  }

  function removeQuestion(idx) {
    setForm(f => ({ ...f, questions: f.questions.filter((_, i) => i !== idx) }));
  }

  function handleSubmit(publish) {
    for (const [i, q] of form.questions.entries()) {
      if (!q.text.trim()) return toast.error(`Question ${i + 1} has no text`);
      if (q.options.some(o => !o.trim())) return toast.error(`Question ${i + 1} has empty options`);
      if (!q.correct_answer) return toast.error(`Question ${i + 1} has no correct answer selected`);
    }
    const payload = {
      ...form,
      course_id: selectedCourse.id,
      module_id: activeModule?.id ?? null,
      is_published: publish,
      timer_mins: form.timer_mins ? Number(form.timer_mins) : null,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const saving = createMutation.isPending || updateMutation.isPending;

  // Group assessments by module_id
  const assessmentsByModule = {};
  for (const a of assessments) {
    const key = a.module_id ?? '__none__';
    if (!assessmentsByModule[key]) assessmentsByModule[key] = [];
    assessmentsByModule[key].push(a);
  }

  return (
    <div className="flex h-full page-enter" style={{ minHeight: 0 }}>
      {/* LEFT — Course list */}
      <div style={{ width: 240, borderRight: '1px solid #e5e7eb', overflowY: 'auto', padding: '24px 0', flexShrink: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: '#9ca3af', padding: '0 20px 12px' }}>
          ALL COURSES
        </p>
        {courses.length === 0 && (
          <p style={{ fontSize: 13, color: '#9ca3af', padding: '0 20px' }}>No courses yet</p>
        )}
        {courses.map(c => (
          <button
            key={c.id}
            onClick={() => { setSelectedCourse(c); }}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '10px 20px', background: selectedCourse?.id === c.id ? '#f0fdf4' : 'transparent',
              borderLeft: selectedCourse?.id === c.id ? '3px solid #16a34a' : '3px solid transparent',
              border: 'none', cursor: 'pointer',
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0, lineHeight: 1.4 }}>{c.title}</p>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>
              {c.status === 'published' ? '● Published' : '○ Draft'}
            </p>
          </button>
        ))}
      </div>

      {/* RIGHT — Module-based assessments */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
        {!selectedCourse ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, color: '#9ca3af' }}>
            <span style={{ fontSize: 48 }}>📋</span>
            <p style={{ marginTop: 12, fontSize: 15 }}>Select a course to manage assessments</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>{selectedCourse.title}</h1>
              <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>
                Manage assessments per module — students unlock the next module after passing each quiz
              </p>
            </div>

            {modules.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af', background: '#f9fafb', borderRadius: 16 }}>
                <p style={{ fontSize: 32, margin: 0 }}>📦</p>
                <p style={{ marginTop: 12 }}>No modules found for this course. Add modules from the Courses page first.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {modules.map((mod, idx) => {
                  const modAssessments = assessmentsByModule[mod.id] ?? [];
                  return (
                    <div key={mod.id} style={{ border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
                      {/* Module header */}
                      <div style={{ background: '#f8fafc', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                            {idx + 1}
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', margin: 0 }}>{mod.title}</p>
                            <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>
                              Module {idx + 1} · {modAssessments.length} assessment{modAssessments.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => openCreate(mod)}
                          style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, background: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                        >
                          + Add Assessment
                        </button>
                      </div>

                      {/* Assessments for this module */}
                      <div style={{ padding: modAssessments.length === 0 ? '16px 20px' : '12px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {modAssessments.length === 0 ? (
                          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0, fontStyle: 'italic' }}>
                            No assessment yet — students can skip this module without a quiz
                          </p>
                        ) : (
                          modAssessments.map(a => {
                            const qCount = Array.isArray(a.questions) ? a.questions.length : 0;
                            return (
                              <div key={a.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{a.title}</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: a.is_published ? '#dcfce7' : '#fef9c3', color: a.is_published ? '#166534' : '#854d0e' }}>
                                      {a.is_published ? 'Published' : 'Draft'}
                                    </span>
                                  </div>
                                  <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>
                                    {qCount} question{qCount !== 1 ? 's' : ''} · Pass {a.pass_score}% · {a.max_attempts} attempt{a.max_attempts !== 1 ? 's' : ''}
                                    {a.timer_mins ? ` · ⏱ ${a.timer_mins} min` : ''}
                                  </p>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button onClick={() => togglePublish(a)} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                                    {a.is_published ? 'Unpublish' : 'Publish'}
                                  </button>
                                  <button onClick={() => openEdit(a, mod)} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                                    Edit
                                  </button>
                                  <button onClick={() => { if (window.confirm('Delete this assessment?')) deleteMutation.mutate(a.id); }} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, border: '1px solid #fca5a5', background: '#fff', color: '#dc2626', cursor: 'pointer', fontWeight: 600 }}>
                                    Delete
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL — Create / Edit Assessment */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '32px 16px' }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 720, padding: 32, position: 'relative' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280' }}>✕</button>

            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {editing ? 'Edit Assessment' : 'Create Assessment'}
              </h2>
              {activeModule && (
                <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>
                  Module: <strong>{activeModule.title}</strong>
                </p>
              )}
            </div>

            {/* Basic info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Assessment Title *</label>
                <input style={inputStyle} placeholder="e.g. Module 1 Quiz" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Pass Score (%)</label>
                <input style={inputStyle} type="number" min={0} max={100} value={form.pass_score} onChange={e => setForm(f => ({ ...f, pass_score: Number(e.target.value) }))} />
              </div>
              <div>
                <label style={labelStyle}>Max Attempts</label>
                <input style={inputStyle} type="number" min={1} value={form.max_attempts} onChange={e => setForm(f => ({ ...f, max_attempts: Number(e.target.value) }))} />
              </div>
              <div>
                <label style={labelStyle}>Timer (minutes, optional)</label>
                <input style={inputStyle} type="number" min={1} placeholder="No limit" value={form.timer_mins} onChange={e => setForm(f => ({ ...f, timer_mins: e.target.value }))} />
              </div>
            </div>

            <hr style={{ margin: '0 0 24px', border: 'none', borderTop: '1px solid #e5e7eb' }} />

            {/* Questions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', margin: 0 }}>Questions ({form.questions.length})</p>
              <button onClick={addQuestion} style={{ fontSize: 13, padding: '6px 14px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', cursor: 'pointer', fontWeight: 600 }}>
                + Add Question
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {form.questions.map((q, qi) => (
                <div key={q.id} style={{ border: '1px solid #e5e7eb', borderRadius: 14, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#6b7280' }}>Q{qi + 1}</span>
                    {form.questions.length > 1 && (
                      <button onClick={() => removeQuestion(qi)} style={{ fontSize: 12, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                    )}
                  </div>

                  <input
                    style={{ ...inputStyle, marginBottom: 16 }}
                    placeholder="Question text..."
                    value={q.text}
                    onChange={e => setQ(qi, 'text', e.target.value)}
                  />

                  <p style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', margin: '0 0 10px', letterSpacing: 0.8 }}>OPTIONS — click radio to mark correct answer</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {q.options.map((opt, oi) => (
                      <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={q.correct_answer === opt && opt !== ''}
                          onChange={() => opt.trim() && setQ(qi, 'correct_answer', opt)}
                          style={{ accentColor: '#16a34a', width: 16, height: 16, cursor: 'pointer', flexShrink: 0 }}
                        />
                        <input
                          style={{
                            ...inputStyle,
                            flex: 1,
                            margin: 0,
                            borderColor: q.correct_answer === opt && opt !== '' ? '#86efac' : '#e5e7eb',
                            background: q.correct_answer === opt && opt !== '' ? '#f0fdf4' : '#fff',
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                          value={opt}
                          onChange={e => {
                            const newVal = e.target.value;
                            if (q.correct_answer === opt) setQ(qi, 'correct_answer', newVal);
                            setOption(qi, oi, newVal);
                          }}
                        />
                        {q.correct_answer === opt && opt !== '' && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', flexShrink: 0 }}>✓ Correct</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 28, justifyContent: 'flex-end' }}>
              <button onClick={closeModal} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                Cancel
              </button>
              <button onClick={() => handleSubmit(false)} disabled={saving} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                Save as Draft
              </button>
              <button onClick={() => handleSubmit(true)} disabled={saving} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: '#16a34a', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                {saving ? 'Saving…' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = { fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: '#6b7280', display: 'block', marginBottom: 6 };
const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fff' };
