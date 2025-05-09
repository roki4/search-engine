/**
 * @fileoverview Sequelize model for search history.
 * @module models/searchHistory
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const User = require('./user');

/**
 * SearchHistory model definition.
 * @type {Object}
 */
const SearchHistory = sequelize.define('SearchHistory', {
  /**
   * Search query.
   * @type {string}
   */
  query: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  /**
   * User ID (foreign key).
   * @type {number}
   */
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'userId',
    references: {
      model: User,
      key: 'id',
    },
  },
  /**
   * Creation timestamp.
   * @type {Date}
   */
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  /**
   * Update timestamp.
   * @type {Date}
   */
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

// Associations
User.hasMany(SearchHistory, { foreignKey: 'userId' });
SearchHistory.belongsTo(User, { foreignKey: 'userId' });

module.exports = SearchHistory;
