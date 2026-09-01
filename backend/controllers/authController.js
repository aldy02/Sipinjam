const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');
const { Op } = require('sequelize');
const transporter = require('../config/mailer');
require('dotenv').config();

// Sign Up
exports.signup = async (req, res) => {
  try {
    const { nama, npk, email, jabatan, pe_pabrik, password } = req.body;

    if (!nama || !npk || !email || !password) {
      return res.status(400).json({ message: 'Field wajib tidak boleh kosong' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password minimal 8 karakter' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    const existingNpk = await User.findOne({ where: { npk } });
    if (existingNpk) {
      return res.status(400).json({ message: 'NPK sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ nama, npk, email, jabatan, pe_pabrik, password: hashedPassword });

    res.status(201).json({ message: 'Registrasi berhasil', user_id: user.user_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Email atau password salah' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email atau password salah' });
    }

    // Non Aktif Akun
    if (!user.is_active) {
      return res.status(403).json({ message: 'Akun ini telah dinonaktifkan. Hubungi administrator.' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Set token sebagai httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login berhasil',
      user: {
        user_id: user.user_id,
        nama: user.nama,
        npk: user.npk,
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

// Logout
exports.logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });
  res.json({ message: 'Logout berhasil' });
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    // Selalu return sukses walau email tidak ditemukan (menghindari enumeration attack)
    if (!user) {
      return res.json({ message: 'Permintaan reset password telah diproses. Silakan cek email Anda.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); // Expires 15 menit

    await user.update({ reset_token: token, reset_token_expires: expires });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    await transporter.sendMail({
      from: `"SIPINJAM" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Password SIPINJAM',
      html: `
        <p>Halo ${user.nama},</p>
        <p>Kami menerima permintaan untuk mengatur ulang password akun SIPINJAM Anda.</p>
        <p>Klik tombol berikut untuk membuat password baru:</p>
        <p>
          <a href="${resetLink}">Reset Password</a>
        </p>
        <p>Link ini berlaku selama 15 menit.</p>
        <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
        <p>Salam,<br><strong>SIPINJAM PPE - PT Pupuk Kalimantan Timur</strong></p>
      `,
    });

    res.json({ message: 'Permintaan reset password telah diproses. Silakan cek email Anda.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token tidak valid atau sudah kadaluarsa' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await user.update({
      password: hashedPassword,
      reset_token: null,
      reset_token_expires: null,
    });

    res.json({ message: 'Password berhasil diubah, silakan login' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id, {
      attributes: ['user_id', 'nama', 'npk', 'email', 'jabatan', 'pe_pabrik', 'role'],
    });

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json({ data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { nama, npk, email, jabatan, pe_pabrik } = req.body;

    if (!nama || !npk || !email) {
      return res.status(400).json({ message: 'Nama, NPK, dan email wajib diisi' });
    }

    const user = await User.findByPk(req.user.user_id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Check email saat diganti tidak bentrok dengan user lain
    if (email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email sudah digunakan oleh akun lain' });
      }
    }

    // Check NpK saat diganti tidak bentrok dengan user lain
    if (npk !== user.npk) {
      const existingNpk = await User.findOne({ where: { npk } });
      if (existingNpk) {
        return res.status(400).json({ message: 'NPK sudah digunakan oleh akun lain' });
      }
    }

    await user.update({
      nama,
      npk,
      email,
      jabatan: jabatan ?? user.jabatan,
      pe_pabrik: pe_pabrik ?? user.pe_pabrik,
    });

    res.json({
      message: 'Profil berhasil diperbarui',
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

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { password_lama, password_baru, konfirmasi_password_baru } = req.body;

    if (!password_lama || !password_baru || !konfirmasi_password_baru) {
      return res.status(400).json({ message: 'Semua field password wajib diisi' });
    }

    if (password_baru.length < 8) {
      return res.status(400).json({ message: 'Password baru minimal 8 karakter' });
    }

    if (password_baru !== konfirmasi_password_baru) {
      return res.status(400).json({ message: 'Konfirmasi password baru tidak sama' });
    }

    const user = await User.findByPk(req.user.user_id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const isMatch = await bcrypt.compare(password_lama, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Kata sandi saat ini salah' });
    }

    const isSameAsOld = await bcrypt.compare(password_baru, user.password);
    if (isSameAsOld) {
      return res.status(400).json({ message: 'Password baru tidak boleh sama dengan password lama' });
    }

    const hashedPassword = await bcrypt.hash(password_baru, 10);
    await user.update({ password: hashedPassword });

    res.json({ message: 'Kata sandi berhasil diubah' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Check Login Status When App Open For The First Time
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id, {
      attributes: ['user_id', 'nama', 'npk', 'email', 'jabatan', 'role'],
    });

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json({ data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};