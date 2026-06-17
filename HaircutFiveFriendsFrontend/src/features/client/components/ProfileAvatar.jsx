import { useState, useRef } from 'react';
import toast from 'react-hot-toast';

export const ProfileAvatar = ({ avatarSrc, defaultAvatarImg, onAvatarChange }) => {
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 5MB');
      e.target.value = '';
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Error al leer el archivo'));
        reader.readAsDataURL(file);
      });

      onAvatarChange(dataUrl);
    } catch {
      toast.error('Error al subir la foto');
    } finally {
      e.target.value = '';
      setIsUploadingPhoto(false);
    }
  };

  return (
    <div className="relative h-36 bg-gradient-to-r from-[#00D2C4]/20 via-[#00D2C4]/5 to-transparent">
      <div className="absolute -bottom-12 left-8">
        <div className="relative group">
          <img
            src={avatarSrc}
            alt="Avatar"
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
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-[3px] border-[#111111] rounded-full" />
        </div>
      </div>
    </div>
  );
};
