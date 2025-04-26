<template>
  <div class="profile-page">
    <div class="header">
      <div class="header-content">
        <router-link to="/" class="logo-name">Quirk</router-link>
        <div class="auth-buttons">
          <span v-if="authStore.user" class="user-name">{{ authStore.user.name }}</span>
          <button @click="logout" class="logout">Log out</button>
        </div>
      </div>
    </div>
    <div class="profile-container">
      <h1>Profile</h1>
      <div class="tabs">
        <button :class="{ active: activeTab === 'password' }" @click="activeTab = 'password'">
          Change Password
        </button>
        <button :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">
          Search History
        </button>
      </div>
      <div class="tab-content">
        <div v-if="activeTab === 'password'" class="password-form">
          <h2>Change Password</h2>
          <form @submit.prevent="changePassword">
            <div class="form-group">
              <label for="old-password">Current Password</label>
              <input
                v-model="passwordForm.oldPassword"
                type="password"
                id="old-password"
                placeholder="Enter current password"
              />
            </div>
            <div class="form-group">
              <label for="new-password">New Password</label>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                id="new-password"
                placeholder="Enter new password"
              />
            </div>
            <button type="submit" class="submit-button">Change Password</button>
            <p v-if="passwordError" class="error">{{ passwordError }}</p>
            <p v-if="passwordSuccess" class="success">{{ passwordSuccess }}</p>
          </form>
        </div>
        <div v-if="activeTab === 'history'" class="history">
          <h2>Search History</h2>
          <div v-if="historyError" class="error">{{ historyError }}</div>
          <div v-else-if="searchHistory.length === 0" class="no-history">No search history</div>
          <ul v-else class="history-list">
            <li v-for="(item, index) in searchHistory" :key="index" class="history-item">
              <span>{{ item.query }}</span>
              <span class="date">{{ formatDate(item.createdAt) }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

export default {
  name: 'ProfilePage',
  setup() {
    const authStore = useAuthStore();
    authStore.initializeAuth();
    return { authStore };
  },
  data() {
    return {
      activeTab: 'password',
      passwordForm: {
        oldPassword: '',
        newPassword: '',
      },
      passwordError: '',
      passwordSuccess: '',
      searchHistory: [],
      historyError: '',
    };
  },
  async created() {
    await this.loadSearchHistory();
  },
  methods: {
    async changePassword() {
      this.passwordError = '';
      this.passwordSuccess = '';
      try {
        await axios.post(
          '/api/change-password',
          {
            oldPassword: this.passwordForm.oldPassword,
            newPassword: this.passwordForm.newPassword,
          },
          {
            headers: {
              'x-user': JSON.stringify(this.authStore.user),
            },
          }
        );
        this.passwordSuccess = 'Password changed successfully';
        this.passwordForm.oldPassword = '';
        this.passwordForm.newPassword = '';
      } catch (error) {
        console.error('Error changing password:', error);
        this.passwordError = error.response?.data?.message || 'Error changing password';
      }
    },
    async loadSearchHistory() {
      this.historyError = '';
      try {
        const response = await axios.get('/api/search-history', {
          headers: {
            'x-user': JSON.stringify(this.authStore.user),
          },
        });
        this.searchHistory = response.data.history;
      } catch (error) {
        console.error('Error loading history:', error);
        this.historyError = error.response?.data?.message || 'Failed to load search history';
      }
    },
    async logout() {
      await this.authStore.logout();
      this.$router.push('/');
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
    },
  },
};
</script>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #1e1e1e;
  align-items: center;
}

.header {
  width: 100%;
  height: 50px;
  background: #2b2424;
  display: flex;
  justify-content: center;
  position: fixed;
  top: 0;
}

.header-content {
  width: 100%;
  max-width: 1200px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  justify-content: space-between;
}

.logo-name {
  font-size: 24px;
  color: white;
  text-decoration: none;
  font-weight: bold;
}

.logo-name:hover {
  color: #007bff;
}

.auth-buttons {
  display: flex;
  gap: 15px;
  align-items: center;
}

.user-name {
  color: white;
  font-size: 16px;
  margin-right: 10px;
}

.logout {
  font-size: 15px;
  width: 120px;
  height: 36px;
  background: black;
  border-radius: 15px;
  border: none;
  color: white;
  opacity: 0.8;
  transition: 0.4s;
  cursor: pointer;
  font-weight: bold;
  white-space: nowrap;
}

.logout:hover {
  font-size: 17px;
  width: 120px;
  height: 36px;
  background: rgba(255, 65, 65, 0.568);
  border-radius: 12px;
  color: white;
  opacity: 1;
  transition: 0.4s;
  cursor: pointer;
}

.profile-container {
  max-width: 800px;
  margin: 80px auto 20px;
  padding: 0 20px;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1 {
  font-size: 28px;
  margin-bottom: 20px;
  text-align: center;
}

.tabs {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  justify-content: center;
}

.tabs button {
  width: 200px;
  font-size: 16px;
  padding: 10px 30px;
  background: #333;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: 0.3s;
  white-space: nowrap;
}

.tabs button:hover {
  background: #007bff;
}

.tabs button.active {
  background: #007bff;
}

.tab-content {
  background: #2a2a2a;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 600px;
  text-align: center;
}

.password-form h2,
.history h2 {
  font-size: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
  width: 100%;
}

.form-group label {
  display: block;
  font-size: 14px;
  margin-bottom: 5px;
}

.form-group input {
  width: 100%;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #555;
  background: #333;
  color: white;
  padding: 0 15px;
  font-size: 14px;
  outline: none;
}

.form-group input:focus {
  border: 1px solid #007bff;
}

.submit-button {
  font-size: 16px;
  width: 200px;
  height: 40px;
  background: #007bff;
  border-radius: 8px;
  border: none;
  color: white;
  cursor: pointer;
  margin-top: 10px;
  white-space: nowrap;
}

.submit-button:hover {
  background: #0056b3;
}

.error {
  color: #ff4444;
  font-size: 14px;
  margin-top: 10px;
}

.success {
  color: #00cc00;
  font-size: 14px;
  margin-top: 10px;
}

.no-history {
  font-size: 16px;
  color: #cccccc;
}

.history-list {
  list-style: none;
  padding: 0;
  width: 100%;
}

.history-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #555;
}

.history-item:last-child {
  border-bottom: none;
}

.history-item .date {
  color: #999;
  font-size: 12px;
}
</style>
