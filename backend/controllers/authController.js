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
    const { nama, nok, email, jabatan, password } = req.body;

    if (!nama || !nok || !email || !password) {
      return res.status(400).json({ message: 'Field wajib tidak boleh kosong' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    const existingNok = await User.findOne({ where: { nok } });
    if (existingNok) {
      return res.status(400).json({ message: 'NOK sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ nama, nok, email, jabatan, password: hashedPassword });

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

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        user_id: user.user_id,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
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