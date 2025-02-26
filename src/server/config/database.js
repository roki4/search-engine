const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('quirk_search', 'postgres', 'markg', {
  host: 'localhost',
  dialect: 'postgres',
});

module.exports = sequelize;
