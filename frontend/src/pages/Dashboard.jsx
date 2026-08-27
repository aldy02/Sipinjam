import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const KONDISI_BAR_COLOR = {
  baik: 'bg-[#1F9254]',
  'rusak ringan': 'bg-[#F79009]',
  'rusak berat': 'bg-[#A30D11]',
  hilang: 'bg-gray-400',
};

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

function StatCard({ icon, iconBg, iconColor, value, label }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <div className={iconColor}>{icon}</div>
      </div>
      <div>
        <p className="text-2xl font-bold text-[#2B3674]">{value}</p>
        <p className="text-sm text-[#8789C0]">{label}</p>
      </div>
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
        <div className="bg-white rounded-2xl p-8 text-center text-[#A3AED0] shadow-sm">
          Memuat data...
        </div>
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
      {notifikasi && (
        <div className="bg-red-50 border-red-300 border rounded-2xl p-5 mb-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700">{notifikasi.pesan}</p>
              <p className="text-sm text-red-600">
                Segera kembalikan barang untuk menghindari keterlambatan lebih lama.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(riwayatPath)}
            className="flex items-center gap-1 text-sm font-semibold text-red-700 shrink-0 hover:underline"
          >
            Lihat <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
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
      </div>

      {/* Sedang Dipinjam & Aktivitas Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
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
            <div className="space-y-3">
              {sedang_dipinjam_list.map((item) => {
                const badge = getDueBadge(item.tanggal_rencana_kembali);
                return (
                  <div
                    key={item.peminjaman_id}
                    className="border border-gray-100 rounded-xl p-4 flex items-start justify-between gap-3"
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
                  </div>
                );
              })}
            </div>
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
                <tbody>
                  {aktivitas_terbaru.map((item) => (
                    <tr key={item.peminjaman_id} className="border-b border-gray-50 last:border-0">
                      <td className="py-3 text-[#2B3674] font-medium">{item.Equipment?.nama}</td>
                      <td className="py-3 text-[#2B3674]">{formatTanggal(item.tanggal_pinjam)}</td>
                      <td className="py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            STATUS_STYLE[item.status] || 'bg-gray-50 text-gray-500'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Trend Peminjaman Bulanan */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="font-bold text-[#2B3674] mb-1">Tren Peminjaman Bulanan</h2>
        <p className="text-sm text-[#8789C0] mb-6">
          {isAdmin
            ? 'Jumlah pengajuan peminjaman seluruh karyawan, 12 bulan terakhir'
            : 'Jumlah pengajuan peminjaman Anda, 12 bulan terakhir'}
        </p>

        <div className="flex items-end justify-between gap-2 h-48">
          {tren_peminjaman_bulanan.map((item, index) => (
            <div
              key={`${item.bulan}-${item.tahun}-${index}`}
              className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
            >
              <span className="text-xs font-semibold text-[#2B3674]">{item.jumlah}</span>
              <div
                className="w-full max-w-9 bg-[#003399] rounded-md transition-all"
                style={{
                  height: `${Math.max((item.jumlah / maxTren) * 100, 2)}%`,
                }}
              />
              <span className="text-xs text-[#8789C0]">{item.bulan}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Kondisi Barang & Barang Terpopuler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-[#2B3674] mb-5">Kondisi Barang Keseluruhan</h2>
          <div className="space-y-4">
            {kondisi_barang.map((item) => (
              <div key={item.kondisi}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-[#2B3674] font-medium capitalize">{item.kondisi}</span>
                  <span className="text-[#8789C0]">
                    {item.jumlah} ({item.persentase}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${KONDISI_BAR_COLOR[item.kondisi] || 'bg-gray-400'}`}
                    style={{ width: `${item.persentase}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-[#2B3674] mb-5">Barang Terpopuler</h2>
          <div className="space-y-4">
            {barang_terpopuler.map((item) => (
              <div key={item.kode_barang}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-[#2B3674] font-medium">{item.nama}</span>
                  <span className="text-[#8789C0]">{item.jumlah}x</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#F75807]"
                    style={{ width: `${(item.jumlah / maxTerpopuler) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`grid grid-cols-1 ${!isAdmin ? 'sm:grid-cols-2' : ''} gap-5`}>
        {!isAdmin && (
          <button
            onClick={() => navigate('/daftar-barang')}
            className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4 text-left hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <PackagePlus size={22} className="text-[#003399]" />
            </div>
            <div>
              <p className="font-bold text-[#2B3674]">Ajukan Peminjaman Baru</p>
              <p className="text-sm text-[#8789C0]">Cari barang yang ingin dipinjam</p>
            </div>
          </button>
        )}

        <button
          onClick={() => navigate(riwayatPath)}
          className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4 text-left hover:shadow-md transition-shadow"
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
        </button>
      </div>
    </MainLayout>
  );
}