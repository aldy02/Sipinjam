import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import gambarPupukKaltim from '../assets/gambar-pupukkaltim.jpg';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan, coba lagi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans overflow-hidden">
      {/* Sisi form */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -60, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex-1 flex items-center justify-center p-8 md:p-12 bg-white"
      >
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-[#003399] mb-2">Login!</h1>
          <p className="text-sm text-[#8789C0] mb-7 leading-relaxed">
            Selamat datang di SIPINJAM, Sistem Peminjaman Peralatan PT Pupuk
            Kalimantan Timur – Unit Kerja PPE.
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full placeholder-[#8789C0] px-3.5 py-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] transition-colors"
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
                  className="w-full px-3.5 py-3 placeholder-[#8789C0] pr-10 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] transition-colors"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>

            <Link
              to="/forgot-password"
              className="inline-block text-sm text-[#003399] underline"
            >
              Lupa Password?
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#003399] hover:bg-[#002a80] disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-[15px] font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Memproses...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-[#8789C0] mt-5">
            Belum punya akun?{' '}
            <Link to="/signup" className="text-[#003399] font-semibold underline">
              Sign Up
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Sisi gambar */}
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 60, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="hidden md:block flex-1 bg-cover bg-center"
        style={{ backgroundImage: `url(${gambarPupukKaltim})` }}
      />
    </div>
  );
}