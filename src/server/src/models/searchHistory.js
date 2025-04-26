const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const User = require('./user');

const SearchHistory = sequelize.define('SearchHistory', {
  query: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'userId',
    references: {
      model: User,
      key: 'id',
    },
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

User.hasMany(SearchHistory, { foreignKey: 'userId' });
SearchHistory.belongsTo(User, { foreignKey: 'userId' });

module.exports = SearchHistory;