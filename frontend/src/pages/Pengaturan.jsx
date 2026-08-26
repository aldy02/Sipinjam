import { useState, useEffect } from 'react';
import { User, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import PageHeader from '../components/PageHeader';
import PeminjamanStatusModal from '../components/PeminjamanStatusModal';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile, changePassword } from '../api/auth';

const EMPTY_PASSWORD_FORM = {
  password_lama: '',
  password_baru: '',
  konfirmasi_password_baru: '',
};

export default function Pengaturan() {
  const { user, setUser } = useAuth();

  const [profileForm, setProfileForm] = useState({ nama: '', nok: '', email: '', jabatan: '' });
  const [originalProfile, setOriginalProfile] = useState(null);

  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);

  const [showPasswordLama, setShowPasswordLama] = useState(false);
  const [showPasswordBaru, setShowPasswordBaru] = useState(false);
  const [showKonfirmasiPassword, setShowKonfirmasiPassword] = useState(false);

  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [statusModal, setStatusModal] = useState(null);
  // Antrian Modal Popup
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        const data = res.data.data;
        const loaded = {
          nama: data.nama || '',
          nok: data.nok || '',
          email: data.email || '',
          jabatan: data.jabatan || '',
        };
        setProfileForm(loaded);
        setOriginalProfile(loaded);
      } catch (err) {
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const isProfileChanged =
    originalProfile &&
    (profileForm.nama !== originalProfile.nama ||
      profileForm.nok !== originalProfile.nok ||
      profileForm.email !== originalProfile.email ||
      profileForm.jabatan !== originalProfile.jabatan);

  const isPasswordChanged =
    passwordForm.password_lama.trim() !== '' ||
    passwordForm.password_baru.trim() !== '' ||
    passwordForm.konfirmasi_password_baru.trim() !== '';

  const runProfileStep = async () => {
    if (!profileForm.nama.trim() || !profileForm.nok.trim() || !profileForm.email.trim()) {
      setStatusModal({ type: 'error', message: 'Nama, NOK, dan email wajib diisi' });
      return;
    }

    try {
      const res = await updateProfile(profileForm);
      const updatedUser = { ...user, ...res.data.data };
      setUser(updatedUser);
      setOriginalProfile({ ...profileForm });
      setStatusModal({ type: 'success', message: 'Informasi profil berhasil diperbarui.' });
    } catch (err) {
      setStatusModal({
        type: 'error',
        message: err.response?.data?.message || 'Terjadi kesalahan, coba lagi',
      });
    }
  };

  const runPasswordStep = async () => {
    const { password_lama, password_baru, konfirmasi_password_baru } = passwordForm;

    if (!password_lama || !password_baru || !konfirmasi_password_baru) {
      setStatusModal({ type: 'error', message: 'Semua field kata sandi wajib diisi' });
      return;
    }

    if (password_baru !== konfirmasi_password_baru) {
      setStatusModal({ type: 'error', message: 'Konfirmasi kata sandi baru tidak sama' });
      return;
    }

    try {
      await changePassword(passwordForm);
      setPasswordForm(EMPTY_PASSWORD_FORM);
      setStatusModal({ type: 'success', message: 'Kata sandi berhasil diubah.' });
    } catch (err) {
      setStatusModal({
        type: 'error',
        message: err.response?.data?.message || 'Terjadi kesalahan, coba lagi',
      });
    }
  };

  const processStep = async (step) => {
    if (step === 'profile') {
      await runProfileStep();
    } else if (step === 'password') {
      await runPasswordStep();
    }
  };

  const handleSimpan = async () => {
    const steps = [];
    if (isProfileChanged) steps.push('profile');
    if (isPasswordChanged) steps.push('password');

    // If no changes, No Popup
    if (steps.length === 0) {
      return;
    }

    setSaving(true);
    setQueue(steps);
    await processStep(steps[0]);
    setSaving(false);
  };

  const handleCloseModal = () => {
    setStatusModal(null);
    setQueue((prev) => {
      const rest = prev.slice(1);
      if (rest.length > 0) {
        processStep(rest[0]);
      }
      return rest;
    });
  };

  return (
    <MainLayout>
      <PageHeader breadcrumb="Sipinjam / Pengaturan" title="Pengaturan Akun" />

      {initialLoading ? (
        <div className="bg-white rounded-2xl p-8 text-center text-[#A3AED0] shadow-sm">
          Memuat data...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section: Informasi Profil */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <User size={20} className="text-[#003399]" />
              </div>
              <div>
                <h3 className="font-bold text-[#2B3674] text-lg">Informasi Profil</h3>
                <p className="text-sm text-[#8789C0]">Kelola informasi dasar profil dan identitas anda</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-[#2B3674] mb-1.5">Nama</label>
                <input
                  type="text"
                  name="nama"
                  value={profileForm.nama}
                  onChange={handleProfileChange}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] text-[#2B3674]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2B3674] mb-1.5">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] text-[#2B3674]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2B3674] mb-1.5">NOK</label>
                <input
                  type="text"
                  name="nok"
                  value={profileForm.nok}
                  onChange={handleProfileChange}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] text-[#2B3674]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2B3674] mb-1.5">Jabatan</label>
                <input
                  type="text"
                  name="jabatan"
                  value={profileForm.jabatan}
                  onChange={handleProfileChange}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] text-[#2B3674]"
                />
              </div>
            </div>
          </div>

          {/* Section: Keamanan */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} className="text-[#003399]" />
              </div>
              <div>
                <h3 className="font-bold text-[#2B3674] text-lg">Keamanan</h3>
                <p className="text-sm text-[#8789C0]">Ubah kata sandi untuk menjaga keamanan akun anda</p>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-[#2B3674] mb-1.5">
                Kata Sandi Saat Ini
              </label>
              <div className="relative">
                <input
                  type={showPasswordLama ? 'text' : 'password'}
                  name="password_lama"
                  value={passwordForm.password_lama}
                  onChange={handlePasswordChange}
                  placeholder="Masukkan kata sandi saat ini"
                  className="w-full px-3.5 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] text-[#2B3674] placeholder-[#38437C]"
                />
                <span
                  onClick={() => setShowPasswordLama(!showPasswordLama)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8789C0] cursor-pointer"
                >
                  {showPasswordLama ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-[#2B3674] mb-1.5">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <input
                    type={showPasswordBaru ? 'text' : 'password'}
                    name="password_baru"
                    value={passwordForm.password_baru}
                    onChange={handlePasswordChange}
                    placeholder="Masukkan kata sandi baru"
                    className="w-full px-3.5 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] text-[#2B3674] placeholder-[#38437C]"
                  />
                  <span
                    onClick={() => setShowPasswordBaru(!showPasswordBaru)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8789C0] cursor-pointer"
                  >
                    {showPasswordBaru ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2B3674] mb-1.5">
                  Konfirmasi Kata Sandi Baru
                </label>
                <div className="relative">
                  <input
                    type={showKonfirmasiPassword ? 'text' : 'password'}
                    name="konfirmasi_password_baru"
                    value={passwordForm.konfirmasi_password_baru}
                    onChange={handlePasswordChange}
                    placeholder="Masukkan konfirmasi kata sandi baru"
                    className="w-full px-3.5 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#003399] text-[#2B3674] placeholder-[#38437C]"
                  />
                  <span
                    onClick={() => setShowKonfirmasiPassword(!showKonfirmasiPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8789C0] cursor-pointer"
                  >
                    {showKonfirmasiPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold transition-colors"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={handleSimpan}
              disabled={saving}
              className="px-6 py-3 rounded-lg bg-[#F75807] hover:bg-[#e04e05] disabled:bg-gray-400 text-white text-sm font-semibold transition-colors"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      )}

      <PeminjamanStatusModal
        isOpen={!!statusModal}
        type={statusModal?.type}
        message={statusModal?.message}
        onClose={handleCloseModal}
      />
    </MainLayout>
  );
}