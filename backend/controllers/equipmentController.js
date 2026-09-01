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

// Add Barang (admin only, kode_barang di input admin)
exports.createEquipment = async (req, res) => {
  try {
    const { kode_barang, nama, kondisi, deskripsi } = req.body;

    if (!nama || !kode_barang) {
      return res.status(400).json({ message: 'Kode barang dan nama barang wajib diisi' });
    }

    const existingKode = await Equipment.findOne({ where: { kode_barang } });
    if (existingKode) {
      return res.status(400).json({ message: 'Kode barang sudah digunakan' });
    }

    const equipment = await Equipment.create({
      kode_barang,
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
    const { kode_barang, nama, kondisi, status, deskripsi } = req.body;

    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      return res.status(404).json({ message: 'Barang tidak ditemukan' });
    }

    if (kode_barang && kode_barang !== equipment.kode_barang) {
      const existingKode = await Equipment.findOne({ where: { kode_barang } });
      if (existingKode) {
        return res.status(400).json({ message: 'Kode barang sudah digunakan oleh barang lain' });
      }
    }

    await equipment.update({
      kode_barang: kode_barang ?? equipment.kode_barang,
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