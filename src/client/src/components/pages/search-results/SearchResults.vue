<template>
  <div class="search-results-page">
    <div class="header">
      <div class="header-content">
        <div class="search-bar">
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Search..."
            @keyup.enter="performSearch"
          />
        </div>
        <div class="auth-buttons">
          <template v-if="authStore.isAuthenticated">
            <span class="user-name">{{ authStore.user.name }}</span>
            <button @click="logout" class="logout">Log out</button>
          </template>
          <template v-else>
            <button @click="goToLogin" class="login">Log in</button>
            <button @click="goToRegister" class="signup">Sign up</button>
          </template>
        </div>
      </div>
    </div>
    <div class="results-container">
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="results.length === 0" class="no-results">
        No results found for "{{ searchQuery }}"
      </div>
      <div v-else class="results-list">
        <div v-for="(result, index) in results" :key="index" class="result-item">
          <a :href="result.url" target="_blank" class="result-title">{{ result.title }}</a>
          <p class="result-url">{{ result.url }}</p>
          <p class="result-snippet">{{ result.snippet }}</p>
        </div>
      </div>
      <div v-if="results.length > 0" class="pagination">
        <button :disabled="currentPage === 1" @click="previousPage" class="pagination-button">
          Previous
        </button>
        <span class="page-info">Page {{ currentPage }}</span>
        <button :disabled="!hasMoreResults" @click="nextPage" class="pagination-button">
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

export default {
  name: 'SearchResults',
  setup() {
    const authStore = useAuthStore();
    authStore.initializeAuth();
    return { authStore };
  },
  data() {
    return {
      searchQuery: '',
      results: [],
      loading: false,
      currentPage: 1,
      totalResults: 0,
      resultsPerPage: 10,
    };
  },
  computed: {
    hasMoreResults() {
      return this.currentPage * this.resultsPerPage < this.totalResults;
    },
  },
  created() {
    this.searchQuery = this.$route.query.q || '';
    this.currentPage = parseInt(this.$route.query.page, 10) || 1;
    if (this.searchQuery) {
      this.performSearch();
    }
  },
  methods: {
    async performSearch(page = 1) {
      if (!this.searchQuery) return;
      this.loading = true;
      this.currentPage = page;
      const start = (page - 1) * this.resultsPerPage + 1;

      try {
        const response = await axios.get('/api/search', {
          params: { q: this.searchQuery, start },
        });
        this.results = response.data.results;
        this.totalResults = response.data.totalResults;
        this.$router.push({
          path: '/search',
          query: { q: this.searchQuery, page: this.currentPage },
        });
      } catch (error) {
        console.error('Ошибка при поиске:', error);
        this.results = [];
        this.totalResults = 0;
      } finally {
        this.loading = false;
      }
    },
    previousPage() {
      if (this.currentPage > 1) {
        this.performSearch(this.currentPage - 1);
      }
    },
    nextPage() {
      if (this.hasMoreResults) {
        this.performSearch(this.currentPage + 1);
      }
    },
    goToLogin() {
      this.$router.push('/login');
    },
    goToRegister() {
      this.$router.push('/register');
    },
    async logout() {
      await this.authStore.logout();
      this.$router.push('/');
    },
  },
};
</script>

<style scoped>
.search-results-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #1e1e1e;
}

.header {
  width: 100%;
  height: 50px;
  background: #2b2424;
  display: flex;
  position: fixed;
  top: 0;
}

.header-content {
  width: 100%;
  max-width: 1200px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  margin: 0 auto;
}

.search-bar {
  flex-grow: 1;
}

.search-input {
  width: 500px;
  height: 40px;
  border-radius: 20px;
  border: 1px solid #555;
  background: #333;
  color: white;
  font-size: 16px;
  padding: 0 15px;
  outline: none;
}

.search-input:focus {
  border: 1px solid #007bff;
  background: #444;
}

.auth-buttons {
  display: flex;
  gap: 15px;
  height: 50px;
  align-items: center;
}

.user-name {
  color: white;
  font-size: 16px;
  margin-right: 10px;
}

button {
  font-size: 15px;
  width: 90px;
  height: 36px;
  background: black;
  border-radius: 15px;
  border: none;
  color: white;
  opacity: 0.8;
  transition: 0.4s;
  cursor: pointer;
  font-weight: bold;
}

.signup:hover {
  font-size: 17px;
  width: 90px;
  height: 36px;
  background: rgba(85, 243, 45, 0.568);
  border-radius: 12px;
  color: white;
  opacity: 1;
  transition: 0.4s;
  cursor: pointer;
}

.login:hover {
  font-size: 17px;
  width: 90px;
  height: 36px;
  background: rgba(24, 58, 211, 0.568);
  border-radius: 12px;
  color: white;
  opacity: 1;
  transition: 0.4s;
  cursor: pointer;
}

.logout {
  font-size: 15px;
  width: 90px;
  height: 36px;
  background: black;
  border-radius: 15px;
  border: none;
  color: white;
  opacity: 0.8;
  transition: 0.4s;
  cursor: pointer;
  font-weight: bold;
}

.logout:hover {
  font-size: 17px;
  width: 90px;
  height: 36px;
  background: rgba(255, 65, 65, 0.568);
  border-radius: 12px;
  color: white;
  opacity: 1;
  transition: 0.4s;
  cursor: pointer;
}

.results-container {
  max-width: 800px;
  margin: 80px auto 20px;
  padding: 0 20px;
}

.loading {
  color: #ffffff;
  font-size: 18px;
  text-align: center;
}

.no-results {
  color: #ffffff;
  font-size: 18px;
  text-align: center;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.result-item {
  background: #2a2a2a;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s;
}

.result-item:hover {
  transform: translateY(-2px);
}

.result-title {
  font-size: 20px;
  color: #1e90ff;
  text-decoration: none;
  font-weight: 500;
}

.result-title:hover {
  color: #00b7eb;
  text-decoration: underline;
}

.result-url {
  font-size: 14px;
  color: #00cc00;
  margin: 5px 0;
}

.result-snippet {
  font-size: 14px;
  color: #cccccc;
  margin: 5px 0;
  line-height: 1.4;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.pagination-button {
  font-size: 14px;
  width: 100px;
  height: 36px;
  background: #333;
  border-radius: 8px;
  border: none;
  color: white;
  opacity: 0.9;
  transition: 0.3s;
  cursor: pointer;
}

.pagination-button:hover {
  background: #007bff;
  opacity: 1;
}

.pagination-button:disabled {
  background: #555;
  cursor: not-allowed;
  opacity: 0.5;
}

.page-info {
  color: white;
  font-size: 14px;
}
</style>
