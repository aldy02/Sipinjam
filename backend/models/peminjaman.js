const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Peminjaman = sequelize.define('Peminjaman', {
  peminjaman_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  kode_peminjaman: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  equipment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  kondisi_saat_pinjam: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  kondisi_saat_kembali: {
    type: DataTypes.STRING(50),
  },
  lokasi_pickup: {
    type: DataTypes.STRING(150),
  },
  lokasi_pemakaian: {
    type: DataTypes.STRING(150),
  },
  lokasi_kembali: {
    type: DataTypes.STRING(150),
  },
  foto_bukti_kembali: {
  type: DataTypes.STRING(255),
},
  tanggal_pinjam: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  tanggal_rencana_kembali: {
    type: DataTypes.DATE,
  },
  tanggal_aktual_kembali: {
    type: DataTypes.DATE,
  },
  status: {
    type: DataTypes.ENUM('dipinjam', 'dikembalikan'),
    allowNull: false,
    defaultValue: 'dipinjam',
  },
  keterangan: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'peminjaman',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Peminjaman;