/**
 * @fileoverview Profile service for managing search queries and history.
 * @module services/profileService
 */

const userRepository = require('../repositories/userRepository');

/**
 * Profile service class.
 * @class ProfileService
 */
class ProfileService {
  /**
   * Save a search query for a user.
   * @async
   * @param {number} userId - User's ID.
   * @param {string} query - Search query.
   * @returns {Promise<void>}
   */
  async saveSearchQuery(userId, query) {
    if (!query) return;
    await userRepository.saveSearchQuery(userId, query);
  }

  /**
   * Retrieve a user's search history.
   * @async
   * @param {number} userId - User's ID.
   * @returns {Promise<Array<Object>>} Array of search history entries.
   */
  async getSearchHistory(userId) {
    return userRepository.getSearchHistory(userId);
  }
}

module.exports = new ProfileService();