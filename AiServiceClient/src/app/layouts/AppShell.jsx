import { Outlet } from 'react-router-dom';
import SidebarNav from '../components/SidebarNav.jsx';

export default function AppShell() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">TG</div>
          <div>
            <div className="brand-title">TodoGemini</div>
            <div className="brand-subtitle">AI Suite</div>
          </div>
        </div>

        <SidebarNav />

        <div className="sidebar-foot">
          <div className="status-pill">API: local</div>
          <div className="status-pill accent">Gemini ready</div>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div>
            <div className="eyebrow">HaircutFiveFriends</div>
            <div className="topbar-title">Plataforma IA</div>
          </div>
          <div className="topbar-actions">
            <button className="ghost-button" type="button">Nueva sesion</button>
            <div className="avatar">AG</div>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
