const User = require('../models/user');
const SearchHistory = require('../models/searchHistory');

class UserRepository {
  async findByEmail(email) {
    return User.findOne({ where: { email } });
  }

  async findById(id) {
    return await User.findByPk(id);
  }

  async create(userData) {
    return User.create(userData);
  }

  async updatePassword(userId, hashedPassword) {
    return User.update({ password: hashedPassword }, { where: { id: userId } });
  }

  async saveSearchQuery(userId, query) {
    return SearchHistory.create({ query, userId });
  }

  async getSearchHistory(userId) {
    return SearchHistory.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
  }
}

module.exports = new UserRepository();