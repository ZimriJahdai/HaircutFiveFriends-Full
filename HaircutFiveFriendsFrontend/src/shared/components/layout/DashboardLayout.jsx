import { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const mainRef = useRef(null);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    let timer;
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => window.dispatchEvent(new Event('resize')), 350);
    });
    observer.observe(el);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0A0A0A', overflow: 'hidden' }}>
      <Sidebar collapsed={collapsed} />
      <div ref={mainRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        <Navbar onToggleSidebar={() => setCollapsed((c) => !c)} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem', overflowX: 'hidden' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
