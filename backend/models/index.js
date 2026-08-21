const sequelize = require('../config/db');
const User = require('./user');
const Equipment = require('./equipment');
const Peminjaman = require('./peminjaman');

// Relasi
User.hasMany(Peminjaman, { foreignKey: 'user_id' });
Peminjaman.belongsTo(User, { foreignKey: 'user_id' });

Equipment.hasMany(Peminjaman, { foreignKey: 'equipment_id' });
Peminjaman.belongsTo(Equipment, { foreignKey: 'equipment_id' });

module.exports = {
  sequelize,
  User,
  Equipment,
  Peminjaman,
};