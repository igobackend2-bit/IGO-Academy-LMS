import { useEffect, useState } from 'react';
import api from '@/services/api';

const ROLE_COLORS = { admin:'var(--navy)', trainer:'var(--green)', student:'#0E7490' };

export default function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('user'); // 'user' | 'trainer'
  const [form, setForm] = useState({ full_name:'', email:'', phone:'', role:'student', password:'' });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [viewUser, setViewUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetSaving, setResetSaving] = useState(false);
  const [resetError, setResetError]   = useState('');
  const [sendingResetEmail, setSendingResetEmail] = useState(false);

  const openAddUser = () => { setModalMode('user'); setForm({ full_name:'', email:'', phone:'', role:'student', password:'' }); setError(''); setShowModal(true); };
  const openAddTrainer = () => { setModalMode('trainer'); setForm({ full_name:'', email:'', phone:'', role:'trainer', password:'' }); setError(''); setShowModal(true); };

  const load = () => {
    setLoading(true);
    api.get('/users?limit=200')
      .then(r => { setUsers(r.data.data?.data || []); setLoading(false); })
      .catch(() => {
        // Auth failures redirect via the api interceptor — keep the loading
        // state up rather than flashing a false "no users" empty state.
      });
  };
  useEffect(load, []);

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const createUser = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await api.post('/users', form);
      setShowModal(false);
      setForm({ full_name:'', email:'', phone:'', role:'student', password:'' });
      load();
    } catch(err) { setError(err.response?.data?.message || 'Failed to create user'); }
    finally { setSaving(false); }
  };

  const deactivate = async (id) => {
    if (!confirm('Deactivate this user? They can still log in, but will lose access to course content until reactivated.')) return;
    await api.delete(`/users/${id}`).catch(()=>{});
    load();
  };

  const activate = async (id) => {
    await api.put(`/users/${id}`, { is_active: true }).catch(()=>{});
    load();
  };

  const permanentlyDelete = async (user) => {
    const typed = prompt(
      `This permanently deletes "${user.full_name}" and all their data (enrollments, certificates, submissions, etc.) — this cannot be undone.\n\nType DELETE to confirm.`
    );
    if (typed !== 'DELETE') return;
    try {
      await api.delete(`/users/${user.id}/permanent`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const forceLogout = async (id) => {
    await api.post(`/users/${id}/force-logout`).catch(()=>{});
    alert('User logged out.');
  };

  const openView = (user) => {
    setViewUser(user);
    setNewPassword('');
    setResetError('');
  };

  const sendResetEmail = async () => {
    setSendingResetEmail(true);
    try {
      await api.post('/auth/forgot-password', { email: viewUser.email });
      alert(`Password reset email sent to ${viewUser.email}.`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setSendingResetEmail(false);
    }
  };

  const setUserPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) { setResetError('Password must be at least 8 characters'); return; }
    setResetSaving(true); setResetError('');
    try {
      await api.post(`/users/${viewUser.id}/reset-password`, { new_password: newPassword });
      alert('Password updated successfully.');
      setNewPassword('');
    } catch (err) {
      setResetError(err.response?.data?.message || 'Failed to set new password');
    } finally {
      setResetSaving(false);
    }
  };

  return (
    <div className="page-enter" style={{minHeight:'100vh',background:'var(--gray-50)'}}>
      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#0C2014 0%,#16402B 100%)',padding:'2rem 2.5rem 3.5rem',color:'white',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-60px',right:'-60px',width:'200px',height:'200px',borderRadius:'50%',background:'rgba(141,198,63,0.08)',pointerEvents:'none'}} />
        <p style={{color:'rgba(141,198,63,0.9)',fontSize:'.75rem',fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',marginBottom:'.4rem'}}>Management</p>
        <h1 style={{fontSize:'1.75rem',fontWeight:800,marginBottom:'.35rem'}}>User Management</h1>
        <p style={{color:'rgba(255,255,255,0.6)',fontSize:'.875rem'}}>Manage students, trainers, and admins</p>
      </div>

      <div style={{padding:'0 2rem 2rem',marginTop:'-1.5rem'}}>
        {/* Toolbar */}
        <div style={{background:'white',borderRadius:'16px',padding:'1.25rem 1.5rem',border:'1px solid var(--gray-200)',boxShadow:'0 2px 12px rgba(13,38,25,.06)',marginBottom:'1.25rem',display:'flex',gap:'1rem',alignItems:'center',flexWrap:'wrap'}}>
          <input
            className="igo-input"
            style={{maxWidth:'300px'}}
            placeholder="🔍  Search by name or email…"
            value={search}
            onChange={e=>setSearch(e.target.value)}
          />
          <div style={{display:'flex',gap:'.6rem',marginLeft:'auto'}}>
            <button className="btn-outline btn-sm" style={{width:'auto'}} onClick={openAddTrainer}>
              + Add Trainer
            </button>
            <button className="btn-primary btn-sm" style={{width:'auto'}} onClick={openAddUser}>
              + Add User
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{background:'white',borderRadius:'16px',border:'1px solid var(--gray-200)',boxShadow:'0 2px 12px rgba(13,38,25,.06)',overflow:'hidden'}}>
          {loading ? (
            <div style={{padding:'3rem',textAlign:'center',color:'var(--gray-400)'}}>Loading users…</div>
          ) : (
            <div style={{overflowX:'auto'}}>
              <table className="igo-table">
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer'}} onClick={()=>openView(u)} title="View details">
                          <div style={{width:'36px',height:'36px',borderRadius:'10px',background:ROLE_COLORS[u.role]||'var(--navy)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:'.9rem',flexShrink:0}}>
                            {u.full_name?.[0]?.toUpperCase()}
                          </div>
                          <span style={{fontWeight:600,color:'var(--gray-800)',textDecoration:'underline',textDecorationColor:'transparent'}}>{u.full_name}</span>
                        </div>
                      </td>
                      <td style={{color:'var(--gray-600)'}}>{u.email}</td>
                      <td><span className={`badge badge-${u.role==='admin'?'navy':u.role==='trainer'?'green':'gold'}`}>{u.role}</span></td>
                      <td><span className={`badge ${u.is_active?'badge-green':'badge-error'}`}>{u.is_active?'Active':'Inactive'}</span></td>
                      <td style={{color:'var(--gray-400)',fontSize:'.82rem'}}>{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                      <td>
                        <div style={{display:'flex',gap:'6px'}}>
                          {u.is_active
                            ? <button className="btn-danger btn-sm" onClick={()=>deactivate(u.id)}>Deactivate</button>
                            : <button className="btn-primary btn-sm" onClick={()=>activate(u.id)}>Activate</button>}
                          <button className="btn-outline btn-sm" onClick={()=>forceLogout(u.id)}>Logout</button>
                          <button className="btn-danger btn-sm" onClick={()=>permanentlyDelete(u)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length===0 && (
                    <tr><td colSpan={6} style={{textAlign:'center',padding:'3rem',color:'var(--gray-400)'}}>No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal-box fade-in">
            <div className="modal-header">
              <h2>{modalMode==='trainer' ? 'Add New Trainer' : 'Add New User'}</h2>
              <button onClick={()=>setShowModal(false)} style={{background:'none',border:'none',fontSize:'1.2rem',cursor:'pointer',color:'var(--gray-400)'}}>✕</button>
            </div>
            <form onSubmit={createUser}>
              <div className="modal-body" style={{display:'flex',flexDirection:'column',gap:'.9rem'}}>
                {error && <div className="alert-error">{error}</div>}
                <div className="form-group" style={{margin:0}}>
                  <label className="form-label">Full Name</label>
                  <input className="igo-input" placeholder={modalMode==='trainer' ? 'Trainer Full Name' : 'Full Name'} value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})} required />
                </div>
                <div className="form-group" style={{margin:0}}>
                  <label className="form-label">Email</label>
                  <input className="igo-input" type="email" placeholder="email@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
                </div>
                <div className="form-group" style={{margin:0}}>
                  <label className="form-label">Phone</label>
                  <input className="igo-input" placeholder="+91 98765 43210" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
                </div>
                <div className="form-group" style={{margin:0}}>
                  <label className="form-label">Role</label>
                  <select className="igo-select" value={form.role} disabled={modalMode==='trainer'} onChange={e=>setForm({...form,role:e.target.value})}>
                    <option value="student">Student</option>
                    <option value="trainer">Trainer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group" style={{margin:0}}>
                  <label className="form-label">Password</label>
                  <input className="igo-input" type="password" placeholder="Temporary password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline btn-sm" style={{width:'auto'}} onClick={()=>setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary btn-sm" style={{width:'auto'}} disabled={saving}>{saving?'Creating…':'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User / Password Management Modal */}
      {viewUser && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setViewUser(null)}>
          <div className="modal-box fade-in">
            <div className="modal-header">
              <h2>User Details</h2>
              <button onClick={()=>setViewUser(null)} style={{background:'none',border:'none',fontSize:'1.2rem',cursor:'pointer',color:'var(--gray-400)'}}>✕</button>
            </div>
            <div className="modal-body" style={{display:'flex',flexDirection:'column',gap:'1.1rem'}}>

              {/* Profile summary */}
              <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{width:'48px',height:'48px',borderRadius:'12px',background:ROLE_COLORS[viewUser.role]||'var(--navy)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:'1.2rem',flexShrink:0}}>
                  {viewUser.full_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p style={{fontWeight:700,color:'var(--gray-800)',fontSize:'1rem'}}>{viewUser.full_name}</p>
                  <div style={{display:'flex',gap:'6px',marginTop:'4px'}}>
                    <span className={`badge badge-${viewUser.role==='admin'?'navy':viewUser.role==='trainer'?'green':'gold'}`}>{viewUser.role}</span>
                    <span className={`badge ${viewUser.is_active?'badge-green':'badge-error'}`}>{viewUser.is_active?'Active':'Inactive'}</span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div style={{display:'flex',flexDirection:'column',gap:'.5rem',fontSize:'.85rem'}}>
                <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'var(--gray-400)'}}>Email</span><span style={{fontWeight:600}}>{viewUser.email}</span></div>
                <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'var(--gray-400)'}}>Phone</span><span style={{fontWeight:600}}>{viewUser.phone || '—'}</span></div>
                <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'var(--gray-400)'}}>Joined</span><span style={{fontWeight:600}}>{new Date(viewUser.created_at).toLocaleDateString('en-IN')}</span></div>
                <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'var(--gray-400)'}}>Last login</span><span style={{fontWeight:600}}>{viewUser.last_login_at ? new Date(viewUser.last_login_at).toLocaleDateString('en-IN') : 'Never'}</span></div>
              </div>

              <hr style={{border:'none',borderTop:'1px solid var(--gray-200)',margin:0}} />

              {/* Send reset email */}
              <div>
                <label className="form-label">Password Reset</label>
                <p style={{color:'var(--gray-400)',fontSize:'.78rem',marginBottom:'.5rem'}}>Sends an OTP to {viewUser.email} so they can set their own new password.</p>
                <button type="button" className="btn-outline btn-sm" style={{width:'auto'}} disabled={sendingResetEmail} onClick={sendResetEmail}>
                  {sendingResetEmail ? 'Sending…' : 'Send Password Reset Email'}
                </button>
              </div>

              {/* Set password directly */}
              <form onSubmit={setUserPassword}>
                <label className="form-label">Set New Password Directly</label>
                {resetError && <div className="alert-error" style={{marginBottom:'.5rem'}}>{resetError}</div>}
                <div style={{display:'flex',gap:'.5rem'}}>
                  <input className="igo-input" type="password" placeholder="New password (min 8 chars)" value={newPassword} onChange={e=>setNewPassword(e.target.value)} style={{flex:1}} />
                  <button type="submit" className="btn-primary btn-sm" style={{width:'auto',whiteSpace:'nowrap'}} disabled={resetSaving}>
                    {resetSaving ? 'Saving…' : 'Set Password'}
                  </button>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-outline btn-sm" style={{width:'auto'}} onClick={()=>setViewUser(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
