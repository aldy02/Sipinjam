import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FileText,
  ClipboardList,
  UserCircle,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logoPupukKaltim from '../assets/Logo.png';

const getMenuItems = (role) => {
  const items = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { label: 'Daftar Barang', icon: <Package size={20} />, path: '/daftar-barang' },
    { label: 'Form Peminjaman Barang', icon: <FileText size={20} />, path: '/form-peminjaman', hideFor: ['admin'] },
    { label: 'Daftar Peminjaman Barang', icon: <ClipboardList size={20} />, path: '/daftar-peminjaman', hideFor: ['karyawan'] },
    { label: 'Aktivitas Saya', icon: <UserCircle size={20} />, path: '/aktivitas-saya', hideFor: ['admin'] },
    { label: 'Pengaturan', icon: <Settings size={20} />, path: '/pengaturan' },
  ];

  return items.filter((item) => !item.hideFor?.includes(role));
};

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = user?.nama
    ? user.nama.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '--';

  const menuItems = getMenuItems(user?.role);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
      )}

      <div
        className={`
          fixed top-0 left-0 h-full w-64 z-50 bg-white
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <aside className="w-64 h-full flex flex-col shadow-[2px_0_20px_rgba(0,0,0,0.06)]">
          {/* Logo */}
          <div className="px-6 pt-7 pb-6 border-b border-slate-100">
            <img src={logoPupukKaltim} alt="Pupuk Kaltim" className="h-9 w-auto" />
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3.5 w-full px-4 py-3 rounded-xl text-sm font-medium
                    transition-colors duration-150
                    ${isActive
                      ? 'bg-[#E8EDFB]/70 text-[#003399]'
                      : 'text-[#8789C0] hover:bg-slate-50 hover:text-[#003399]'
                    }
                  `}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-4 pb-5 pt-3 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3.5 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} className="shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}