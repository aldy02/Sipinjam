import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import PageHeader from '../components/PageHeader';
import EquipmentFormModal from '../components/EquipmentFormModal';
import { useAuth } from '../contexts/AuthContext';
import { getEquipmentList } from '../api/equipment';

const KONDISI_STYLE = {
  baik: 'text-[#1F9254]',
  'rusak ringan': 'text-[#CD6200]',
  'rusak berat': 'text-[#A30D11]',
};

const STATUS_STYLE = {
  tersedia: 'bg-green-50 text-[#1F9254]',
  dipinjam: 'bg-orange-50 text-[#CD6200]',
  maintenance: 'bg-red-50 text-[#A30D11]',
};

export default function DaftarBarang() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // modal: { mode: 'add' | 'edit' | 'delete', item: object|null } atau null kalau tertutup
  const [modal, setModal] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getEquipmentList({ search, page, limit: 10 });
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

  const handlePinjam = (item) => {
    window.location.href = `/form-peminjaman?equipment_id=${item.equipment_id}`;
  };

  return (
    <MainLayout>
      <PageHeader breadcrumb="Sipinjam / Daftar Barang" title="Daftar Barang" />

      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[#2B3674] mb-4">
            {isAdmin ? 'Kelola Data Barang' : 'Barang Tersedia Untuk Dipinjam'}
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8789C0]" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                placeholder="Cari berdasarkan nama barang..."
                className="w-full pl-10 pr-4 py-2.5 placeholder-[#8789C0] text-[#2B3674] border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399]"
              />
            </div>

            {isAdmin && (
              <button
                onClick={() => setModal({ mode: 'add', item: null })}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F75807] hover:bg-[#e04e05] text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
              >
                <Plus size={18} />
                Tambah Barang
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-[#A3AED0] text-sm">Memuat data...</div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-[#A3AED0] text-sm">Tidak ada barang ditemukan</div>
        ) : (
          <>
            {/* Desktop / tablet: table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#A3AED0] border-b border-gray-100">
                    <th className="pb-3 font-medium">Kode barang</th>
                    <th className="pb-3 font-medium">Nama Barang</th>
                    <th className="pb-3 font-medium">Kondisi</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.equipment_id} className="border-b border-gray-50 last:border-0">
                      <td className="py-4 font-medium text-[#2B3674]">{item.kode_barang}</td>
                      <td className="py-4 font-medium text-[#2B3674]">{item.nama}</td>
                      <td className={`py-4 font-medium capitalize ${KONDISI_STYLE[item.kondisi] || 'text-gray-500'}`}>
                        {item.kondisi}
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLE[item.status] || 'bg-gray-50 text-gray-500'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {isAdmin ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setModal({ mode: 'edit', item })}
                              className="p-2 rounded-lg text-[#003399] hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => setModal({ mode: 'delete', item })}
                              className="p-2 rounded-lg text-[#A30D11] hover:bg-red-50 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePinjam(item)}
                            disabled={item.status !== 'tersedia'}
                            className="px-4 py-2 bg-[#F75807] hover:bg-[#e04e05] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            Pinjam
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: card list */}
            <div className="md:hidden flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.equipment_id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-[#2B3674]">{item.nama}</p>
                      <p className="text-xs text-[#8789C0]">{item.kode_barang}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize shrink-0 ${STATUS_STYLE[item.status] || 'bg-gray-50 text-gray-500'}`}>
                      {item.status}
                    </span>
                  </div>

                  <p className={`text-sm font-medium capitalize mb-3 ${KONDISI_STYLE[item.kondisi] || 'text-gray-500'}`}>
                    Kondisi: {item.kondisi}
                  </p>

                  <div className="border-t border-gray-100 mb-4 mt-4" />

                  {isAdmin ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModal({ mode: 'edit', item })}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 text-[#003399] text-xs font-semibold hover:bg-blue-50 transition-colors"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => setModal({ mode: 'delete', item })}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 text-[#A30D11] text-xs font-semibold hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePinjam(item)}
                      disabled={item.status !== 'tersedia'}
                      className="w-full py-2.5 bg-[#F75807] hover:bg-[#e04e05] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      Pinjam
                    </button>
                  )}
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
                className={`w-8 h-8 rounded-lg font-medium ${p === page ? 'bg-[#003399] text-white' : 'text-gray-500 hover:bg-gray-50'
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

      <EquipmentFormModal
        isOpen={!!modal}
        mode={modal?.mode}
        initialData={modal?.item}
        onClose={() => setModal(null)}
        onSuccess={fetchData}
      />
    </MainLayout>
  );
}
