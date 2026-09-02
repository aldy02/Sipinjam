const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const path = require('path')

const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const peminjamanRoutes = require('./routes/peminjamanRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/peminjaman', peminjamanRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('Koneksi database berhasil');
    app.listen(PORT, () => {
      console.log(`Server berjalan di port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Gagal konek ke database:', err);
  });