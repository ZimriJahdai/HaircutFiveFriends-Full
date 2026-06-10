import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore.js';

export const UserProfile = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [name, setName] = useState(user?.name || '');

  const onSave = () => {
    updateUser({ name });
    toast.success('Perfil actualizado en sesión');
  };

  return (
    <div className="auth-card">
      <h2>Perfil</h2>
      <div className="profile-row">
        <strong>Nombre:</strong>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="profile-row">
        <strong>Email:</strong>
        <span>{user?.email || 'Sin email'}</span>
      </div>
      <div className="profile-row">
        <strong>Rol:</strong>
        <span>{user?.role || 'No disponible'}</span>
      </div>
      <div className="profile-actions">
        <button type="button" className="auth-button" onClick={onSave}>
          Guardar cambios
        </button>
        <button type="button" className="auth-button auth-button-secondary" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};
