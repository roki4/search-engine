/**
 * @fileoverview Authentication service for user registration, login, and password change.
 * @module services/authService
 */

const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');

const SALT_ROUNDS = 10;

/**
 * Authentication service class.
 * @class AuthService
 */
class AuthService {
  /**
   * Register a new user.
   * @async
   * @param {Object} userData - User data.
   * @param {string} userData.name - User's name.
   * @param {string} userData.surname - User's surname.
   * @param {string} userData.email - User's email.
   * @param {string} userData.password - User's password.
   * @returns {Promise<void>}
   * @throws {Error} If email already exists.
   */
  async register({ name, surname, email, password }) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('EMAIL_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await userRepository.create({ name, surname, email, password: hashedPassword });
  }

  /**
   * Log in a user.
   * @async
   * @param {Object} credentials - Login credentials.
   * @param {string} credentials.email - User's email.
   * @param {string} credentials.password - User's password.
   * @returns {Promise<Object>} User object.
   * @throws {Error} If credentials are invalid.
   */
  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    return user;
  }

  /**
   * Change a user's password.
   * @async
   * @param {number} userId - User's ID.
   * @param {string} oldPassword - Current password.
   * @param {string} newPassword - New password.
   * @returns {Promise<void>}
   * @throws {Error} If user not found or old password is invalid.
   */
  async changePassword(userId, oldPassword, newPassword) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('INVALID_PASSWORD');
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.updatePassword(userId, hashedPassword);
  }
}

module.exports = new AuthService();
