const { Equipment } = require('../models');
const { Op } = require('sequelize');

// Get Daftar Barang (list + search + pagination)
exports.getAllEquipment = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 9, status } = req.query;

    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where.nama = { [Op.like]: `%${search}%` };
    }
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Equipment.findAndCountAll({
      where,
      order: [['kode_barang', 'ASC']],
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

// Get Detail Barang By Id
exports.getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findByPk(id);

    if (!equipment) {
      return res.status(404).json({ message: 'Barang tidak ditemukan' });
    }

    res.json({ data: equipment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Add Barang (admin only, kode_barang auto generate)
exports.createEquipment = async (req, res) => {
  try {
    const { nama, kondisi, deskripsi } = req.body;

    if (!nama) {
      return res.status(400).json({ message: 'Nama barang wajib diisi' });
    }

    // Cari kode_barang terakhir, urutkan dari nomor terbesar
    const lastEquipment = await Equipment.findOne({
      order: [['equipment_id', 'DESC']],
    });

    let nextNumber = 1;
    if (lastEquipment) {
      const lastNumber = parseInt(lastEquipment.kode_barang.split('-')[1], 10);
      nextNumber = lastNumber + 1;
    }

    const kodeBarang = `BRNG-${String(nextNumber).padStart(3, '0')}`;

    const equipment = await Equipment.create({
      kode_barang: kodeBarang,
      nama,
      kondisi: kondisi || 'baik',
      deskripsi,
    });

    res.status(201).json({ message: 'Barang berhasil ditambahkan', data: equipment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Update Barang (admin only)
exports.updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, kondisi, status, deskripsi } = req.body;

    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      return res.status(404).json({ message: 'Barang tidak ditemukan' });
    }

    await equipment.update({
      nama: nama ?? equipment.nama,
      kondisi: kondisi ?? equipment.kondisi,
      status: status ?? equipment.status,
      deskripsi: deskripsi ?? equipment.deskripsi,
    });

    res.json({ message: 'Barang berhasil diperbarui', data: equipment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Hapus Barang (admin only)
exports.deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      return res.status(404).json({ message: 'Barang tidak ditemukan' });
    }

    if (equipment.status === 'dipinjam') {
      return res.status(400).json({ message: 'Barang sedang dipinjam, tidak bisa dihapus' });
    }

    await equipment.destroy();

    res.json({ message: 'Barang berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};