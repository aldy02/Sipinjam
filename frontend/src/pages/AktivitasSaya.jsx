import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
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

const HISTORY_PREVIEW_COUNT = 3;

export default function AktivitasSaya() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

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

    const historyItems = showAll ? items : items.slice(0, HISTORY_PREVIEW_COUNT);

    return (
        <MainLayout>
            <PageHeader breadcrumb="Sipinjam / Aktivitas Saya" title="Aktivitas Saya" />

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-[#2B3674] mb-5">Riwayat Peminjaman Saya</h2>

                {loading ? (
                    <div className="py-8 text-center text-[#A3AED0] text-sm">Memuat data...</div>
                ) : historyItems.length === 0 ? (
                    <div className="py-8 text-center text-[#A3AED0] text-sm">Belum ada riwayat peminjaman</div>
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
                                        <th className="pb-3 font-medium">Status</th>
                                        <th className="pb-3 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historyItems.map((item) => (
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
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile: card list */}
                        <div className="md:hidden flex flex-col gap-4">
                            {historyItems.map((item) => (
                                <div key={item.peminjaman_id} className="border border-gray-100 rounded-2xl p-5">
                                    <div className="flex items-start justify-between mb-1">
                                        <p className="font-bold text-[#2B3674]">{item.kode_peminjaman}</p>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium capitalize shrink-0 ${STATUS_STYLE[item.status] || 'bg-gray-50 text-gray-500'
                                                }`}
                                        >
                                            {item.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#8789C0] mb-4">{item.Equipment?.kode_barang}</p>

                                    <div className="space-y-2.5 mb-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-[#5B69B9]">Barang</span>
                                            <span className="text-sm font-semibold text-[#2B3674]">{item.Equipment?.nama}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-[#5B69B9]">Tanggal Pinjam</span>
                                            <span className="text-sm font-semibold text-[#2B3674]">
                                                {formatTanggal(item.tanggal_pinjam)}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setDetailItem(item)}
                                        className="w-full py-3 bg-[#F75807] hover:bg-[#e04e05] text-white text-sm font-semibold rounded-xl transition-colors"
                                    >
                                        Detail
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

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

            <DetailPeminjamanModal
                isOpen={!!detailItem}
                data={detailItem}
                onClose={() => setDetailItem(null)}
            />
        </MainLayout>
    );
}