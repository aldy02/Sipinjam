const { Peminjaman, Equipment, User } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path')

// Generate kode peminjaman format: PJM-YYYYMMDD-XXX
const generateKodePeminjaman = async () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const datePart = `${yyyy}${mm}${dd}`;

  const lastToday = await Peminjaman.findOne({
    where: { kode_peminjaman: { [Op.like]: `PJM-${datePart}-%` } },
    order: [['peminjaman_id', 'DESC']],
  });

  let nextNumber = 1;
  if (lastToday) {
    const lastNumber = parseInt(lastToday.kode_peminjaman.split('-')[2], 10);
    nextNumber = lastNumber + 1;
  }

  return `PJM-${datePart}-${String(nextNumber).padStart(3, '0')}`;
};

// Ajukan peminjaman (Form Peminjaman Barang)
exports.createPeminjaman = async (req, res) => {
  try {
    const {
      equipment_id,
      lokasi_pickup,
      lokasi_pemakaian,
      tanggal_rencana_kembali,
      keterangan,
    } = req.body;

    if (!equipment_id) {
      return res.status(400).json({ message: 'Barang wajib dipilih' });
    }

    const equipment = await Equipment.findByPk(equipment_id);
    if (!equipment) {
      return res.status(404).json({ message: 'Barang tidak ditemukan' });
    }

    if (equipment.status !== 'tersedia') {
      return res.status(400).json({ message: 'Barang sedang tidak tersedia untuk dipinjam' });
    }

    const kodePeminjaman = await generateKodePeminjaman();

    const peminjaman = await Peminjaman.create({
      kode_peminjaman: kodePeminjaman,
      user_id: req.user.user_id,
      equipment_id,
      kondisi_saat_pinjam: equipment.kondisi,
      lokasi_pickup,
      lokasi_pemakaian,
      tanggal_rencana_kembali,
      keterangan,
      status: 'dipinjam',
    });

    // Update status barang jadi dipinjam
    await equipment.update({ status: 'dipinjam' });

    res.status(201).json({ message: 'Peminjaman berhasil diajukan', data: peminjaman });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Daftar Peminjaman (admin lihat semua, karyawan lihat punya sendiri)
exports.getAllPeminjaman = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    const isAdmin = req.user.role === 'admin';

    const where = {};
    if (!isAdmin) {
      where.user_id = req.user.user_id; // Karyawan only
    }
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Peminjaman.findAndCountAll({
      where,
      include: [
        { model: Equipment, attributes: ['equipment_id', 'kode_barang', 'nama'] },
        { model: User, attributes: ['user_id', 'nama', 'npk', 'email'] },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      data: rows,
      pagination: {
        total: count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Detail Peminjaman
exports.getPeminjamanById = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'admin';

    const peminjaman = await Peminjaman.findByPk(id, {
      include: [
        { model: Equipment, attributes: ['equipment_id', 'kode_barang', 'nama'] },
        { model: User, attributes: ['user_id', 'nama', 'npk', 'email'] },
      ],
    });

    if (!peminjaman) {
      return res.status(404).json({ message: 'Data peminjaman tidak ditemukan' });
    }

    // karyawan cuma boleh lihat peminjamannya sendiri (prevention)
    if (!isAdmin && peminjaman.user_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Anda tidak memiliki akses ke data ini' });
    }

    res.json({ data: peminjaman });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Kembalikan Barang
exports.kembalikanBarang = async (req, res) => {
  try {
    const { id } = req.params;
    const { kondisi_saat_kembali, lokasi_kembali, keterangan } = req.body;
    const isAdmin = req.user.role === 'admin';

    if (!kondisi_saat_kembali) {
      // Hapus file yang sudah terlanjur di-upload kalau validasi lain gagal
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Kondisi saat kembali wajib diisi' });
    }

    const peminjaman = await Peminjaman.findByPk(id, { include: [Equipment] });

    if (!peminjaman) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Data peminjaman tidak ditemukan' });
    }

    if (!isAdmin && peminjaman.user_id !== req.user.user_id) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(403).json({ message: 'Anda tidak memiliki akses ke data ini' });
    }

    if (peminjaman.status === 'dikembalikan') {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Barang ini sudah dikembalikan sebelumnya' });
    }

    const fotoBuktiKembali = req.file
      ? `/uploads/bukti-pengembalian/${req.file.filename}`
      : peminjaman.foto_bukti_kembali;

    await peminjaman.update({
      kondisi_saat_kembali,
      lokasi_kembali,
      keterangan: keterangan ?? peminjaman.keterangan,
      foto_bukti_kembali: fotoBuktiKembali,
      tanggal_aktual_kembali: new Date(),
      status: 'dikembalikan',
    });

    // Update kondisi & status barang kembali tersedia
    await peminjaman.Equipment.update({
      kondisi: kondisi_saat_kembali,
      status: 'tersedia',
    });

    res.json({ message: 'Barang berhasil dikembalikan', data: peminjaman });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};