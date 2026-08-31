import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Pencil, KeyRound, UserX, UserCheck } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import PageHeader from '../components/PageHeader';
import UserFormModal from '../components/UserFormModal';
import ResetPasswordModal from '../components/ResetPasswordModal';
import { getUserList, activateUser } from '../api/users';

const ROLE_STYLE = {
  admin: 'bg-blue-50 text-[#003399]',
  karyawan: 'bg-gray-50 text-gray-500',
};

const STATUS_STYLE = {
  true: 'bg-green-50 text-[#1F9254]',
  false: 'bg-red-50 text-red-600',
};

const formatTanggal = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export default function KelolaAkun() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(null); // ( Mode: Add, Edit, Delete Item )
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [activatingId, setActivatingId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getUserList({ search, page, limit: 10 });
      setItems(res.data.data);
      setTotalPages(res.data.pagination.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const timeout = setTimeout(fetchData, 350);
    return () => clearTimeout(timeout);
  }, [fetchData]);

  const handleActivate = async (item) => {
    try {
      setActivatingId(item.user_id);
      await activateUser(item.user_id);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActivatingId(null);
    }
  };

  return (
    <MainLayout>
      <PageHeader breadcrumb="Sipinjam / Kelola Akun" title="Kelola Akun" />

      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[#2B3674] mb-4">Daftar Akun Pengguna</h2>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative w-full sm:w-[26rem]">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8789C0]" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                placeholder="Cari berdasarkan nama, email, atau NOK..."
                className="w-full pl-10 pr-4 py-2.5 placeholder-[#8789C0] text-[#2B3674] border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399]"
              />
            </div>

            <button
              onClick={() => setModal({ mode: 'add', item: null })}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#F75807] hover:bg-[#e04e05] text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus size={18} />
              Tambah Akun
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-[#A3AED0] text-sm">Memuat data...</div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-[#A3AED0] text-sm">Tidak ada akun ditemukan</div>
        ) : (
          <>
            {/* Desktop / tablet: table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#A3AED0] border-b border-gray-100">
                    <th className="pb-3 font-medium">Nama</th>
                    <th className="pb-3 font-medium">NOK</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Jabatan</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.user_id} className="border-b border-gray-50 last:border-0">
                      <td className="py-4 font-medium text-[#2B3674]">{item.nama}</td>
                      <td className="py-4 text-[#2B3674]">{item.nok}</td>
                      <td className="py-4 text-[#2B3674]">{item.email}</td>
                      <td className="py-4 text-[#2B3674]">{item.jabatan || '-'}</td>
                      <td className="py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            ROLE_STYLE[item.role] || 'bg-gray-50 text-gray-500'
                          }`}
                        >
                          {item.role}
                        </span>
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[item.is_active]}`}
                        >
                          {item.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setResetPasswordUser(item)}
                            className="p-2 rounded-lg text-[#CD6200] hover:bg-orange-50 transition-colors"
                            title="Reset Password"
                          >
                            <KeyRound size={16} />
                          </button>
                          <button
                            onClick={() => setModal({ mode: 'edit', item })}
                            className="p-2 rounded-lg text-[#003399] hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          {item.is_active ? (
                            <button
                              onClick={() => setModal({ mode: 'deactivate', item })}
                              className="p-2 rounded-lg text-[#A30D11] hover:bg-red-50 transition-colors"
                              title="Nonaktifkan"
                            >
                              <UserX size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(item)}
                              disabled={activatingId === item.user_id}
                              className="p-2 rounded-lg text-[#1F9254] hover:bg-green-50 transition-colors disabled:opacity-50"
                              title="Aktifkan"
                            >
                              <UserCheck size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: card list */}
            <div className="md:hidden flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.user_id} className="border border-gray-100 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <p className="font-bold text-[#2B3674]">{item.nama}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          ROLE_STYLE[item.role] || 'bg-gray-50 text-gray-500'
                        }`}
                      >
                        {item.role}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[item.is_active]}`}
                      >
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#8789C0] mb-4 break-all">{item.email}</p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-[#5B69B9] shrink-0">NOK</span>
                      <span className="text-sm font-semibold text-[#2B3674] text-right">{item.nok}</span>
                    </div>
                    <div>
                      <span className="text-sm text-[#5B69B9] block mb-0.5">Jabatan</span>
                      <span className="text-sm font-semibold text-[#2B3674] block">{item.jabatan || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-[#5B69B9] shrink-0">Terdaftar</span>
                      <span className="text-sm font-semibold text-[#2B3674] text-right">
                        {formatTanggal(item.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setResetPasswordUser(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 text-[#CD6200] text-xs font-semibold hover:bg-orange-50 transition-colors"
                    >
                      <KeyRound size={14} />
                      Reset
                    </button>
                    <button
                      onClick={() => setModal({ mode: 'edit', item })}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 text-[#003399] text-xs font-semibold hover:bg-blue-50 transition-colors"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                    {item.is_active ? (
                      <button
                        onClick={() => setModal({ mode: 'deactivate', item })}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 text-[#A30D11] text-xs font-semibold hover:bg-red-50 transition-colors"
                      >
                        <UserX size={14} />
                        Nonaktifkan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(item)}
                        disabled={activatingId === item.user_id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 text-[#1F9254] text-xs font-semibold hover:bg-green-50 transition-colors disabled:opacity-50"
                      >
                        <UserCheck size={14} />
                        Aktifkan
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 text-sm">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-gray-400 disabled:opacity-40"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg font-medium ${
                  p === page ? 'bg-[#003399] text-white' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-gray-400 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <UserFormModal
        isOpen={!!modal}
        mode={modal?.mode}
        initialData={modal?.item}
        onClose={() => setModal(null)}
        onSuccess={fetchData}
      />

      <ResetPasswordModal
        isOpen={!!resetPasswordUser}
        user={resetPasswordUser}
        onClose={() => setResetPasswordUser(null)}
        onSuccess={fetchData}
      />
    </MainLayout>
  );
}