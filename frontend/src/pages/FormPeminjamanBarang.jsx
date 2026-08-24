import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Package, MapPin, FileText } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import PageHeader from '../components/PageHeader';
import PeminjamanStatusModal from '../components/PeminjamanStatusModal';
import { getEquipmentList } from '../api/equipment';
import { createPeminjaman } from '../api/peminjaman';

const todayStr = () => new Date().toISOString().split('T')[0];

export default function FormPeminjamanBarang() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedId = searchParams.get('equipment_id');

    const [equipmentOptions, setEquipmentOptions] = useState([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    const [form, setForm] = useState({
        equipment_id: '',
        lokasi_pickup: '',
        lokasi_pemakaian: '',
        tanggal_rencana_kembali: '',
        keterangan: '',
    });

    const [loading, setLoading] = useState(false);
    const [statusModal, setStatusModal] = useState(null); // { type: 'success' | 'error', message: ReactNode }

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                setLoadingOptions(true);
                const res = await getEquipmentList({ status: 'tersedia', limit: 100 });
                setEquipmentOptions(res.data.data);

                if (preselectedId) {
                    setForm((prev) => ({ ...prev, equipment_id: preselectedId }));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingOptions(false);
            }
        };
        fetchOptions();
    }, [preselectedId]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.equipment_id) {
            setStatusModal({ type: 'error', message: 'Silakan pilih barang yang ingin dipinjam' });
            return;
        }

        if (!form.lokasi_pickup.trim()) {
            setStatusModal({ type: 'error', message: 'Lokasi pickup wajib diisi' });
            return;
        }

        if (!form.lokasi_pemakaian.trim()) {
            setStatusModal({ type: 'error', message: 'Lokasi pemakaian wajib diisi' });
            return;
        }

        if (!form.tanggal_rencana_kembali) {
            setStatusModal({ type: 'error', message: 'Tanggal rencana kembali wajib diisi' });
            return;
        }

        try {
            setLoading(true);
            const res = await createPeminjaman(form);
            const kode = res.data?.data?.kode_peminjaman;

            setStatusModal({
                type: 'success',
                message: (
                    <>
                        Pengajuan peminjaman{' '}
                        {kode && <span className="font-semibold text-[#5B69B9]">{kode}</span>}{' '}
                        berhasil dikirim dan sedang menunggu proses.
                    </>
                ),
            });
        } catch (err) {
            setStatusModal({
                type: 'error',
                message: err.response?.data?.message || 'Terjadi kesalahan, coba lagi',
            });
        } finally {
            setLoading(false);
        }
    };

const handleCloseModal = () => {
    const wasSuccess = statusModal?.type === 'success';

    setStatusModal(null);

    if (wasSuccess) {
        setForm({
            equipment_id: '',
            lokasi_pickup: '',
            lokasi_pemakaian: '',
            tanggal_rencana_kembali: '',
            keterangan: '',
        });
    }
};

    const selectedEquipment = equipmentOptions.find(
        (eq) => String(eq.equipment_id) === String(form.equipment_id)
    );

    return (
        <MainLayout>
            <PageHeader breadcrumb="Sipinjam / Form Pinjam Barang" title="Form Pinjam Barang" />

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-[#2B3674] mb-1">Form Peminjaman Barang</h2>
                    <p className="text-sm text-[#8789C0]">
                        Silakan lengkapi formulir di bawah ini untuk mengajukan peminjaman barang
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section: Barang Yang Dipinjam */}
                    <div className="border border-gray-100 rounded-2xl p-6">
                        <div className="flex items-start gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                <Package size={20} className="text-[#003399]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#2B3674]">Barang Yang Dipinjam</h3>
                                <p className="text-sm text-[#8789C0]">Pilih barang yang tersedia untuk dipinjam</p>
                            </div>
                        </div>

                        <label className="block text-sm font-semibold text-[#2B3674] mb-1.5">Barang</label>
                        <select
                            name="equipment_id"
                            value={form.equipment_id}
                            onChange={handleChange}
                            disabled={loadingOptions}
                            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] bg-white text-[#2B3674]"
                            required
                        >
                            <option value="">
                                {loadingOptions ? 'Memuat barang...' : 'Pilih barang...'}
                            </option>
                            {equipmentOptions.map((eq) => (
                                <option key={eq.equipment_id} value={eq.equipment_id}>
                                    {eq.kode_barang} - {eq.nama}
                                </option>
                            ))}
                        </select>

                        {selectedEquipment && (
                            <p className="text-xs text-[#8789C0] mt-2">
                                Kondisi barang saat ini:{' '}
                                <span className="font-medium capitalize text-[#5B69B9]">
                                    {selectedEquipment.kondisi}
                                </span>
                            </p>
                        )}
                    </div>

                    {/* Section: Detail Peminjaman */}
                    <div className="border border-gray-100 rounded-2xl p-6">
                        <div className="flex items-start gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                <MapPin size={20} className="text-[#003399]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#2B3674]">Detail Peminjaman</h3>
                                <p className="text-sm text-[#8789C0]">Informasi lokasi, kondisi dan jadwal peminjaman</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-[#2B3674] mb-1.5">
                                    Lokasi Pickup
                                </label>
                                <input
                                    type="text"
                                    name="lokasi_pickup"
                                    value={form.lokasi_pickup}
                                    onChange={handleChange}
                                    placeholder="Masukkan lokasi pickup"
                                    className="w-full px-3.5 py-2.5 border placeholder-[#8789C0] text-[#2B3674] border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#2B3674] mb-1.5">
                                    Lokasi Pemakaian
                                </label>
                                <input
                                    type="text"
                                    name="lokasi_pemakaian"
                                    value={form.lokasi_pemakaian}
                                    onChange={handleChange}
                                    placeholder="Masukkan lokasi pemakaian"
                                    className="w-full px-3.5 py-2.5 border placeholder-[#8789C0] text-[#2B3674] border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399]"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-[#2B3674] mb-1.5">
                                    Tanggal Rencana Kembali
                                </label>
                                <input
                                    type="date"
                                    name="tanggal_rencana_kembali"
                                    value={form.tanggal_rencana_kembali}
                                    onChange={handleChange}
                                    min={todayStr()}
                                    className="w-full px-3.5 py-2.5 border text-[#2B3674] border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399]"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Catatan Tambahan */}
                    <div className="border border-gray-100 rounded-2xl p-6">
                        <div className="flex items-start gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                <FileText size={20} className="text-[#003399]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#2B3674]">Catatan Tambahan</h3>
                                <p className="text-sm text-[#8789C0]">Tambahkan informasi lain jika diperlukan (opsional)</p>
                            </div>
                        </div>

                        <label className="block text-sm font-semibold text-[#2B3674] mb-1.5">Keterangan</label>
                        <textarea
                            name="keterangan"
                            value={form.keterangan}
                            onChange={handleChange}
                            placeholder="Tambahkan catatan jika diperlukan..."
                            rows={4}
                            className="w-full px-3.5 py-2.5 border placeholder-[#8789C0] text-[#2B3674] border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold transition-colors"
                        >
                            Kembali
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 rounded-lg bg-[#F75807] hover:bg-[#e04e05] disabled:bg-gray-400 text-white text-sm font-semibold transition-colors"
                        >
                            {loading ? 'Mengirim...' : 'Kirim'}
                        </button>
                    </div>
                </form>
            </div>

            <PeminjamanStatusModal
                isOpen={!!statusModal}
                type={statusModal?.type}
                message={statusModal?.message}
                onClose={handleCloseModal}
            />
        </MainLayout>
    );
}