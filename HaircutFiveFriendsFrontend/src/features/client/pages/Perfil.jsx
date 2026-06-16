import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore.js';
import { authService } from '../../../shared/api/auth.js';
import NavbarClient from '../components/NavbarClient.jsx';
import defaultAvatarImg from '../../../assets/img/AvatarDefault.png';

export const Perfil = () => {
  const { user, token, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  });

  const avatarSrc =
    user?.profilePicture && user.profilePicture.trim() !== ''
      ? user.profilePicture
      : (user?.ProfilePicture && user.ProfilePicture.trim() !== ''
        ? user.ProfilePicture
        : defaultAvatarImg);

  const onSave = async (data) => {
    setIsSaving(true);
    try {
      // Update locally for now — backend update-profile endpoint can be wired later
      updateUser({ name: data.name, phone: data.phone });
      toast.success('Perfil actualizado correctamente');
      setIsEditing(false);
    } catch {
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const onCancel = () => {
    reset({ name: user?.name || '', phone: user?.phone || '' });
    setIsEditing(false);
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 5MB');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      // Preview the image locally
      const reader = new FileReader();
      reader.onload = () => {
        updateUser({ profilePicture: reader.result, ProfilePicture: reader.result });
        toast.success('Foto de perfil actualizada');
        setIsUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error('Error al subir la foto');
      setIsUploadingPhoto(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const roleLabelMap = {
    USER_ROLE: 'Cliente',
    ADMIN_ROLE: 'Administrador',
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No disponible';
    try {
      return new Date(dateStr).toLocaleDateString('es-GT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'No disponible';
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans">
      <NavbarClient />

      <main className="flex-1 max-w-[900px] w-full mx-auto px-6 py-6">
        {/* Page Header */}
        <div className="mb-4">
          <h1 className="font-['Bebas_Neue',sans-serif] text-4xl md:text-5xl tracking-[3px] leading-none text-white">
            MI <span className="text-[#00D2C4]">PERFIL</span>
          </h1>
        </div>

        {/* Profile Card */}
        <div className="bg-[#111111] border border-white/[0.06] rounded-2xl overflow-hidden">
          {/* Cover / Avatar section */}
          <div className="relative h-36 bg-gradient-to-r from-[#00D2C4]/20 via-[#00D2C4]/5 to-transparent">
            <div className="absolute -bottom-12 left-8">
              <div className="relative group">
                <img
                  src={avatarSrc}
                  alt={user?.name || 'Avatar'}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-[#111111] shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultAvatarImg;
                  }}
                />
                <button
                  type="button"
                  onClick={handlePhotoClick}
                  disabled={isUploadingPhoto}
                  className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 cursor-pointer"
                >
                  <i className={`ti ${isUploadingPhoto ? 'ti-loader-2 animate-spin' : 'ti-camera'} text-white text-xl`} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-[3px] border-[#111111] rounded-full" />
              </div>
            </div>
          </div>

          {/* User Identity */}
          <div className="pt-16 px-8 pb-2">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-wide">
                  {user?.name || 'Usuario'}
                </h2>
                <p className="text-zinc-500 text-sm mt-0.5">{user?.email || 'Sin email'}</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-8 my-4 h-px bg-white/[0.06]" />

          {/* Info Form */}
          <form onSubmit={handleSubmit(onSave)} className="px-8 pb-8">
            {/* Section: Personal Info */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#00D2C4]/10 flex items-center justify-center">
                <i className="ti ti-user text-[#00D2C4] text-base" />
              </div>
              <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">
                Información Personal
              </h3>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="ml-auto flex items-center gap-1.5 text-[#00D2C4] text-xs font-semibold hover:text-[#00E8D8] transition-colors cursor-pointer"
                >
                  <i className="ti ti-pencil text-sm" />
                  Editar
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Nombre completo
                </label>
                {isEditing ? (
                  <>
                    <input
                      {...register('name', {
                        required: 'El nombre es obligatorio',
                        minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                        maxLength: { value: 100, message: 'Máximo 100 caracteres' },
                      })}
                      className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#00D2C4] focus:ring-1 focus:ring-[#00D2C4]/30 transition-all duration-200"
                      placeholder="Tu nombre completo"
                    />
                    {errors.name && (
                      <span className="text-red-400 text-[11px]">{errors.name.message}</span>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-white py-3">
                    {user?.name || 'No disponible'}
                  </span>
                )}
              </div>

              {/* Email (always read-only) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Correo electrónico
                </label>
                <div className="flex items-center gap-2 py-3">
                  <span className="text-sm text-white">{user?.email || 'Sin email'}</span>
                  {user?.isEmailVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md  text-emerald-400 text-[10px] font-semibold">
                    </span>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Teléfono
                </label>
                {isEditing ? (
                  <>
                    <input
                      {...register('phone', {
                        pattern: {
                          value: /^\d{8}$/,
                          message: 'El teléfono debe tener exactamente 8 dígitos',
                        },
                      })}
                      className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#00D2C4] focus:ring-1 focus:ring-[#00D2C4]/30 transition-all duration-200"
                      placeholder="12345678"
                      maxLength={8}
                    />
                    {errors.phone && (
                      <span className="text-red-400 text-[11px]">{errors.phone.message}</span>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-white py-3">
                    {user?.phone ? `+502 ${user.phone}` : 'No registrado'}
                  </span>
                )}
              </div>
            </div>

            {/* Edit Actions */}
            {isEditing && (
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-white/[0.06]">
                <button
                  type="submit"
                  disabled={isSaving || !isDirty}
                  className="flex items-center gap-2 bg-[#00D2C4] hover:bg-[#00B4A8] disabled:opacity-40 disabled:cursor-not-allowed text-[#0A0A0A] font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 shadow-[0_4px_16px_rgba(0,210,196,0.2)] hover:shadow-[0_6px_24px_rgba(0,210,196,0.35)] cursor-pointer"
                >
                  {isSaving ? (
                    <i className="ti ti-loader-2 animate-spin text-base" />
                  ) : (
                    <i className="ti ti-check text-base" />
                  )}
                  {isSaving ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex items-center gap-2 bg-transparent hover:bg-white/[0.05] text-zinc-400 hover:text-white border border-white/10 font-medium text-sm px-5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
                >
                  <i className="ti ti-x text-base" />
                  Cancelar
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="my-8 h-px bg-white/[0.06]" />

            {/* Quick Actions */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#00D2C4]/10 flex items-center justify-center">
                <i className="ti ti-bolt text-[#00D2C4] text-base" />
              </div>
              <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">
                Acciones Rápidas
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Change Password */}
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="group flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#00D2C4]/30 hover:bg-[#00D2C4]/[0.04] transition-all duration-300 cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                  <i className="ti ti-key text-amber-400 text-lg" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Cambiar contraseña</p>
                  <p className="text-[11px] text-zinc-500">Actualiza tu clave de acceso</p>
                </div>
              </button>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="group flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-red-500/30 hover:bg-red-500/[0.04] transition-all duration-300 cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                  <i className="ti ti-logout text-red-400 text-lg" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Cerrar sesión</p>
                  <p className="text-[11px] text-zinc-500">Salir de tu cuenta</p>
                </div>
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <PasswordChangeModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
};


/* ─── Password Change Modal ─── */
const PasswordChangeModal = ({ onClose }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [isSaving, setIsSaving] = useState(false);
  const user = useAuthStore((s) => s.user);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      await authService.forgotPassword(user?.email);
      toast.success('Se ha enviado un enlace de restablecimiento a tu correo');
      onClose();
    } catch {
      toast.error('Error al enviar el enlace de restablecimiento');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-[#111111] border border-white/[0.08] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.6)] animate-[fadeIn_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <i className="ti ti-key text-amber-400 text-lg" />
            </div>
            <h3 className="text-base font-bold text-white">Cambiar Contraseña</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/[0.05] flex items-center justify-center text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            <i className="ti ti-x text-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-zinc-400 mb-5">
            Se enviará un enlace de restablecimiento de contraseña a tu correo electrónico{' '}
            <span className="text-[#00D2C4] font-medium">{user?.email}</span>.
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 bg-[#00D2C4] hover:bg-[#00B4A8] disabled:opacity-40 text-[#0A0A0A] font-semibold text-sm px-5 py-3 rounded-xl transition-all duration-200 cursor-pointer"
            >
              {isSaving ? (
                <i className="ti ti-loader-2 animate-spin text-base" />
              ) : (
                <i className="ti ti-mail text-base" />
              )}
              {isSaving ? 'Enviando...' : 'Enviar enlace'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center gap-2 bg-transparent hover:bg-white/[0.05] text-zinc-400 hover:text-white border border-white/10 font-medium text-sm px-5 py-3 rounded-xl transition-all duration-200 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
