const { Peminjaman, Equipment, User } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const WITA_OFFSET_MS = 8 * 60 * 60 * 1000;

// Set Timezone
function nowInWITA() {
  return new Date(Date.now() + WITA_OFFSET_MS);
}

function startOfTodayWITA() {
  const wita = nowInWITA();
  const y = wita.getUTCFullYear();
  const m = wita.getUTCMonth();
  const d = wita.getUTCDate();
  return new Date(Date.UTC(y, m, d, 0, 0, 0) - WITA_OFFSET_MS);
}

function toWITADateOnly(date) {
  const shifted = new Date(date.getTime() + WITA_OFFSET_MS);
  return new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()));
}

exports.getDashboard = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const userId = req.user.user_id;
    const now = nowInWITA(); // Hitung 12 bulan tren dalam wita

    const startOfToday = startOfTodayWITA();

    // Filter: karyawan hanya lihat datanya sendiri, admin lihat semua
    const peminjamanWhere = isAdmin ? {} : { user_id: userId };

    // Stat Cards
    const sedangDipinjamCount = await Peminjaman.count({
      where: { ...peminjamanWhere, status: 'dipinjam' },
    });

    const totalRiwayatCount = await Peminjaman.count({ where: peminjamanWhere });

    const terlambatCount = await Peminjaman.count({
      where: {
        ...peminjamanWhere,
        status: 'dipinjam',
        tanggal_rencana_kembali: { [Op.lt]: startOfToday },
      },
    });

    // Barang tersedia
    const barangTersediaCount = await Equipment.count({ where: { status: 'tersedia' } });

    // Ketepatan kembali & rata-rata lama pinjam, dihitung dari data yang sudah dikembalikan
    const dikembalikanList = await Peminjaman.findAll({
      where: { ...peminjamanWhere, status: 'dikembalikan' },
      attributes: ['tanggal_pinjam', 'tanggal_rencana_kembali', 'tanggal_aktual_kembali'],
      raw: true,
    });

    let tepatWaktuCount = 0;
    let totalDurasiHari = 0;
    let validDurasiCount = 0;

    dikembalikanList.forEach((p) => {
      if (p.tanggal_rencana_kembali && p.tanggal_aktual_kembali) {
        // Normalisasi ke tanggal WITA
        const aktual = toWITADateOnly(new Date(p.tanggal_aktual_kembali));
        const rencana = toWITADateOnly(new Date(p.tanggal_rencana_kembali));

        if (aktual <= rencana) {
          tepatWaktuCount += 1;
        }
      }
      if (p.tanggal_pinjam && p.tanggal_aktual_kembali) {
        const durasi = Math.round(
          (new Date(p.tanggal_aktual_kembali) - new Date(p.tanggal_pinjam)) / (1000 * 60 * 60 * 24)
        );
        totalDurasiHari += durasi;
        validDurasiCount += 1;
      }
    });

    const tingkatKetepatan =
      dikembalikanList.length > 0 ? Math.round((tepatWaktuCount / dikembalikanList.length) * 100) : 0;

    const rataRataLamaPinjam =
      validDurasiCount > 0 ? Math.round(totalDurasiHari / validDurasiCount) : 0;

    // Notifikasi khusus karyawan, kalau ada barang terlambat
    let notifikasi = null;
    if (!isAdmin && terlambatCount > 0) {
      notifikasi = {
        jumlah: terlambatCount,
        pesan: `${terlambatCount} barang belum dikembalikan setelah tanggal rencana`,
      };
    }

    // List Sedang Dipinjam
    const sedangDipinjamList = await Peminjaman.findAll({
      where: { ...peminjamanWhere, status: 'dipinjam' },
      include: [
        { model: Equipment, attributes: ['equipment_id', 'kode_barang', 'nama'] },
        ...(isAdmin ? [{ model: User, attributes: ['user_id', 'nama'] }] : []),
      ],
      order: [['tanggal_rencana_kembali', 'ASC']],
      limit: 5,
    });

    // Aktivitas Terbaru
    const aktivitasTerbaru = await Peminjaman.findAll({
      where: peminjamanWhere,
      include: [
        { model: Equipment, attributes: ['equipment_id', 'kode_barang', 'nama'] },
        ...(isAdmin ? [{ model: User, attributes: ['user_id', 'nama'] }] : []),
      ],
      order: [['tanggal_pinjam', 'DESC']],
      limit: 5,
    });

    // Trend Peminjaman Bulanan
    const twelveMonthsAgoStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1) - WITA_OFFSET_MS);
    const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1) - WITA_OFFSET_MS);

    const trenRaw = await Peminjaman.findAll({
      where: {
        ...peminjamanWhere,
        tanggal_pinjam: {
          [Op.gte]: twelveMonthsAgoStart,
          [Op.lt]: nextMonthStart,
        },
      },
      attributes: [
        [fn('DATE_FORMAT', col('tanggal_pinjam'), '%Y-%m'), 'periode'],
        [fn('COUNT', col('peminjaman_id')), 'jumlah'],
      ],
      group: [fn('DATE_FORMAT', col('tanggal_pinjam'), '%Y-%m')],
      raw: true,
    });

    const trenMap = {};
    trenRaw.forEach((row) => {
      trenMap[row.periode] = parseInt(row.jumlah, 10);
    });

    const trenPeminjamanBulanan = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const periode = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      trenPeminjamanBulanan.push({
        bulan: MONTH_LABELS[d.getUTCMonth()],
        tahun: d.getUTCFullYear(),
        jumlah: trenMap[periode] || 0,
      });
    }

    // Kondisi Barang
    const totalEquipment = await Equipment.count();

    const kondisiRaw = await Equipment.findAll({
      attributes: ['kondisi', [fn('COUNT', col('equipment_id')), 'jumlah']],
      group: ['kondisi'],
      raw: true,
    });

    const kondisiBarang = kondisiRaw.map((row) => ({
      kondisi: row.kondisi,
      jumlah: parseInt(row.jumlah, 10),
      persentase: totalEquipment > 0 ? Math.round((row.jumlah / totalEquipment) * 100) : 0,
    }));

    // Barang terpopuler
    const terpopulerRaw = await Peminjaman.findAll({
      attributes: ['equipment_id', [fn('COUNT', col('Peminjaman.peminjaman_id')), 'jumlah']],
      include: [{ model: Equipment, attributes: ['nama', 'kode_barang'] }],
      group: ['equipment_id', 'Equipment.equipment_id'],
      order: [[literal('jumlah'), 'DESC']],
      limit: 5,
      subQuery: false,
    });

    const barangTerpopuler = terpopulerRaw.map((row) => ({
      nama: row.Equipment?.nama,
      kode_barang: row.Equipment?.kode_barang,
      jumlah: parseInt(row.get('jumlah'), 10),
    }));

    res.json({
      data: {
        role: req.user.role,
        notifikasi,
        stats: {
          sedang_dipinjam: sedangDipinjamCount,
          total_riwayat_peminjaman: totalRiwayatCount,
          terlambat_dikembalikan: terlambatCount,
          barang_tersedia: barangTersediaCount,
          tingkat_ketepatan_kembali: tingkatKetepatan,
          rata_rata_lama_pinjam: rataRataLamaPinjam,
        },
        sedang_dipinjam_list: sedangDipinjamList,
        aktivitas_terbaru: aktivitasTerbaru,
        tren_peminjaman_bulanan: trenPeminjamanBulanan,
        kondisi_barang: kondisiBarang,
        barang_terpopuler: barangTerpopuler,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};