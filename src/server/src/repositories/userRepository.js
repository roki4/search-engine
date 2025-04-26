/**
 * @fileoverview Repository for user-related database operations.
 * @module repositories/userRepository
 */

const User = require('../models/user');
const SearchHistory = require('../models/searchHistory');

/**
 * User repository class for handling user and search history operations.
 * @class UserRepository
 */
class UserRepository {
  /**
   * Find a user by email.
   * @async
   * @param {string} email - User's email.
   * @returns {Promise<Object|null>} User object or null if not found.
   */
  async findByEmail(email) {
    return User.findOne({ where: { email } });
  }

  /**
   * Find a user by ID.
   * @async
   * @param {number} id - User's ID.
   * @returns {Promise<Object|null>} User object or null if not found.
   */
  async findById(id) {
    return await User.findByPk(id);
  }

  /**
   * Create a new user.
   * @async
   * @param {Object} userData - User data.
   * @param {string} userData.name - User's name.
   * @param {string} userData.surname - User's surname.
   * @param {string} userData.email - User's email.
   * @param {string} userData.password - Hashed password.
   * @returns {Promise<Object>} Created user object.
   */
  async create(userData) {
    return User.create(userData);
  }

  /**
   * Update a user's password.
   * @async
   * @param {number} userId - User's ID.
   * @param {string} hashedPassword - New hashed password.
   * @returns {Promise<number>} Number of affected rows.
   */
  async updatePassword(userId, hashedPassword) {
    return User.update({ password: hashedPassword }, { where: { id: userId } });
  }

  /**
   * Save a search query for a user.
   * @async
   * @param {number} userId - User's ID.
   * @param {string} query - Search query.
   * @returns {Promise<Object>} Created search history entry.
   */
  async saveSearchQuery(userId, query) {
    return SearchHistory.create({ query, userId });
  }

  /**
   * Retrieve a user's search history.
   * @async
   * @param {number} userId - User's ID.
   * @returns {Promise<Array<Object>>} Array of search history entries.
   */
  async getSearchHistory(userId) {
    return SearchHistory.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
  }
}

module.exports = new UserRepository();