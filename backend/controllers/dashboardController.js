const { Peminjaman, Equipment, User } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

exports.getDashboard = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const userId = req.user.user_id;
    const now = new Date();

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
        tanggal_rencana_kembali: { [Op.lt]: now },
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
        if (new Date(p.tanggal_aktual_kembali) <= new Date(p.tanggal_rencana_kembali)) {
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
    const currentYear = now.getFullYear();
    const trenRaw = await Peminjaman.findAll({
      where: {
        ...peminjamanWhere,
        tanggal_pinjam: {
          [Op.gte]: new Date(`${currentYear}-01-01`),
          [Op.lt]: new Date(`${currentYear + 1}-01-01`),
        },
      },
      attributes: [
        [fn('MONTH', col('tanggal_pinjam')), 'bulan'],
        [fn('COUNT', col('peminjaman_id')), 'jumlah'],
      ],
      group: [fn('MONTH', col('tanggal_pinjam'))],
      raw: true,
    });

    const trenMap = {};
    trenRaw.forEach((row) => {
      trenMap[row.bulan] = parseInt(row.jumlah, 10);
    });

    const trenPeminjamanBulanan = MONTH_LABELS.map((label, index) => ({
      bulan: label,
      jumlah: trenMap[index + 1] || 0,
    }));

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