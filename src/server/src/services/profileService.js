const userRepository = require('../repositories/userRepository');

class ProfileService {
  async saveSearchQuery(userId, query) {
    if (!query) return;
    await userRepository.saveSearchQuery(userId, query);
  }

  async getSearchHistory(userId) {
    return userRepository.getSearchHistory(userId);
  }
}

module.exports = new ProfileService();