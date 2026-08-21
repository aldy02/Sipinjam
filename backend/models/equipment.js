const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Equipment = sequelize.define('Equipment', {
  equipment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  kode_barang: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  nama: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  kondisi: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'baik',
  },
  status: {
    type: DataTypes.ENUM('tersedia', 'dipinjam', 'maintenance'),
    allowNull: false,
    defaultValue: 'tersedia',
  },
  deskripsi: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'equipment',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Equipment;