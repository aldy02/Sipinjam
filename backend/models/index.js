const sequelize = require('../config/db');
const User = require('./user');
const Equipment = require('./equipment');

module.exports = {
  sequelize,
  User,
  Equipment,
};