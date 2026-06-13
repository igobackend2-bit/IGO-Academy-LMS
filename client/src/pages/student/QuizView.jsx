import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/services/api';
import toast from 'react-hot-toast';
export default function StudentQuizView() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const { data: assessment, isLoading } = useQuery({
    queryKey:['quiz',assessmentId],
    queryFn:()=>api.get(`/assessments/${assessmentId}`).then(r=>r.data.data),
  });
  const { data: existing } = useQuery({
    queryKey:['my-submission',assessmentId],
    queryFn:()=>api.get(`/assessments/${assessmentId}/my-submission`).then(r=>r.data.data),
  });

  useEffect(() => {
    if (assessment?.timer_mins && !submitted) {
      setTimeLeft(assessment.timer_mins * 60);
      const t = setInterval(() => setTimeLeft(p => {
        if (p <= 1) { clearInterval(t); handleSubmit(); return 0; }
        return p - 1;
      }), 1000);
      return () => clearInterval(t);
    }
  }, [assessment]);

  const submitMutation = useMutation({
    mutationFn: (payload) => api.post(`/assessments/${assessmentId}/submit`, payload),
    onSuccess: (res) => { setResult(res.data.data); setSubmitted(true); toast.success('Submitted!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Submission failed'),
  });

  const handleSubmit = () => {
    const payload = { answers: Object.entries(answers).map(([question_id, selected_answer]) => ({ question_id, selected_answer })) };
    submitMutation.mutate(payload);
  };

  const formatTime = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  if (isLoading) return <div className="p-8 text-gray-400">Loading quiz…</div>;
  if (existing) return (
    <div className="p-8 max-w-2xl">
      <div className="igo-card text-center py-12">
        <p className="text-5xl mb-4">✅</p>
        <h2 className="text-xl font-black text-igo-navy mb-2">Already Submitted</h2>
        {existing.score !== null && <p className="text-3xl font-black text-igo-green">{existing.score}/{assessment?.max_score}</p>}
        {existing.feedback && <p className="mt-4 text-gray-600">{existing.feedback}</p>}
      </div>
    </div>
  );

  if (submitted && result) return (
    <div className="p-8 max-w-2xl">
      <div className="igo-card text-center py-12">
        <p className="text-5xl mb-4">🎉</p>
        <h2 className="text-xl font-black text-igo-navy mb-4">Quiz Submitted!</h2>
        {result.score !== null && <div><p className="text-gray-500 mb-2">Your Score</p><p className="text-4xl font-black text-igo-green">{result.score}/{assessment?.max_score}</p></div>}
        <button onClick={() => navigate(-1)} className="btn-outline mt-6">← Back to Assessments</button>
      </div>
    </div>
  );

  const questions = assessment?.questions || [];
  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black text-igo-navy">{assessment?.title}</h1>
        {timeLeft !== null && <span className={`font-mono font-bold text-lg ${timeLeft < 60 ? 'text-red-500' : 'text-igo-navy'}`}>⏱ {formatTime(timeLeft)}</span>}
      </div>
      <div className="space-y-6">
        {questions.map((q, i) => (
          <div key={q.id} className="igo-card">
            <p className="font-semibold text-igo-navy mb-4">{i+1}. {q.text}</p>
            <div className="space-y-2">
              {(q.options || []).map((opt, oi) => (
                <label key={oi} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors
                  ${answers[q.id] === opt ? 'border-igo-green bg-igo-green-light' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name={q.id} value={opt} checked={answers[q.id] === opt}
                    onChange={() => setAnswers({...answers, [q.id]: opt})} className="accent-igo-green" />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex gap-4">
        <button onClick={handleSubmit} disabled={submitMutation.isPending} className="btn-primary">
          {submitMutation.isPending ? 'Submitting…' : 'Submit Quiz'}
        </button>
        <button onClick={() => navigate(-1)} className="btn-outline">Cancel</button>
      </div>
    </div>
  );
}
