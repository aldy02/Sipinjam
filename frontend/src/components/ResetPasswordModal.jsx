import { useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { resetUserPassword } from '../api/users';

export default function ResetPasswordModal({ isOpen, onClose, onSuccess, user }) {
  const [passwordBaru, setPasswordBaru] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successView, setSuccessView] = useState(false);

  useEffect(() => {
    setPasswordBaru('');
    setKonfirmasiPassword('');
    setError('');
    setSuccessView(false);
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!passwordBaru || passwordBaru.length < 6) {
      setError('Password baru minimal 6 karakter');
      return;
    }

    if (passwordBaru !== konfirmasiPassword) {
      setError('Konfirmasi password tidak sama');
      return;
    }

    try {
      setLoading(true);
      await resetUserPassword(user.user_id, { password_baru: passwordBaru });
      onSuccess();
      setSuccessView(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan, coba lagi');
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
            Password akun{' '}
            <span className="font-semibold text-[#5B69B9]">{user.nama}</span>{' '}
            berhasil direset.
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

  // Form
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-[#2B3674] mb-1">Reset Password</h2>
        <p className="text-sm text-[#8789C0] mb-5">
          Atur ulang password untuk akun{' '}
          <span className="font-medium text-[#2B3674]">{user.nama}</span>
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#2B3674] mb-1.5">
              Password Baru
            </label>
            <input
              type="password"
              value={passwordBaru}
              onChange={(e) => setPasswordBaru(e.target.value)}
              placeholder="Masukkan password baru"
              className="w-full placeholder-[#8789C0] text-[#2B3674] px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2B3674] mb-1.5">
              Konfirmasi Password Baru
            </label>
            <input
              type="password"
              value={konfirmasiPassword}
              onChange={(e) => setKonfirmasiPassword(e.target.value)}
              placeholder="Masukkan konfirmasi password baru"
              className="w-full placeholder-[#8789C0] text-[#2B3674] px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#F75807] hover:bg-[#e04e05] disabled:bg-gray-400 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Menyimpan...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}