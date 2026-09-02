import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, MapPin, FileText, Search, ChevronDown, Check } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import PageHeader from '../components/PageHeader';
import PeminjamanStatusModal from '../components/PeminjamanStatusModal';
import { getEquipmentList } from '../api/equipment';
import { createPeminjaman } from '../api/peminjaman';

const todayStr = () => new Date().toISOString().split('T')[0];

const SMOOTH_EASE = [0.16, 1, 0.3, 1];

const containerStagger = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.12, delayChildren: 0.05 },
    },
};

const fadeUpSection = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: SMOOTH_EASE } },
};

const containerStaggerFast = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.03 },
    },
};

const fadeItem = {
    hidden: { opacity: 0, y: -6 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: SMOOTH_EASE } },
};

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
    const [statusModal, setStatusModal] = useState(null);

    // Search dropdown state (Barang)
    const [equipmentDropdownOpen, setEquipmentDropdownOpen] = useState(false);
    const [equipmentSearch, setEquipmentSearch] = useState('');
    const equipmentDropdownRef = useRef(null);

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

    // Tutup dropdown barang saat klik di luar area
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (equipmentDropdownRef.current && !equipmentDropdownRef.current.contains(e.target)) {
                setEquipmentDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSelectEquipment = (equipment_id) => {
        setForm((prev) => ({ ...prev, equipment_id }));
        setEquipmentDropdownOpen(false);
        setEquipmentSearch('');
    };

    const filteredEquipmentOptions = equipmentOptions.filter((eq) => {
        const keyword = equipmentSearch.toLowerCase();
        return (
            eq.nama.toLowerCase().includes(keyword) ||
            eq.kode_barang.toLowerCase().includes(keyword)
        );
    });

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
                        berhasil dikirim.
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

            <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: SMOOTH_EASE }}
                className="md:bg-white md:rounded-2xl md:shadow-sm p-0 md:p-6 lg:p-8"
            >
                <div className="mb-6 md:mb-8">
                    <h2 className="text-xl font-bold text-[#2B3674] mb-1">Form Peminjaman Barang</h2>
                    <p className="text-sm text-[#8789C0]">
                        Silakan lengkapi formulir di bawah ini untuk mengajukan peminjaman barang
                    </p>
                </div>

                <motion.form
                    variants={containerStagger}
                    initial="hidden"
                    animate="show"
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {/* Section: Barang Yang Dipinjam */}
                    <motion.div
                        variants={fadeUpSection}
                        className="bg-white rounded-2xl shadow-sm p-6 md:bg-transparent md:rounded-none md:shadow-none md:border md:border-gray-100"
                    >
                        <div className="flex items-start gap-3 mb-5">
                            <motion.div
                                whileHover={{ scale: 1.08, rotate: 3 }}
                                transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                                className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0"
                            >
                                <Package size={20} className="text-[#003399]" />
                            </motion.div>
                            <div>
                                <h3 className="font-bold text-[#2B3674]">Barang Yang Dipinjam</h3>
                                <p className="text-sm text-[#8789C0]">Pilih barang yang tersedia untuk dipinjam</p>
                            </div>
                        </div>

                        <label className="block text-sm font-semibold text-[#2B3674] mb-1.5">Barang</label>

                        {/* Search dropdown */}
                        <div className="relative" ref={equipmentDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setEquipmentDropdownOpen((prev) => !prev)}
                                disabled={loadingOptions}
                                className="w-full flex items-center justify-between px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] bg-white text-left disabled:bg-gray-50 transition-colors"
                            >
                                <span className={selectedEquipment ? 'text-[#2B3674]' : 'text-[#8789C0]'}>
                                    {loadingOptions
                                        ? 'Memuat barang...'
                                        : selectedEquipment
                                        ? `${selectedEquipment.kode_barang} - ${selectedEquipment.nama}`
                                        : 'Pilih barang...'}
                                </span>
                                <motion.span
                                    animate={{ rotate: equipmentDropdownOpen ? 180 : 0 }}
                                    transition={{ duration: 0.25, ease: SMOOTH_EASE }}
                                    className="shrink-0 ml-2"
                                >
                                    <ChevronDown size={18} className="text-[#8789C0]" />
                                </motion.span>
                            </button>

                            <AnimatePresence>
                                {equipmentDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                        transition={{ duration: 0.2, ease: SMOOTH_EASE }}
                                        className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden origin-top"
                                    >
                                        <div className="p-2 border-b border-gray-100">
                                            <div className="relative">
                                                <Search
                                                    size={16}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8789C0]"
                                                />
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    value={equipmentSearch}
                                                    onChange={(e) => setEquipmentSearch(e.target.value)}
                                                    placeholder="Cari nama atau kode barang..."
                                                    className="w-full pl-9 pr-3 py-2 text-sm placeholder-[#8789C0] text-[#2B3674] border border-gray-200 rounded-md outline-none focus:border-[#003399]"
                                                />
                                            </div>
                                        </div>

                                        <motion.div
                                            variants={containerStaggerFast}
                                            initial="hidden"
                                            animate="show"
                                            className="max-h-56 overflow-y-auto"
                                        >
                                            {filteredEquipmentOptions.length === 0 ? (
                                                <p className="px-3.5 py-3 text-sm text-[#A3AED0] text-center">
                                                    Barang tidak ditemukan
                                                </p>
                                            ) : (
                                                filteredEquipmentOptions.map((eq) => {
                                                    const isSelected = String(eq.equipment_id) === String(form.equipment_id);
                                                    return (
                                                        <motion.button
                                                            key={eq.equipment_id}
                                                            variants={fadeItem}
                                                            type="button"
                                                            whileHover={{ x: 2 }}
                                                            onClick={() => handleSelectEquipment(String(eq.equipment_id))}
                                                            className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left text-sm hover:bg-blue-50 transition-colors ${
                                                                isSelected ? 'bg-blue-50' : ''
                                                            }`}
                                                        >
                                                            <span>
                                                                <span className="font-medium text-[#2B3674]">{eq.nama}</span>
                                                                <span className="block text-xs text-[#8789C0]">{eq.kode_barang}</span>
                                                            </span>
                                                            {isSelected && (
                                                                <motion.span
                                                                    initial={{ scale: 0, opacity: 0 }}
                                                                    animate={{ scale: 1, opacity: 1 }}
                                                                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                                                >
                                                                    <Check size={16} className="text-[#003399] shrink-0" />
                                                                </motion.span>
                                                            )}
                                                        </motion.button>
                                                    );
                                                })
                                            )}
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <AnimatePresence>
                            {selectedEquipment && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.25, ease: SMOOTH_EASE }}
                                    className="text-xs text-[#8789C0] mt-2"
                                >
                                    Kondisi barang saat ini:{' '}
                                    <span className="font-medium capitalize text-[#5B69B9]">
                                        {selectedEquipment.kondisi}
                                    </span>
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Section: Detail Peminjaman */}
                    <motion.div
                        variants={fadeUpSection}
                        className="bg-white rounded-2xl shadow-sm p-6 md:bg-transparent md:rounded-none md:shadow-none md:border md:border-gray-100"
                    >
                        <div className="flex items-start gap-3 mb-5">
                            <motion.div
                                whileHover={{ scale: 1.08, rotate: 3 }}
                                transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                                className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0"
                            >
                                <MapPin size={20} className="text-[#003399]" />
                            </motion.div>
                            <div>
                                <h3 className="font-bold text-[#2B3674]">Detail Peminjaman</h3>
                                <p className="text-sm text-[#8789C0]">Informasi lokasi dan jadwal pengembalian</p>
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
                                    className="w-full px-3.5 py-2.5 border placeholder-[#8789C0] text-[#2B3674] border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] transition-colors"
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
                                    className="w-full px-3.5 py-2.5 border placeholder-[#8789C0] text-[#2B3674] border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] transition-colors"
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
                                    className="w-full px-3.5 py-2.5 border text-[#2B3674] border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] transition-colors"
                                    required
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Section: Catatan Tambahan */}
                    <motion.div
                        variants={fadeUpSection}
                        className="bg-white rounded-2xl shadow-sm p-6 md:bg-transparent md:rounded-none md:shadow-none md:border md:border-gray-100"
                    >
                        <div className="flex items-start gap-3 mb-5">
                            <motion.div
                                whileHover={{ scale: 1.08, rotate: 3 }}
                                transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                                className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0"
                            >
                                <FileText size={20} className="text-[#003399]" />
                            </motion.div>
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
                            className="w-full px-3.5 py-2.5 border placeholder-[#8789C0] text-[#2B3674] border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] resize-none transition-colors"
                        />
                    </motion.div>

                    {/* Actions */}
                    <motion.div variants={fadeUpSection} className="flex justify-end gap-3">
                        <motion.button
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: 'spring', stiffness: 240, damping: 18 }}
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold transition-colors"
                        >
                            Kembali
                        </motion.button>
                        <motion.button
                            whileHover={{ y: -2, boxShadow: '0 8px 20px -6px rgba(247,88,7,0.5)' }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: 'spring', stiffness: 240, damping: 18 }}
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 rounded-lg bg-[#F75807] hover:bg-[#e04e05] disabled:bg-gray-400 text-white text-sm font-semibold transition-colors"
                        >
                            {loading ? 'Mengirim...' : 'Kirim'}
                        </motion.button>
                    </motion.div>
                </motion.form>
            </motion.div>

            <PeminjamanStatusModal
                isOpen={!!statusModal}
                type={statusModal?.type}
                message={statusModal?.message}
                onClose={handleCloseModal}
            />
        </MainLayout>
    );
}