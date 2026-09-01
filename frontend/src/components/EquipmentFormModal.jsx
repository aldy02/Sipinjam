import { useState, useEffect } from 'react';
import { X, Trash2, CheckCircle2 } from 'lucide-react';
import { createEquipment, updateEquipment, deleteEquipment } from '../api/equipment';

const KONDISI_OPTIONS = ['baik', 'rusak ringan', 'rusak berat', 'hilang'];

export default function EquipmentFormModal({ isOpen, onClose, onSuccess, mode = 'form', initialData }) {
  const isEdit = mode === 'edit';
  const isDelete = mode === 'delete';

  const [form, setForm] = useState({ kode_barang: '', nama: '', kondisi: 'baik', deskripsi: '' });
  const [isLainnya, setIsLainnya] = useState(false);
  const [kondisiLainnya, setKondisiLainnya] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successView, setSuccessView] = useState(false);

  useEffect(() => {
    if (initialData && (isEdit || isDelete)) {
      const kondisiAwal = initialData.kondisi?.toLowerCase() || 'baik';
      const isCustom = !KONDISI_OPTIONS.includes(kondisiAwal);

      setForm({
        kode_barang: initialData.kode_barang || '',
        nama: initialData.nama,
        kondisi: isCustom ? '' : kondisiAwal,
        deskripsi: initialData.deskripsi || '',
      });
      setIsLainnya(isCustom);
      setKondisiLainnya(isCustom ? initialData.kondisi : '');
    } else {
      setForm({ kode_barang: '', nama: '', kondisi: 'baik', deskripsi: '' });
      setIsLainnya(false);
      setKondisiLainnya('');
    }
    setError('');
    setSuccessView(false);
  }, [initialData, isOpen, isEdit, isDelete]);

  if (!isOpen) return null;

  const handleSelectKondisi = (value) => {
    setForm({ ...form, kondisi: value });
    setIsLainnya(false);
    setKondisiLainnya('');
  };

  const handleSelectLainnya = () => {
    setIsLainnya(true);
    setForm({ ...form, kondisi: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.kode_barang.trim()) {
      setError('Kode barang wajib diisi');
      return;
    }

    if (!form.nama.trim()) {
      setError('Nama barang wajib diisi');
      return;
    }

    const kondisiFinal = isLainnya ? kondisiLainnya.trim() : form.kondisi;

    if (!kondisiFinal) {
      setError('Kondisi barang wajib dipilih atau diisi');
      return;
    }

    const payload = { ...form, kondisi: kondisiFinal };

    try {
      setLoading(true);
      if (isEdit) {
        await updateEquipment(initialData.equipment_id, payload);
      } else {
        await createEquipment(payload);
      }
      onSuccess();
      setSuccessView(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan, coba lagi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteEquipment(initialData.equipment_id);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus barang');
    } finally {
      setLoading(false);
    }
  };

  const kondisiButtonClass = (isActive) =>
    `px-4 py-3.5 rounded-xl text-sm font-medium text-left border transition-colors ${
      isActive
        ? 'border-[#003399] bg-[#E8EDFB]/70 text-[#2B3674]'
        : 'border-slate-200 text-[#8789C0] hover:bg-slate-50'
    }`;

  // Success (setelah tambah/edit berhasil)
  if (successView) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl w-full max-w-md p-8 relative">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-gray-400 hover:text-gray-600"
          >
            <X size={22} />
          </button>

          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-5">
            <CheckCircle2 size={30} className="text-[#027959]" />
          </div>

          <h2 className="text-2xl font-bold text-[#2B3674] mb-2">Berhasil!</h2>
          <p className="text-[15px] text-[#8789C0] mb-8 leading-relaxed">
            Data barang{' '}
            <span className="font-semibold text-[#5B69B9]">{form.nama}</span>{' '}
            berhasil {isEdit ? 'diperbarui' : 'ditambahkan'}.
          </p>

          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-[#027959] hover:bg-green-800 text-white font-semibold text-sm transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  // Delete Confirmation
  if (isDelete) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl w-full max-w-md p-8 relative">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-gray-400 hover:text-gray-600"
          >
            <X size={22} />
          </button>

          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
            <Trash2 size={28} className="text-red-500" />
          </div>

          <h2 className="text-2xl font-bold text-[#2B3674] mb-2">Hapus Data!</h2>
          <p className="text-[15px] text-[#8789C0] mb-8 leading-relaxed">
            Apakah Anda yakin ingin menghapus data{' '}
            <span className="font-semibold text-[#5B69B9]">
              {initialData?.kode_barang} - {initialData?.nama}
            </span>
            ?
            <br />
            Tindakan ini tidak dapat dibatalkan!
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-[#2B3674] font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 py-3.5 rounded-2xl bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold text-sm transition-colors"
            >
              {loading ? 'Menghapus...' : 'Hapus'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form (add / edit)
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-[#2B3674] mb-5">
          {isEdit ? 'Edit Barang' : 'Tambah Barang'}
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#2B3674] mb-1.5">
              Kode Barang
            </label>
            <input
              type="text"
              value={form.kode_barang}
              onChange={(e) => setForm({ ...form, kode_barang: e.target.value })}
              placeholder="Masukkan kode barang"
              className="w-full placeholder-[#8789C0] 
              text-[#2B3674] px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] disabled:bg-gray-50 disabled:text-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2B3674] mb-1.5">
              Nama Barang
            </label>
            <input
              type="text"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              placeholder="Masukkan nama barang"
              className="w-full placeholder-[#8789C0] text-[#2B3674] px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2B3674] mb-3">
              Kondisi
            </label>

            <div className="grid grid-cols-2 gap-3">
              {KONDISI_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelectKondisi(opt)}
                  className={kondisiButtonClass(!isLainnya && form.kondisi === opt)}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}

              <button
                type="button"
                onClick={handleSelectLainnya}
                className={`${kondisiButtonClass(isLainnya)} col-span-2`}
              >
                Lainnya
              </button>
            </div>

            {isLainnya && (
              <input
                type="text"
                value={kondisiLainnya}
                onChange={(e) => setKondisiLainnya(e.target.value)}
                placeholder="Tulis kondisi barang..."
                className="w-full text-[#2B3674] placeholder-[#8789C0] mt-3 px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399]"
                autoFocus
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2B3674] mb-1.5">
              Deskripsi (opsional)
            </label>
            <textarea
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              placeholder="Deskripsi barang"
              rows={3}
              className="w-full placeholder-[#8789C0] text-[#2B3674] px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#F75807] hover:bg-[#e04e05] disabled:bg-gray-400 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Barang'}
          </button>
        </form>
      </div>
    </div>
  );
}