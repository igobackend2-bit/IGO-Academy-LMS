import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
export default function TrainerDashboard() {
  const { user } = useAuth();
  const { data: courses } = useQuery({ queryKey:['courses'], queryFn:()=>api.get('/courses').then(r=>r.data.data) });
  const myCourses = courses?.filter(c=>c.trainer_id===user?.id);
  return (
    <div className="p-8">
      <h1 className="text-2xl font-black text-igo-navy mb-2">Trainer Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Welcome, {user?.full_name}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myCourses?.map(c=>(
          <Link key={c.id} to={`/trainer/course/${c.id}`} className="igo-card hover:border-igo-green border-2 border-transparent">
            <h3 className="font-bold text-igo-navy mb-2">{c.title}</h3>
            <p className="text-sm text-gray-500">{c.duration_hours}h · {c.is_active ? 'Active' : 'Inactive'}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
