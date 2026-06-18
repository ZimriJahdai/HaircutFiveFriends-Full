import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuth, getAuth } from '../utils/authStorage.js';

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

// Deriva identidad de forma defensiva: el payload de login puede variar de forma.
const readIdentity = () => {
  const auth = getAuth();
  const user = auth?.user ?? auth ?? {};
  const email = user.email ?? auth?.email ?? '';
  const name =
    user.name ?? user.fullName ?? user.username ?? (email ? email.split('@')[0] : 'Usuario');
  const initials = name.trim().slice(0, 2).toUpperCase() || 'AG';
  return { email, name, initials };
};

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { email, name, initials } = useMemo(readIdentity, [open]);

  // Cierra al hacer click fuera o con Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleLogout = () => {
    clearAuth();
    setOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <div className="user-menu" ref={containerRef}>
      <button
        type="button"
        className="avatar"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu de usuario"
        onClick={() => setOpen((value) => !value)}
      >
        {initials}
      </button>

      {open && (
        <div className="user-menu-panel" role="menu">
          <div className="user-menu-id">
            <span className="user-menu-name">{name}</span>
            {email && <span className="user-menu-mail">{email}</span>}
          </div>
          <button type="button" className="user-menu-item" role="menuitem" onClick={handleLogout}>
            <LogoutIcon />
            Cerrar sesion
          </button>
        </div>
      )}
    </div>
  );
}
