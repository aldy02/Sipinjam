import { useState, useEffect, useCallback } from 'react';
import { Package } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import PageHeader from '../components/PageHeader';
import KembalikanBarangModal from '../components/KembalikanBarangModal';
import DetailPeminjamanModal from '../components/DetailPeminjamanModal';
import { getPeminjamanList } from '../api/peminjaman';
import { ChevronDown, ChevronUp } from 'lucide-react';

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

const getDueBadge = (rencanaKembali) => {
    if (!rencanaKembali) return null;
    const rencana = new Date(rencanaKembali);
    const today = new Date();
    rencana.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((rencana - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { label: `Terlambat ${Math.abs(diffDays)} Hari`, className: 'bg-red-50 text-red-600' };
    }
    return { label: `Tersisa ${diffDays} Hari`, className: 'bg-orange-50 text-[#CD6200]' };
};

const HISTORY_PREVIEW_COUNT = 3;

export default function AktivitasSaya() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    const [kembalikanItem, setKembalikanItem] = useState(null);
    const [detailItem, setDetailItem] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getPeminjamanList({ limit: 100 });
            setItems(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const activeLoans = items.filter((item) => item.status === 'dipinjam');
    const historyItems = showAll ? items : items.slice(0, HISTORY_PREVIEW_COUNT);

    return (
        <MainLayout>
            <PageHeader breadcrumb="Sipinjam / Aktivitas Saya" title="Aktivitas Saya" />

            {/* Section: Barang yang sedang dipinjam */}
            <div className="mb-6">
                <h2 className="text-lg font-bold text-[#2B3674] mb-4">Riwayat Peminjaman Barang</h2>

                {loading ? (
                    <div className="bg-white rounded-2xl p-8 text-center text-[#A3AED0] shadow-sm">
                        Memuat data...
                    </div>
                ) : activeLoans.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center text-[#A3AED0] shadow-sm flex flex-col items-center gap-2">
                        <Package size={28} className="text-gray-300" />
                        Tidak ada barang yang sedang dipinjam
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {activeLoans.map((item) => {
                            const badge = getDueBadge(item.tanggal_rencana_kembali);
                            return (
                                <div key={item.peminjaman_id} className="bg-white rounded-2xl p-6 shadow-sm">
                                    <div className="flex items-start justify-between mb-2">
                                        <p className="text-sm font-medium text-[#003399]">{item.kode_peminjaman}</p>
                                        {badge && (
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                                                {badge.label}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="font-bold text-[#2B3674] text-lg mb-0.5">{item.Equipment?.nama}</h3>
                                    <p className="text-sm text-[#8789C0] mb-3">{item.Equipment?.kode_barang}</p>

                                    <p className="text-xs text-[#8789C0] mb-1">
                                        Dipinjam {formatTanggal(item.tanggal_pinjam)} • Rencana Kembali{' '}
                                        {formatTanggal(item.tanggal_rencana_kembali)}
                                    </p>
                                    <p className="text-xs text-[#8789C0] mb-4">{item.lokasi_pemakaian}</p>

                                    <button
                                        onClick={() => setKembalikanItem(item)}
                                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#F75807] hover:bg-[#e04e05] text-white text-sm font-semibold transition-colors"
                                    >
                                        <Package size={16} />
                                        Kembalikan
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Section: Riwayat Peminjaman Saya */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-[#2B3674] mb-5">Riwayat Peminjaman Saya</h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-[#A3AED0] border-b border-gray-100">
                                <th className="pb-3 font-medium">Kode Peminjaman</th>
                                <th className="pb-3 font-medium">Barang</th>
                                <th className="pb-3 font-medium">Tanggal Pinjam</th>
                                <th className="pb-3 font-medium">Status</th>
                                <th className="pb-3 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-[#A3AED0]">
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : historyItems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-[#A3AED0]">
                                        Belum ada riwayat peminjaman
                                    </td>
                                </tr>
                            ) : (
                                historyItems.map((item) => (
                                    <tr key={item.peminjaman_id} className="border-b border-gray-50 last:border-0">
                                        <td className="py-4 font-medium text-[#2B3674]">{item.kode_peminjaman}</td>
                                        <td className="py-4 font-medium text-[#2B3674]">{item.Equipment?.nama}</td>
                                        <td className="py-4 font-medium text-[#2B3674]">{formatTanggal(item.tanggal_pinjam)}</td>
                                        <td className="py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLE[item.status] || 'bg-gray-50 text-gray-500'
                                                    }`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <button
                                                onClick={() => setDetailItem(item)}
                                                className="px-4 py-2 bg-[#F75807] hover:bg-[#e04e05] text-white text-xs font-semibold rounded-lg transition-colors"
                                            >
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && items.length > HISTORY_PREVIEW_COUNT && (
                    <div className="flex justify-center mt-6">
                        <button
                            onClick={() => setShowAll((prev) => !prev)}
                            className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-50 text-[#003399] text-sm font-medium hover:bg-blue-100 transition-colors"
                        >
                            {showAll ? 'Tampilkan Lebih Sedikit' : 'Lihat Semua'}

                            {showAll ? (
                                <ChevronUp size={16} strokeWidth={2.5} />
                            ) : (
                                <ChevronDown size={16} strokeWidth={2.5} />
                            )}
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

            <DetailPeminjamanModal
                isOpen={!!detailItem}
                data={detailItem}
                onClose={() => setDetailItem(null)}
            />
        </MainLayout>
    );
}