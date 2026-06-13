import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AdminLayout() {
  return (
    <div style={{display:'flex',minHeight:'100vh',background:'var(--gray-50)'}}>
      <Sidebar />
      <main style={{flex:1,minWidth:0,overflowX:'hidden'}}>
        <Outlet />
      </main>
    </div>
  );
}
