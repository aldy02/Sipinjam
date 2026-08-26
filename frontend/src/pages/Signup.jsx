import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import gambarPupukKaltim from '../assets/gambar-pupukkaltim.jpg';

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    nok: '',
    nama: '',
    jabatan: '',
    password: '',
    konfirmasiPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.konfirmasiPassword) {
      setError('Password dan konfirmasi password tidak sama');
      return;
    }

    if (form.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/signup', {
        nama: form.nama,
        nok: form.nok,
        email: form.email,
        jabatan: form.jabatan,
        password: form.password,
      });

      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan, coba lagi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full font-sans overflow-hidden">
      {/* Sisi gambar - */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -60, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="hidden md:block flex-1 bg-cover bg-center"
        style={{ backgroundImage: `url(${gambarPupukKaltim})` }}
      />

      {/* Sisi form - */}
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 60, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex-1 flex items-center justify-center p-6 md:p-10 bg-white overflow-y-auto"
      >
        <div className="w-full max-w-md py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#003399] mb-5">Sign Up!</h1>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Masukkan email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 border placeholder-[#8789C0] border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                NOK
              </label>
              <input
                type="text"
                name="nok"
                placeholder="Masukkan NOK"
                value={form.nok}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 border placeholder-[#8789C0] border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Nama
              </label>
              <input
                type="text"
                name="nama"
                placeholder="Masukkan nama lengkap"
                value={form.nama}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 placeholder-[#8789C0] border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Jabatan
              </label>
              <input
                type="text"
                name="jabatan"
                placeholder="Masukkan jabatan"
                value={form.jabatan}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border placeholder-[#8789C0] border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Masukkan password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 placeholder-[#8789C0] pr-10 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] transition-colors"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Konfirmasi Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="konfirmasiPassword"
                  placeholder="Masukkan konfirmasi password"
                  value={form.konfirmasiPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 pr-10 border placeholder-[#8789C0] border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] transition-colors"
                />
                <span
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#003399] hover:bg-[#002a80] disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-[15px] font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Memproses...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-sm text-[#8789C0] mt-4">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-[#003399] font-semibold underline">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}