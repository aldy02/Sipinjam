import { useState, useEffect } from 'react';
import { X, MapPin, AlertTriangle } from 'lucide-react';
import { kembalikanBarang } from '../api/peminjaman';
import PeminjamanStatusModal from './PeminjamanStatusModal';

const KONDISI_OPTIONS = ['baik', 'rusak ringan', 'rusak berat', 'hilang'];

const formatTanggal = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const hitungKeterlambatan = (rencanaKembali) => {
  if (!rencanaKembali) return 0;
  const rencana = new Date(rencanaKembali);
  const today = new Date();
  rencana.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today - rencana) / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export default function KembalikanBarangModal({ isOpen, onClose, onSuccess, data }) {
  const [kondisiKembali, setKondisiKembali] = useState('');
  const [isLainnya, setIsLainnya] = useState(false);
  const [kondisiLainnya, setKondisiLainnya] = useState('');
  const [lokasiKembali, setLokasiKembali] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusModal, setStatusModal] = useState(null);

  useEffect(() => {
    setKondisiKembali('');
    setIsLainnya(false);
    setKondisiLainnya('');
    setLokasiKembali('');
    setError('');
  }, [data, isOpen]);

  if (!isOpen || !data) return null;

  const keterlambatan = hitungKeterlambatan(data.tanggal_rencana_kembali);

  const handleSelectKondisi = (value) => {
    setKondisiKembali(value);
    setIsLainnya(false);
    setKondisiLainnya('');
  };

  const handleSelectLainnya = () => {
    setIsLainnya(true);
    setKondisiKembali('');
  };

  const kondisiButtonClass = (isActive) =>
    `px-4 py-3.5 rounded-xl text-sm font-medium text-left border transition-colors ${
      isActive
        ? 'border-[#003399] bg-[#E8EDFB]/70 text-[#2B3674]'
        : 'border-slate-200 text-[#8789C0] hover:bg-slate-50'
    }`;

  const handleConfirm = async () => {
    setError('');
    const kondisiFinal = isLainnya ? kondisiLainnya.trim() : kondisiKembali;

    if (!kondisiFinal) {
      setError('Silakan pilih atau isi kondisi barang saat kembali');
      return;
    }

    if (!lokasiKembali.trim()) {
      setError('Lokasi pengembalian wajib diisi');
      return;
    }

    try {
      setLoading(true);
      await kembalikanBarang(data.peminjaman_id, {
        kondisi_saat_kembali: kondisiFinal,
        lokasi_kembali: lokasiKembali,
      });
      setStatusModal({
        type: 'success',
        message: (
          <>
            Barang{' '}
            <span className="font-semibold text-[#5B69B9]">
              {data.Equipment?.kode_barang} - {data.Equipment?.nama}
            </span>{' '}
            berhasil dikembalikan.
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

  const handleCloseStatusModal = () => {
    const wasSuccess = statusModal?.type === 'success';
    setStatusModal(null);
    if (wasSuccess) {
      onSuccess();
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>

          <p className="text-sm font-medium text-[#003399] mb-1">{data.kode_peminjaman}</p>
          <h2 className="text-xl font-bold text-[#2B3674] mb-5">Kembalikan Barang</h2>

          <div className="border-t border-gray-100 mb-4" />

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="font-semibold text-[#2B3674]">{data.Equipment?.nama}</p>
            <p className="text-sm text-[#8789C0]">{data.Equipment?.kode_barang}</p>
          </div>

          {keterlambatan > 0 && (
            <div className="flex border-red-300 border items-start gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <p>
                Pengembalian terlambat <strong>{keterlambatan} hari</strong> dari rencana kembali (
                {formatTanggal(data.tanggal_rencana_kembali)}).
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg mb-4">
              {error}
            </div>
          )}

          <label className="block text-sm font-semibold text-[#2B3674] mb-3">
            Kondisi Saat Kembali
          </label>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {KONDISI_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelectKondisi(opt)}
                className={kondisiButtonClass(!isLainnya && kondisiKembali === opt)}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSelectLainnya}
            className={`${kondisiButtonClass(isLainnya)} w-full mb-2`}
          >
            Lainnya
          </button>

          {isLainnya && (
            <input
              type="text"
              value={kondisiLainnya}
              onChange={(e) => setKondisiLainnya(e.target.value)}
              placeholder="Tulis kondisi barang..."
              className="w-full mb-2 px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] placeholder-[#8789C0] text-[#2B3674]"
              autoFocus
            />
          )}

          <label className="block text-sm font-semibold text-[#2B3674] mb-1.5 mt-4">
            Lokasi Pengembalian
          </label>
          <div className="relative mb-6">
            <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8789C0]" />
            <input
              type="text"
              value={lokasiKembali}
              onChange={(e) => setLokasiKembali(e.target.value)}
              placeholder="Masukkan lokasi pengembalian"
              className="w-full pl-10 pr-3.5 py-2.5 border placeholder-[#8789C0] border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] text-[#2B3674]"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-lg border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 py-3 rounded-lg bg-[#F75807] hover:bg-[#e04e05] disabled:bg-gray-400 text-white font-semibold text-sm transition-colors"
            >
              {loading ? 'Memproses...' : 'Konfirmasi Pengembalian'}
            </button>
          </div>
        </div>
      </div>

      <PeminjamanStatusModal
        isOpen={!!statusModal}
        type={statusModal?.type}
        message={statusModal?.message}
        onClose={handleCloseStatusModal}
      />
    </>
  );
}