import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import gambarPupukKaltim from '../assets/gambar-pupukkaltim.jpg';

export default function Login() {
  const navigate = useNavigate();

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
      const res = await api.post('/auth/login', form);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan, coba lagi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans">
      {/* Sisi form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 bg-white">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-[#003399] mb-2">Login!</h1>
          <p className="text-sm text-gray-500 mb-7 leading-relaxed">
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
                className="w-full px-3.5 py-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] transition-colors"
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
                  className="w-full px-3.5 py-3 pr-10 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] transition-colors"
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

          <p className="text-center text-sm text-gray-500 mt-5">
            Belum punya akun?{' '}
            <Link to="/signup" className="text-[#003399] font-semibold underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* Sisi gambar */}
      <div
        className="hidden md:block flex-1 bg-cover bg-center"
        style={{ backgroundImage: `url(${gambarPupukKaltim})` }}
      />
    </div>
  );
}