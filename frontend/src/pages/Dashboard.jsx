import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  FileText,
  History,
  Package,
  Percent,
  Timer,
  ArrowRight,
  PackagePlus,
  FileOutput,
} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { getDashboard } from '../api/dashboard';

const STATUS_STYLE = {
  dipinjam: 'bg-orange-50 text-[#CD6200]',
  dikembalikan: 'bg-green-50 text-[#1F9254]',
};

const KONDISI_OPTIONS = ['baik', 'rusak ringan', 'rusak berat'];

const KONDISI_BAR_COLOR = {
  baik: 'bg-[#1F9254]',
  'rusak ringan': 'bg-[#F79009]',
  'rusak berat': 'bg-[#A30D11]',
};

const kondisiLabel = (kondisi) =>
  KONDISI_OPTIONS.includes(kondisi?.toLowerCase()) ? kondisi : 'Lainnya';

const kondisiSortIndex = (kondisi) => {
  const idx = KONDISI_OPTIONS.indexOf(kondisi?.toLowerCase());
  return idx === -1 ? KONDISI_OPTIONS.length : idx;
};

const SMOOTH_EASE = [0.16, 1, 0.3, 1];

const formatTanggal = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const getDueBadge = (rencanaKembali) => {
  if (!rencanaKembali) return null;
  const rencana = new Date(rencanaKembali);
  const today = new Date();
  rencana.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((rencana - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: `Terlambat ${Math.abs(diffDays)} hari`, className: 'bg-red-50 text-red-600' };
  }
  return { label: `Tersisa ${diffDays} hari`, className: 'bg-orange-50 text-[#CD6200]' };
};

const containerStagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: SMOOTH_EASE } },
};

function StatCard({ icon, iconBg, iconColor, value, label }) {
  return (
    <motion.div
      variants={fadeUpItem}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 160, damping: 20, mass: 0.9 }}
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-shadow duration-500 flex items-center gap-4 cursor-default"
    >
      <motion.div
        whileHover={{ scale: 1.08, rotate: 3 }}
        transition={{ type: 'spring', stiffness: 200, damping: 16 }}
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
      >
        <div className={iconColor}>{icon}</div>
      </motion.div>
      <div>
        <p className="text-2xl font-bold text-[#2B3674]">{value}</p>
        <p className="text-sm text-[#8789C0]">{label}</p>
      </div>
    </motion.div>
  );
}

