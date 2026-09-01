const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nama: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  npk: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
  },
  jabatan: {
    type: DataTypes.STRING(100),
  },
    pe_pabrik: {
    type: DataTypes.ENUM('Pabrik-2', 'Pabrik-3', 'Pabrik-4', 'Pabrik-1A', 'Pabrik-5', 'Pabrik-6', 'PHP'),
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('karyawan', 'admin'),
    allowNull: false,
    defaultValue: 'karyawan',
  },
  reset_token: {
    type: DataTypes.STRING(255),
  },
  reset_token_expires: {
    type: DataTypes.DATE,
  },
    is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'user',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = User;