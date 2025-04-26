<template>
  <div class="search-page">
    <div class="header">
      <div class="header-content">
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
    <div class="search-content">
      <div class="search-logo">Search</div>
      <div class="search-form">
        <input
          v-model="searchQuery"
          type="text"
          class="search-panel"
          placeholder="Search..."
          @keyup.enter="performSearch"
        />
        <button @click="performSearch" class="search-button">Search</button>
      </div>
      <div class="search-results" v-if="results.length">
        <div v-for="result in results" :key="result.id" class="result-item">
          <a :href="result.url" target="_blank" class="result-title">{{ result.title }}</a>
          <p class="result-url">{{ result.url }}</p>
          <p class="result-snippet">{{ result.snippet }}</p>
        </div>
      </div>
      <div v-else-if="searchQuery && !results.length" class="no-results">
        No results found for "{{ searchQuery }}".
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';

export default {
  name: 'SearchPage',
  setup() {
    const authStore = useAuthStore();
    authStore.initializeAuth();
    return { authStore };
  },
  data() {
    return {
      searchQuery: '',
      results: [],
    };
  },
  methods: {
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
    performSearch() {
      // Фиктивные данные для демонстрации
      if (this.searchQuery.trim()) {
        this.results = [
          {
            id: 1,
            title: `Example Result for ${this.searchQuery}`,
            url: `https://example.com/${this.searchQuery}`,
            snippet: `This is a sample result for the query "${this.searchQuery}". Click to visit the site.`,
          },
          {
            id: 2,
            title: `Another Result for ${this.searchQuery}`,
            url: `https://another-example.com/${this.searchQuery}`,
            snippet: `This is another sample result for "${this.searchQuery}". Explore more details.`,
          },
        ];
      } else {
        this.results = [];
      }
      // Здесь можно добавить интеграцию с API, например:
      // const response = await axios.get(`https://api.search.com?q=${this.searchQuery}`);
      // this.results = response.data.results;
    },
  },
};
</script>

<style scoped>
.search-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  width: 100%;
  height: 50px;
  background: #2b2424;
  display: flex;
  position: fixed;
}

.header-content {
  width: 100%;
  max-width: 1200px;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.auth-buttons {
  display: flex;
  gap: 15px;
  position: absolute;
  right: 0;
  padding-right: 15px;
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

.search-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 70px; /* Учитываем высоту header */
  flex-grow: 1;
}

.search-logo {
  font-size: 70px;
  background: white;
  -webkit-background-clip: text;
  color: transparent;
  text-fill-color: transparent;
}

.search-form {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.search-panel {
  width: 700px;
  height: 45px;
  border-radius: 15px;
  border: 2px solid gray;
  color: white;
  font-size: 20px;
  outline: none;
  background: transparent;
  padding: 0 15px;
}

.search-panel:focus {
  border: 2px solid white;
}

.search-button {
  font-size: 18px;
  width: 150px;
  height: 50px;
  background: black;
  border-radius: 15px;
  border: none;
  color: white;
  opacity: 0.8;
  transition: 0.4s;
  cursor: pointer;
  font-weight: bold;
}

.search-button:hover {
  font-size: 20px;
  width: 150px;
  height: 50px;
  background: rgba(24, 58, 211, 0.568);
  border-radius: 12px;
  color: white;
  opacity: 1;
  transition: 0.4s;
  cursor: pointer;
}

.search-results {
  width: 700px;
  margin-top: 30px;
}

.result-item {
  margin-bottom: 20px;
}

.result-title {
  font-size: 18px;
  color: #1a73e8;
  text-decoration: none;
}

.result-title:hover {
  text-decoration: underline;
}

.result-url {
  font-size: 14px;
  color: #006621;
  margin: 5px 0;
}

.result-snippet {
  font-size: 14px;
  color: white;
  margin: 5px 0;
}

.no-results {
  margin-top: 30px;
  font-size: 18px;
  color: white;
}
</style>