function ProgressBar({ colorClass, percentage, delay = 0 }) {
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1.1, ease: SMOOTH_EASE, delay }}
        className={`h-full rounded-full ${colorClass}`}
      />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await getDashboard();
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const riwayatPath = isAdmin ? '/daftar-peminjaman' : '/aktivitas-saya';

  if (loading || !data) {
    return (
      <MainLayout>
        <PageHeader breadcrumb="Sipinjam / Dashboard" title="Dashboard" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: SMOOTH_EASE }}
          className="bg-white rounded-2xl p-8 text-center text-[#A3AED0] shadow-sm"
        >
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            Memuat data...
          </motion.span>
        </motion.div>
      </MainLayout>
    );
  }

  const {
    notifikasi,
    stats,
    sedang_dipinjam_list,
    aktivitas_terbaru,
    tren_peminjaman_bulanan,
    kondisi_barang,
    barang_terpopuler,
  } = data;

  const maxTren = Math.max(...tren_peminjaman_bulanan.map((t) => t.jumlah), 1);
  const maxTerpopuler = Math.max(...barang_terpopuler.map((b) => b.jumlah), 1);

  return (
    <MainLayout>
      <PageHeader breadcrumb="Sipinjam / Dashboard" title="Dashboard" />

      {/* Notifikasi */}
      <AnimatePresence>
        {notifikasi && (
          <motion.div
            initial={{ opacity: 0, y: -12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -12, height: 0 }}
            transition={{ duration: 0.5, ease: SMOOTH_EASE }}
            className="bg-red-50 border-red-300 border rounded-2xl p-5 mb-6 flex items-start justify-between gap-4 overflow-hidden"
          >
            <div className="flex items-start gap-3">
              <motion.div
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <AlertTriangle size={20} className="text-red-700 shrink-0 mt-0.5" />
              </motion.div>
              <div>
                <p className="font-semibold text-red-700">{notifikasi.pesan}</p>
                <p className="text-sm text-red-600">
                  Segera kembalikan barang untuk menghindari keterlambatan lebih lama.
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ x: 3 }}
              transition={{ duration: 0.3, ease: SMOOTH_EASE }}
              onClick={() => navigate(riwayatPath)}
              className="flex items-center gap-1 text-sm font-semibold text-red-700 shrink-0 hover:underline"
            >
              Lihat <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stat Cards */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6"
      >
        <StatCard
          icon={<FileText size={22} />}
          iconBg="bg-blue-50"
          iconColor="text-[#003399]"
          value={stats.sedang_dipinjam}
          label="Sedang Dipinjam"
        />
        <StatCard
          icon={<History size={22} />}
          iconBg="bg-orange-50"
          iconColor="text-[#CD6200]"
          value={stats.total_riwayat_peminjaman}
          label="Total Riwayat Peminjaman"
        />
        <StatCard
          icon={<AlertTriangle size={22} />}
          iconBg="bg-red-50"
          iconColor="text-red-500"
          value={stats.terlambat_dikembalikan}
          label="Terlambat Dikembalikan"
        />
        <StatCard
          icon={<Package size={22} />}
          iconBg="bg-green-50"
          iconColor="text-[#1F9254]"
          value={stats.barang_tersedia}
          label="Barang Tersedia"
        />
        <StatCard
          icon={<Percent size={22} />}
          iconBg="bg-blue-50"
          iconColor="text-[#003399]"
          value={`${stats.tingkat_ketepatan_kembali}%`}
          label="Tingkat Ketepatan Kembali"
        />
        <StatCard
          icon={<Timer size={22} />}
          iconBg="bg-orange-50"
          iconColor="text-[#CD6200]"
          value={`${stats.rata_rata_lama_pinjam} Hari`}
          label="Rata-rata Lama Pinjam"
        />
      </motion.div>

      {/* Sedang Dipinjam & Aktivitas Terbaru */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.15, ease: SMOOTH_EASE }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6"
      >
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#2B3674]">Sedang dipinjam</h2>
            <button
              onClick={() => navigate(riwayatPath)}
              className="text-sm text-[#003399] font-medium hover:underline"
            >
              Lihat semua
            </button>
          </div>

          {sedang_dipinjam_list.length === 0 ? (
            <p className="text-sm text-[#A3AED0] text-center py-6">
              Tidak ada barang yang sedang dipinjam
            </p>
          ) : (
            <motion.div
              variants={containerStagger}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {sedang_dipinjam_list.map((item) => {
                const badge = getDueBadge(item.tanggal_rencana_kembali);
                return (
                  <motion.div
                    key={item.peminjaman_id}
                    variants={fadeUpItem}
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.3, ease: SMOOTH_EASE }}
                    className="border border-gray-100 rounded-xl p-4 flex items-start justify-between gap-3 hover:border-[#003399] transition-colors duration-500"
                  >
                    <div>
                      <p className="font-semibold text-[#2B3674]">{item.Equipment?.nama}</p>
                      {isAdmin && item.User && (
                        <p className="text-xs text-[#8789C0]">{item.User.nama}</p>
                      )}
                      <p className="text-xs text-[#8789C0] mt-1">
                        Rencana kembali:{' '}
                        <span className="font-medium text-[#2B3674]">
                          {formatTanggal(item.tanggal_rencana_kembali)}
                        </span>
                      </p>
                    </div>
                    {badge && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${badge.className}`}>
                        {badge.label}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#2B3674]">Aktivitas Terbaru</h2>
            <button
              onClick={() => navigate(riwayatPath)}
              className="text-sm text-[#003399] font-medium hover:underline"
            >
              Lihat semua
            </button>
          </div>

          {aktivitas_terbaru.length === 0 ? (
            <p className="text-sm text-[#A3AED0] text-center py-6">Belum ada aktivitas</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#A3AED0] border-b border-gray-100">
                    <th className="pb-2 font-medium">Barang</th>
                    <th className="pb-2 font-medium">Tanggal Pinjam</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <motion.tbody variants={containerStagger} initial="hidden" animate="show">
                  {aktivitas_terbaru.map((item) => (
                    <motion.tr
                      key={item.peminjaman_id}
                      variants={fadeUpItem}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors duration-400"
                    >
                      <td className="py-3 text-[#2B3674] font-medium">{item.Equipment?.nama}</td>
                      <td className="py-3 text-[#2B3674]">{formatTanggal(item.tanggal_pinjam)}</td>
                      <td className="py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLE[item.status] || 'bg-gray-50 text-gray-500'
                            }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Tren Peminjaman Bulanan */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.28, ease: SMOOTH_EASE }}
        className="bg-white rounded-2xl p-6 shadow-sm mb-6"
      >
        <h2 className="font-bold text-[#2B3674] mb-1">Tren Peminjaman Bulanan</h2>
        <p className="text-sm text-[#8789C0] mb-6">
          {isAdmin
            ? 'Jumlah pengajuan peminjaman seluruh karyawan, 12 bulan terakhir'
            : 'Jumlah pengajuan peminjaman Anda, 12 bulan terakhir'}
        </p>

        <div className="flex items-end justify-between gap-1 sm:gap-2 h-48">
  {tren_peminjaman_bulanan.map((item, index) => (
    <div
      key={`${item.bulan}-${item.tahun}-${index}`}
      className="flex-1 flex flex-col items-center gap-1 sm:gap-2 h-full justify-end"
    >
      <span className="text-[10px] sm:text-xs font-semibold text-[#2B3674]">{item.jumlah}</span>
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: `${Math.max((item.jumlah / maxTren) * 100, 2)}%` }}
        transition={{ duration: 0.9, ease: SMOOTH_EASE, delay: index * 0.04 }}
        whileHover={{ scaleY: 1.03 }}
        className="w-full max-w-5 sm:max-w-9 bg-[#003399] rounded-md origin-bottom"
      />
      <span className="text-[10px] sm:text-xs text-[#8789C0]">{item.bulan}</span>
    </div>
  ))}
</div>
      </motion.div>

      {/* Kondisi Barang & Barang Terpopuler */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.4, ease: SMOOTH_EASE }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6"
      >
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-[#2B3674] mb-5">Kondisi Barang Keseluruhan</h2>
          <div className="space-y-4">
            {[...kondisi_barang]
              .sort((a, b) => kondisiSortIndex(a.kondisi) - kondisiSortIndex(b.kondisi))
              .map((item, index) => (
                <div key={item.kondisi}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-[#2B3674] font-medium capitalize">
                      {kondisiLabel(item.kondisi)}
                    </span>
                    <span className="text-[#8789C0]">
                      {item.jumlah} ({item.persentase}%)
                    </span>
                  </div>
                  <ProgressBar
                    colorClass={KONDISI_BAR_COLOR[item.kondisi?.toLowerCase()] || 'bg-gray-400'}
                    percentage={item.persentase}
                    delay={index * 0.1}
                  />
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-[#2B3674] mb-5">Barang Terpopuler</h2>
          <div className="space-y-4">
            {barang_terpopuler.map((item, index) => (
              <div key={item.kode_barang}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-[#2B3674] font-medium">{item.nama}</span>
                  <span className="text-[#8789C0]">{item.jumlah}x</span>
                </div>
                <ProgressBar
                  colorClass="bg-[#F75807]"
                  percentage={(item.jumlah / maxTerpopuler) * 100}
                  delay={index * 0.1}
                />
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.52, ease: SMOOTH_EASE }}
        className={`grid grid-cols-1 ${!isAdmin ? 'sm:grid-cols-2' : ''} gap-5`}
      >
        {!isAdmin && (
          <motion.button
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 180, damping: 22 }}
            onClick={() => navigate('/daftar-barang')}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-shadow duration-500 flex items-center gap-4 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <PackagePlus size={22} className="text-[#003399]" />
            </div>
            <div>
              <p className="font-bold text-[#2B3674]">Ajukan Peminjaman Baru</p>
              <p className="text-sm text-[#8789C0]">Cari barang yang ingin dipinjam</p>
            </div>
          </motion.button>
        )}

        <motion.button
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 180, damping: 22 }}
          onClick={() => navigate(riwayatPath)}
          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-shadow duration-500 flex items-center gap-4 text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <FileOutput size={22} className="text-[#003399]" />
          </div>
          <div>
            <p className="font-bold text-[#2B3674]">Lihat Semua Riwayat</p>
            <p className="text-sm text-[#8789C0]">
              {isAdmin ? 'Riwayat peminjaman seluruh karyawan' : 'Riwayat peminjaman Anda'}
            </p>
          </div>
        </motion.button>
      </motion.div>
    </MainLayout>
  );
}