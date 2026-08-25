import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import PageHeader from '../components/PageHeader';
import DetailPeminjamanModal from '../components/DetailPeminjamanModal';
import { getPeminjamanList } from '../api/peminjaman';

const STATUS_STYLE = {
  dipinjam: 'bg-orange-50 text-[#CD6200]',
  dikembalikan: 'bg-green-50 text-[#1F9254]',
};

const formatTanggal = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export default function DaftarPeminjaman() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPeminjamanList({ page, limit: 10 });
      setItems(res.data.data);
      setTotalPages(res.data.pagination.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredItems = items.filter((item) => {
    if (!search.trim()) return true;
    const keyword = search.toLowerCase();
    return (
      item.kode_peminjaman?.toLowerCase().includes(keyword) ||
      item.User?.nama?.toLowerCase().includes(keyword) ||
      item.Equipment?.nama?.toLowerCase().includes(keyword)
    );
  });

  return (
    <MainLayout>
      <PageHeader breadcrumb="Sipinjam / Daftar Pinjam Barang" title="Daftar Pinjam Barang" />

      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[#2B3674] mb-4">Riwayat Peminjaman Barang</h2>

          <div className="relative w-full sm:w-96">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8789C0]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan kode, nama peminjam, atau barang..."
              className="w-full pl-10 pr-4 py-2.5 placeholder-[#8789C0] text-[#38437C] border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399]"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-[#A3AED0] text-sm">Memuat data...</div>
        ) : filteredItems.length === 0 ? (
          <div className="py-8 text-center text-[#A3AED0] text-sm">Tidak ada data peminjaman ditemukan</div>
        ) : (
          <>
            {/* Desktop / tablet: table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#A3AED0] border-b border-gray-100">
                    <th className="pb-3 font-medium">Kode Peminjaman</th>
                    <th className="pb-3 font-medium">Peminjam</th>
                    <th className="pb-3 font-medium">Barang</th>
                    <th className="pb-3 font-medium">Tanggal Pinjam</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.peminjaman_id} className="border-b border-gray-50 last:border-0">
                      <td className="py-4 font-medium text-[#2B3674]">{item.kode_peminjaman}</td>
                      <td className="py-4 font-medium text-[#2B3674]">{item.User?.nama}</td>
                      <td className="py-4 font-medium text-[#2B3674]">{item.Equipment?.nama}</td>
                      <td className="py-4 font-medium text-[#2B3674]">{formatTanggal(item.tanggal_pinjam)}</td>
                      <td className="py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            STATUS_STYLE[item.status] || 'bg-gray-50 text-gray-500'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="px-4 py-2 bg-[#F75807] hover:bg-[#e04e05] text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: card list */}
            <div className="md:hidden flex flex-col gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.peminjaman_id}
                  className="border border-gray-100 rounded-2xl p-5 shadow-sm"
                >
                  {/* Header: kode peminjaman + status badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="font-bold text-[#2B3674] text-base leading-tight">
                        {item.kode_peminjaman}
                      </p>
                      <p className="text-xs text-[#8789C0] mt-0.5">{item.Equipment?.kode_barang}</p>
                    </div>
                    <span
                      className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        STATUS_STYLE[item.status] || 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Detail rows */}
                  <div className="flex flex-col gap-2.5 mb-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#8789C0]">Peminjam</span>
                      <span className="font-semibold text-[#2B3674]">{item.User?.nama || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#8789C0]">Barang</span>
                      <span className="font-semibold text-[#2B3674]">{item.Equipment?.nama || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#8789C0]">Tanggal Pinjam</span>
                      <span className="font-semibold text-[#2B3674]">{formatTanggal(item.tanggal_pinjam)}</span>
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="w-full py-2.5 bg-[#F75807] hover:bg-[#e04e05] text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Detail
                  </button>
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

      <DetailPeminjamanModal
        isOpen={!!selectedItem}
        data={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </MainLayout>
  );
}