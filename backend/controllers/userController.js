const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { Op } = require('sequelize');

// Get Daftar Akun (List, Search, and Pagination)
exports.getAllUsers = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10, role } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { nama: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { nok: { [Op.like]: `%${search}%` } },
      ];
    }
    if (role) {
      where.role = role;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: ['user_id', 'nama', 'nok', 'email', 'jabatan', 'role', 'created_at'],
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

// Get Detail Akun by Id
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: ['user_id', 'nama', 'nok', 'email', 'jabatan', 'role', 'created_at'],
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
    const { nama, nok, email, jabatan, password, role } = req.body;

    if (!nama || !nok || !email || !password) {
      return res.status(400).json({ message: 'Nama, NOK, email, dan password wajib diisi' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter' });
    }

    if (role && !['karyawan', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role tidak valid' });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    const existingNok = await User.findOne({ where: { nok } });
    if (existingNok) {
      return res.status(400).json({ message: 'NOK sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      nama,
      nok,
      email,
      jabatan,
      password: hashedPassword,
      role: role || 'karyawan',
    });

    res.status(201).json({
      message: 'Akun berhasil ditambahkan',
      data: {
        user_id: user.user_id,
        nama: user.nama,
        nok: user.nok,
        email: user.email,
        jabatan: user.jabatan,
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
    const { nama, nok, email, jabatan, role } = req.body;

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

    if (nok && nok !== user.nok) {
      const existingNok = await User.findOne({ where: { nok } });
      if (existingNok) {
        return res.status(400).json({ message: 'NOK sudah digunakan oleh akun lain' });
      }
    }

    await user.update({
      nama: nama ?? user.nama,
      nok: nok ?? user.nok,
      email: email ?? user.email,
      jabatan: jabatan ?? user.jabatan,
      role: role ?? user.role,
    });

    res.json({
      message: 'Akun berhasil diperbarui',
      data: {
        user_id: user.user_id,
        nama: user.nama,
        nok: user.nok,
        email: user.email,
        jabatan: user.jabatan,
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

    if (!password_baru || password_baru.length < 6) {
      return res.status(400).json({ message: 'Password baru minimal 6 karakter' });
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

// Delete Akun
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (String(req.user.user_id) === String(id)) {
      return res.status(400).json({ message: 'Tidak bisa menghapus akun sendiri' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Akun tidak ditemukan' });
    }

    await user.destroy();

    res.json({ message: 'Akun berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};