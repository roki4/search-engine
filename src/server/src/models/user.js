/**
 * @fileoverview Sequelize model for users.
 * @module models/user
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * User model definition.
 * @type {Object}
 */
const User = sequelize.define('User', {
  /**
   * User ID (primary key).
   * @type {number}
   */
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  /**
   * User's name.
   * @type {string}
   */
  name: { type: DataTypes.STRING, allowNull: false },
  /**
   * User's surname.
   * @type {string}
   */
  surname: { type: DataTypes.STRING, allowNull: false },
  /**
   * User's email (unique).
   * @type {string}
   */
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  /**
   * User's hashed password.
   * @type {string}
   */
  password: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: true });

module.exports = User;