import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../auth/store/authStore.js';

export const ProfileInfoForm = () => {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const onSave = async (data) => {
    setIsSaving(true);
    try {
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

  return (
    <form onSubmit={handleSubmit(onSave)} className="px-8">
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

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Correo electrónico
          </label>
          <div className="flex items-center gap-2 py-3">
            <span className="text-sm text-white">{user?.email || 'Sin email'}</span>
            {user?.isEmailVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-emerald-400 text-[10px] font-semibold">
              </span>
            )}
          </div>
        </div>

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
    </form>
  );
};
