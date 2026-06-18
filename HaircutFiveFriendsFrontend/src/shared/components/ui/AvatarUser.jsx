import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../../features/auth/store/authStore";
import defaultAvatarImg from "../../../assets/img/AvatarDefault.png";


export const AvatarUser = ({ dark = false, menuItems }) => {
    const { user, logout } = useAuthStore();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    const navigate = useNavigate();

    const toogleMenu = () => setOpen((prev) => !prev);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };

    const avatarSrc =
        (user?.profilePicture && user.profilePicture.trim() !== "") ? user.profilePicture :
        (user?.ProfilePicture && user.ProfilePicture.trim() !== "") ? user.ProfilePicture : defaultAvatarImg;

    const items = menuItems || DEFAULT_MENU_ITEMS;

    return (
        <div
            className="relative"
            ref={dropdownRef}>
            <img src={avatarSrc}
                alt={user?.name || 'Avatar'}
                className={`w-10 h-10 rounded-full object-cover cursor-pointer transition-all duration-200 ${dark
                    ? 'border border-[#00D2C4]/25 hover:border-[#00D2C4]/50 hover:shadow-[0_0_12px_rgba(0,210,196,0.2)]'
                    : 'border border-gray-200 hover:border-gray-300'
                    }`}
                onClick={toogleMenu}
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultAvatarImg;
                }}
            />

            {open && (
                <div className={`absolute right-0 mt-2 w-52 rounded-xl shadow-lg z-50 overflow-hidden ${dark
                    ? 'bg-[#141414] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
                    : 'bg-white border border-gray-200'
                    }`}>
                    <div className={`px-4 py-3 ${dark ? 'border-b border-white/5' : 'border-b border-gray-100'}`}>
                        <p className={`font-semibold truncate ${dark ? 'text-white text-sm' : 'text-gray-800'}`}>
                            {user?.name || 'Usuario'}
                        </p>
                        <p className={`truncate ${dark ? 'text-zinc-500 text-[11px]' : 'text-sm text-gray-500'}`}>
                            {user?.email}
                        </p>
                    </div>
                    <ul className={`p-2 text-sm font-medium ${dark ? 'text-zinc-300' : 'text-gray-700'}`}>
                        {items.map((item) => (
                            <li key={item.to}>
                                <Link
                                    to={item.to}
                                    onClick={() => setOpen(false)}
                                    className={`flex items-center gap-3 w-full p-2.5 rounded-lg transition-colors ${dark
                                        ? 'hover:bg-white/[0.05] hover:text-white'
                                        : 'hover:bg-gray-100'
                                        }`}
                                >
                                    {item.icon && <i className={`ti ${item.icon} text-base ${dark ? 'text-[#00D2C4]' : 'text-gray-400'}`} />}
                                    {item.label}
                                </Link>
                            </li>
                        ))}

                        <li>
                            <button
                                onClick={handleLogout}
                                className={`flex items-center gap-3 w-full text-left p-2.5 rounded-lg transition-colors cursor-pointer ${dark
                                    ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300 border-t border-white/5 mt-1 pt-3'
                                    : 'text-red-600 hover:bg-red-100'
                                    }`}
                            >
                                <i className="ti ti-logout text-base" />
                                Cerrar sesión
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};