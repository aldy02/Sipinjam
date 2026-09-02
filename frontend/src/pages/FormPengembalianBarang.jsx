import { useState, useEffect, useCallback } from 'react';
import { Search, Package, Clock, AlertTriangle } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import PageHeader from '../components/PageHeader';
import KembalikanBarangModal from '../components/KembalikanBarangModal';
import { getPeminjamanList } from '../api/peminjaman';

const formatTanggal = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
};

const getDueInfo = (rencanaKembali) => {
    if (!rencanaKembali) return null;
    const rencana = new Date(rencanaKembali);
    const today = new Date();
    rencana.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((rencana - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return {
            isLate: true,
            label: `Terlambat ${Math.abs(diffDays)} hari`,
            className: 'bg-red-50 text-red-600',
        };
    }
    return {
        isLate: false,
        label: `Tersisa ${diffDays} hari`,
        className: 'bg-orange-50 text-[#CD6200]',
    };
};

export default function FormPengembalianBarang() {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const [kembalikanItem, setKembalikanItem] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getPeminjamanList({ status: 'dipinjam', search, page, limit: 10 });
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

    return (
        <MainLayout>
            <PageHeader breadcrumb="Sipinjam / Form Pengembalian Barang" title="Form Pengembalian Barang" />

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-[#2B3674] mb-4">Barang Yang Sedang Anda Pinjam</h2>

                    <div className="relative w-full sm:w-96">
                        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8789C0]" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setPage(1);
                                setSearch(e.target.value);
                            }}
                            placeholder="Cari berdasarkan kode atau nama barang..."
                            className="w-full pl-10 pr-4 py-2.5 placeholder-[#8789C0] text-[#2B3674] border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399]"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="py-8 text-center text-[#A3AED0] text-sm">Memuat data...</div>
                ) : items.length === 0 ? (
                    <div className="py-8 text-center text-[#A3AED0] text-sm flex flex-col items-center gap-2">
                        <Package size={28} className="text-gray-300" />
                        Tidak ada barang yang sedang dipinjam
                    </div>
                ) : (
                    <>
                        {/* Desktop / tablet: table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-[#A3AED0] border-b border-gray-100">
                                        <th className="pb-3 font-medium">Kode Peminjaman</th>
                                        <th className="pb-3 font-medium">Barang</th>
                                        <th className="pb-3 font-medium">Tanggal Pinjam</th>
                                        <th className="pb-3 font-medium">Rencana Kembali</th>
                                        <th className="pb-3 font-medium">Status</th>
                                        <th className="pb-3 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => {
                                        const due = getDueInfo(item.tanggal_rencana_kembali);
                                        return (
                                            <tr key={item.peminjaman_id} className="border-b border-gray-50 last:border-0">
                                                <td className="py-4 font-medium text-[#2B3674]">{item.kode_peminjaman}</td>
                                                <td className="py-4">
                                                    <p className="font-medium text-[#2B3674]">{item.Equipment?.nama}</p>
                                                </td>
                                                <td className="py-4 font-medium text-[#2B3674]">
                                                    {formatTanggal(item.tanggal_pinjam)}
                                                </td>
                                                <td className="py-4 font-medium text-[#2B3674]">
                                                    {formatTanggal(item.tanggal_rencana_kembali)}
                                                </td>
                                                <td className="py-4">
                                                    {due && (
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${due.className}`}
                                                        >
                                                            {due.isLate ? (
                                                                <AlertTriangle size={12} />
                                                            ) : (
                                                                <Clock size={12} />
                                                            )}
                                                            {due.label}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 text-right">
                                                    <button
                                                        onClick={() => setKembalikanItem(item)}
                                                        className="px-4 py-2 bg-[#F75807] hover:bg-[#e04e05] text-white text-xs font-semibold rounded-lg transition-colors"
                                                    >
                                                        Kembalikan
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile: card list */}
                        <div className="md:hidden flex flex-col gap-3">
                            {items.map((item) => {
                                const due = getDueInfo(item.tanggal_rencana_kembali);
                                return (
                                    <div key={item.peminjaman_id} className="border border-gray-100 rounded-xl p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-semibold text-[#2B3674]">{item.Equipment?.nama}</p>
                                                <p className="text-xs text-[#8789C0]">{item.Equipment?.kode_barang}</p>
                                            </div>
                                            {due && (
                                                <span
                                                    className={`shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${due.className}`}
                                                >
                                                    {due.isLate ? <AlertTriangle size={12} /> : <Clock size={12} />}
                                                    {due.label}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-[#8789C0]">Kode Peminjaman</span>
                                            <span className="font-semibold text-[#2B3674]">
                                                {item.kode_peminjaman}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-[#8789C0]">Tanggal Pinjam</span>
                                            <span className="font-semibold text-[#2B3674]">
                                                {formatTanggal(item.tanggal_pinjam)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm mb-3">
                                            <span className="text-[#8789C0]">Rencana Kembali</span>
                                            <span className="font-semibold text-[#2B3674]">
                                                {formatTanggal(item.tanggal_rencana_kembali)}
                                            </span>
                                        </div>

                                        <div className="border-t border-gray-100 mb-3" />

                                        <button
                                            onClick={() => setKembalikanItem(item)}
                                            className="w-full py-2.5 bg-[#003399] hover:bg-[#002a80] text-white text-sm font-semibold rounded-lg transition-colors"
                                        >
                                            Kembalikan
                                        </button>
                                    </div>
                                );
                            })}
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

            <KembalikanBarangModal
                isOpen={!!kembalikanItem}
                data={kembalikanItem}
                onClose={() => setKembalikanItem(null)}
                onSuccess={fetchData}
            />
        </MainLayout>
    );
}