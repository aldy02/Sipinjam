import { useState, useEffect } from 'react';
import { X, UserX, CheckCircle2 } from 'lucide-react';
import { createUser, updateUser, deactivateUser } from '../api/users';

const ROLE_OPTIONS = ['karyawan', 'admin'];

export default function UserFormModal({ isOpen, onClose, onSuccess, mode = 'form', initialData }) {
  const isEdit = mode === 'edit';
  const isDeactivate = mode === 'deactivate';

  const [form, setForm] = useState({
    nama: '',
    nok: '',
    email: '',
    jabatan: '',
    password: '',
    role: 'karyawan',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successView, setSuccessView] = useState(false);

  useEffect(() => {
    if (initialData && (isEdit || isDeactivate)) {
      setForm({
        nama: initialData.nama || '',
        nok: initialData.nok || '',
        email: initialData.email || '',
        jabatan: initialData.jabatan || '',
        password: '',
        role: initialData.role || 'karyawan',
      });
    } else {
      setForm({ nama: '', nok: '', email: '', jabatan: '', password: '', role: 'karyawan' });
    }
    setError('');
    setSuccessView(false);
  }, [initialData, isOpen, isEdit, isDeactivate]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.nama.trim() || !form.nok.trim() || !form.email.trim()) {
      setError('Nama, NOK, dan email wajib diisi');
      return;
    }

    if (!isEdit && !form.password.trim()) {
      setError('Password wajib diisi untuk akun baru');
      return;
    }

    if (!isEdit && form.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    try {
      setLoading(true);
      if (isEdit) {
        await updateUser(initialData.user_id, {
          nama: form.nama,
          nok: form.nok,
          email: form.email,
          jabatan: form.jabatan,
          role: form.role,
        });
      } else {
        await createUser(form);
      }
      onSuccess();
      setSuccessView(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan, coba lagi');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      setLoading(true);
      await deactivateUser(initialData.user_id);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menonaktifkan akun');
    } finally {
      setLoading(false);
    }
  };

  // Success
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
            Data akun{' '}
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

  // Deactive Confirmation
  if (isDeactivate) {
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
            <UserX size={28} className="text-red-500" />
          </div>

          <h2 className="text-2xl font-bold text-[#2B3674] mb-2">Nonaktifkan Akun!</h2>
          <p className="text-[15px] text-[#8789C0] mb-8 leading-relaxed">
            Apakah Anda yakin ingin menonaktifkan akun{' '}
            <span className="font-semibold text-[#5B69B9]">
              {initialData?.nama} ({initialData?.email})
            </span>
            ? Akun tidak akan bisa login sampai diaktifkan kembali. Riwayat peminjaman tetap tersimpan.
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
              onClick={handleDeactivate}
              disabled={loading}
              className="flex-1 py-3.5 rounded-2xl bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold text-sm transition-colors"
            >
              {loading ? 'Memproses...' : 'Nonaktifkan'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form Add / Edit
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
          {isEdit ? 'Edit Akun' : 'Tambah Akun'}
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#2B3674] mb-1.5">Nama</label>
            <input
              type="text"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              placeholder="Masukkan nama lengkap"
              className="w-full placeholder-[#8789C0] text-[#2B3674] px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2B3674] mb-1.5">NOK</label>
            <input
              type="text"
              value={form.nok}
              onChange={(e) => setForm({ ...form, nok: e.target.value })}
              placeholder="Masukkan NOK"
              className="w-full placeholder-[#8789C0] text-[#2B3674] px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2B3674] mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Masukkan email"
              className="w-full placeholder-[#8789C0] text-[#2B3674] px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2B3674] mb-1.5">Jabatan</label>
            <input
              type="text"
              value={form.jabatan}
              onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
              placeholder="Masukkan jabatan"
              className="w-full placeholder-[#8789C0] text-[#2B3674] px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399]"
            />
          </div>

          {!isEdit && (
            <div>
              <label className="block text-sm font-semibold text-[#2B3674] mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Masukkan password"
                className="w-full placeholder-[#8789C0] text-[#2B3674] px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399]"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[#2B3674] mb-1.5">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] bg-white text-[#2B3674]"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#F75807] hover:bg-[#e04e05] disabled:bg-gray-400 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Akun'}
          </button>
        </form>
      </div>
    </div>
  );
}