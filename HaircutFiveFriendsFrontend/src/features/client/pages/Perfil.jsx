import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore.js';
import NavbarClient from '../components/NavbarClient.jsx';
import { PasswordChangeModal } from '../components/PasswordChangeModal.jsx';
import { ProfileAvatar } from '../components/ProfileAvatar.jsx';
import { ProfileInfoForm } from '../components/ProfileInfoForm.jsx';
import { ProfileQuickActions } from '../components/ProfileQuickActions.jsx';
import defaultAvatarImg from '../../../assets/img/defaultAvatarImg.png';

export const Perfil = () => {
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const avatarSrc =
    previewAvatar ||
    (user?.profilePicture && user.profilePicture.trim() !== ''
      ? user.profilePicture
      : (user?.ProfilePicture && user.ProfilePicture.trim() !== ''
        ? user.ProfilePicture
        : defaultAvatarImg));

  const handleAvatarChange = (dataUrl) => {
    setPreviewAvatar(dataUrl);
    // Remove local updateUser here so it requires hitting 'Save'
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const isAdmin = user?.role === 'ADMIN_ROLE' || user?.role === 'EMPLOYEE_ROLE';

  return (
    <div className={`${!isAdmin ? 'min-h-screen' : 'h-full'} bg-[#0A0A0A] text-white flex flex-col font-sans`}>
      {!isAdmin && <NavbarClient />}

      <main className={`flex-1 max-w-[900px] w-full mx-auto ${!isAdmin ? 'px-6 py-6' : 'pb-6'}`}>
        <div className="mb-4">
          <h1 className="font-['Bebas_Neue',sans-serif] text-4xl md:text-5xl tracking-[3px] leading-none text-white">
            MI <span className="text-[#00D2C4]">PERFIL</span>
          </h1>
        </div>

        <div className="bg-[#111111] border border-white/[0.06] rounded-2xl overflow-hidden">
          <ProfileAvatar
            avatarSrc={avatarSrc}
            defaultAvatarImg={defaultAvatarImg}
            onAvatarChange={handleAvatarChange}
            isEditing={isEditing}
          />

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

          <div className="mx-8 my-4 h-px bg-white/[0.06]" />

          <ProfileInfoForm 
            isEditing={isEditing} 
            setIsEditing={setIsEditing} 
            previewAvatar={previewAvatar}
            setPreviewAvatar={setPreviewAvatar}
          />

          <div className="mx-8 my-8 h-px bg-white/[0.06]" />

          <div className="px-8 pb-8">
            <ProfileQuickActions
              onOpenPasswordModal={() => setShowPasswordModal(true)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </main>

      {showPasswordModal && (
        <PasswordChangeModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
};
