const sequelize = require('../config/database');
const user = require('./models/user');

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced!');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
})();
