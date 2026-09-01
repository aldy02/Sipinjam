const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { Op } = require('sequelize');

// Get Daftar Akun (List, Search, and Pagination)
exports.getAllUsers = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10, role, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { nama: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { npk: { [Op.like]: `%${search}%` } },
      ];
    }
    if (role) {
      where.role = role;
    }
    if (status === 'aktif') {
      where.is_active = true;
    } else if (status === 'nonaktif') {
      where.is_active = false;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: ['user_id', 'nama', 'npk', 'email', 'jabatan', 'pe_pabrik', 'role', 'is_active', 'created_at'],
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

// Nonaktif Akun
exports.deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (String(req.user.user_id) === String(id)) {
      return res.status(400).json({ message: 'Tidak bisa menonaktifkan akun sendiri' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Akun tidak ditemukan' });
    }

    if (!user.is_active) {
      return res.status(400).json({ message: 'Akun ini sudah nonaktif' });
    }

    await user.update({ is_active: false });

    res.json({ message: 'Akun berhasil dinonaktifkan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Aktifkan Akun
exports.activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Akun tidak ditemukan' });
    }

    if (user.is_active) {
      return res.status(400).json({ message: 'Akun ini sudah aktif' });
    }

    await user.update({ is_active: true });

    res.json({ message: 'Akun berhasil diaktifkan kembali' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Get Detail Akun by Id
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: ['user_id', 'nama', 'npk', 'email', 'jabatan', 'pe_pabrik', 'role', 'created_at'],
    });

    if (!user) {
      return res.status(404).json({ message: 'Akun tidak ditemukan' });
    }

    res.json({ data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Add Akun
exports.createUser = async (req, res) => {
  try {
    const { nama, npk, email, jabatan, pe_pabrik, password, role } = req.body;

    if (!nama || !npk || !email || !password) {
      return res.status(400).json({ message: 'Nama, NPK, email, dan password wajib diisi' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password minimal 8 karakter' });
    }

    if (role && !['karyawan', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role tidak valid' });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    const existingNpk = await User.findOne({ where: { npk } });
    if (existingNpk) {
      return res.status(400).json({ message: 'NPK sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      nama,
      npk,
      email,
      jabatan,
      pe_pabrik,
      password: hashedPassword,
      role: role || 'karyawan',
    });

    res.status(201).json({
      message: 'Akun berhasil ditambahkan',
      data: {
        user_id: user.user_id,
        nama: user.nama,
        npk: user.npk,
        email: user.email,
        jabatan: user.jabatan,
        pe_pabrik: user.pe_pabrik,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Update Akun
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, npk, email, jabatan, pe_pabrik, role } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Akun tidak ditemukan' });
    }

    if (role && !['karyawan', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role tidak valid' });
    }

    // Cegah admin menurunkan role dirinya sendiri secara tidak sengaja jadi karyawan
    if (String(req.user.user_id) === String(id) && role && role !== user.role) {
      return res.status(400).json({ message: 'Tidak bisa mengubah role akun sendiri' });
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email sudah digunakan oleh akun lain' });
      }
    }

    if (npk && npk !== user.npk) {
      const existingNpk = await User.findOne({ where: { npk } });
      if (existingNpk) {
        return res.status(400).json({ message: 'NPK sudah digunakan oleh akun lain' });
      }
    }

    await user.update({
      nama: nama ?? user.nama,
      npk: npk ?? user.npk,
      email: email ?? user.email,
      jabatan: jabatan ?? user.jabatan,
      pe_pabrik: pe_pabrik ?? user.pe_pabrik,
      role: role ?? user.role,
    });

    res.json({
      message: 'Akun berhasil diperbarui',
      data: {
        user_id: user.user_id,
        nama: user.nama,
        npk: user.npk,
        email: user.email,
        jabatan: user.jabatan,
        pe_pabrik: user.pe_pabrik,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Reset Password Other Users
exports.resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password_baru } = req.body;

    if (!password_baru || password_baru.length < 8) {
      return res.status(400).json({ message: 'Password baru minimal 8 karakter' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Akun tidak ditemukan' });
    }

    const hashedPassword = await bcrypt.hash(password_baru, 10);
    await user.update({ password: hashedPassword });

    res.json({ message: 'Password akun berhasil direset' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};