import { useAuth } from '../contexts/AuthContext';

export default function PageHeader({ breadcrumb, title }) {
  const { user } = useAuth();

  const initials = user?.nama
    ? user.nama.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '--';

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <p className="text-sm text-[#8789C0] mb-1">{breadcrumb}</p>
        <h1 className="text-3xl font-bold text-[#38437C]">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#003399] text-white flex items-center justify-center font-semibold">
          {initials}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-bold text-[#38437C]">{user?.nama}</p>
          <p className="text-xs text-[#8789C0]">{user?.npk || user?.email}</p>
        </div>
      </div>
    </div>
  );
}