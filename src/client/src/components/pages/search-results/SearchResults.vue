<template>
  <div class="search-results-page">
    <div class="header">
      <div class="header-content">
        <div class="logo">
          <router-link to="/" class="logo-name">Quirk</router-link>
        </div>
        <div class="search-bar">
          <div class="search-wrapper">
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="Search..."
              @input="fetchSuggestions"
              @keyup.enter="performSearch"
              @blur="clearSuggestions"
              @keydown="handleKeydown"
            />
            <div v-if="suggestions.length" class="suggestions-dropdown">
              <ul>
                <li
                  v-for="(suggestion, index) in suggestions"
                  :key="index"
                  :class="{ highlighted: index === highlightedIndex }"
                  @mousedown="selectSuggestion(suggestion)"
                >
                  <span v-if="suggestion.isCorrected">Corrected: {{ suggestion.text }}</span>
                  <span v-else>{{ suggestion.text }}</span>
                  <button
                    v-if="isFromHistory(index) && authStore.isAuthenticated"
                    class="delete-button"
                    @mousedown.stop="deleteSuggestion(suggestion.text)"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <button class="search-button" @click="performSearch">
            <i class="fas fa-search"></i>
          </button>
          <button
            class="mic-button"
            :class="{ listening: isListening }"
            @click="startSpeechRecognition"
          >
            <i class="fas fa-microphone"></i>
          </button>
        </div>
        <div class="auth-buttons">
          <template v-if="authStore.isAuthenticated">
            <span class="user-name">{{ authStore.user.name }}</span>
            <button @click="goToProfile" class="profile">Profile</button>
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
      <div v-else-if="results.length === 0 && !wikipediaResult.title" class="no-results">
        No results found for "{{ searchQuery }}"
      </div>
      <div v-if="wikipediaResult.title" class="wikipedia-result">
        <h3>Wikipedia Summary</h3>
        <a :href="wikipediaResult.url" target="_blank" class="wiki-title">{{
          wikipediaResult.title
        }}</a>
        <p class="wiki-extract">{{ wikipediaResult.extract }}</p>
      </div>
      <div v-if="results.length" class="results-list">
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
import hotkeys from 'hotkeys-js';

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
      isListening: false,
      suggestions: [],
      historyCount: 0,
      highlightedIndex: -1,
      wikipediaResult: {},
    };
  },
  computed: {
    hasMoreResults() {
      return this.currentPage * this.resultsPerPage < this.totalResults;
    },
  },
  created() {
    this.searchQuery = this.$route.query.q || '';
    const page = parseInt(this.$route.query.page, 10);
    this.currentPage = Number.isInteger(page) && page > 0 ? page : 1;
    if (this.searchQuery) {
      this.performSearch(this.currentPage);
    }
  },
  mounted() {
    hotkeys('ctrl+/,cmd+/', (event) => {
      event.preventDefault();
      this.$refs.searchInput.focus();
    });

    hotkeys('esc', () => {
      this.searchQuery = '';
      this.suggestions = [];
      this.historyCount = 0;
      this.highlightedIndex = -1;
      this.$refs.searchInput.blur();
    });
  },
  beforeUnmount() {
    hotkeys.unbind('ctrl+/,cmd+/');
    hotkeys.unbind('esc');
  },
  methods: {
    async performSearch(page = 1) {
      if (!this.searchQuery.trim()) return;
      this.loading = true;
      this.currentPage = Number.isInteger(page) && page > 0 ? page : 1;
      const start = (this.currentPage - 1) * this.resultsPerPage + 1;

      console.log('Performing search with:', {
        query: this.searchQuery,
        page: this.currentPage,
        start,
      });

      try {
        // Check spelling
        let queryToSearch = this.searchQuery;
        try {
          const spellcheckResponse = await axios.get('/api/spellcheck', {
            params: { q: this.searchQuery },
          });
          if (
            spellcheckResponse.data.corrected &&
            spellcheckResponse.data.corrected !== this.searchQuery
          ) {
            queryToSearch = spellcheckResponse.data.corrected;
          }
        } catch (error) {
          console.error('Spellcheck failed:', error);
        }

        // Fetch Wikipedia summary
        try {
          const wikiResponse = await axios.get('/api/wikipedia', {
            params: { q: queryToSearch },
          });
          this.wikipediaResult = wikiResponse.data;
        } catch (error) {
          console.error('Wikipedia fetch failed:', error);
          this.wikipediaResult = {};
        }

        // Perform search
        const response = await axios.get('/api/search', {
          params: { q: queryToSearch, start },
          headers: {
            'x-user': this.authStore.user ? JSON.stringify(this.authStore.user) : '{}',
          },
        });
        this.results = response.data.results || [];
        this.totalResults = response.data.totalResults || 0;

        // Save search query
        if (this.authStore.isAuthenticated) {
          try {
            await axios.post(
              '/api/save-search-query',
              { query: queryToSearch },
              {
                headers: {
                  'x-user': JSON.stringify(this.authStore.user),
                },
              }
            );
          } catch (error) {
            console.error('Failed to save search query:', error);
          }
        }

        this.$router.push({
          path: '/search',
          query: { q: this.searchQuery, page: this.currentPage },
        });
      } catch (error) {
        console.error('Error during search:', error);
        this.results = [];
        this.totalResults = 0;
        this.wikipediaResult = {};
      } finally {
        this.loading = false;
      }
    },
    async fetchSuggestions() {
      if (!this.searchQuery.trim()) {
        this.suggestions = [];
        this.historyCount = 0;
        this.highlightedIndex = -1;
        return;
      }

      try {
        let suggestions = [];
        this.historyCount = 0;

        const spellcheckResponse = await axios.get('/api/spellcheck', {
          params: { q: this.searchQuery },
        });
        if (
          spellcheckResponse.data.corrected &&
          spellcheckResponse.data.corrected !== this.searchQuery
        ) {
          suggestions.push({ text: spellcheckResponse.data.corrected, isCorrected: true });
        }

        if (this.authStore.isAuthenticated) {
          const response = await axios.get('/api/autocomplete', {
            headers: { 'x-user': JSON.stringify(this.authStore.user) },
            params: { q: this.searchQuery },
          });
          const historySuggestions = (response.data.suggestions || [])
            .filter((s) => !suggestions.some((sug) => sug.text === s))
            .map((text) => ({ text, isCorrected: false }));
          suggestions = suggestions.concat(historySuggestions);
          this.historyCount = historySuggestions.length;
        }

        if (suggestions.length < 5) {
          const response = await axios.get('/api/external-autocomplete', {
            params: { q: this.searchQuery },
          });
          const external = (response.data.suggestions || [])
            .filter((s) => !suggestions.some((sug) => sug.text === s))
            .map((text) => ({ text, isCorrected: false }));
          suggestions = suggestions.concat(external).slice(0, 5);
        }

        this.suggestions = suggestions;
        this.highlightedIndex = -1;
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        this.suggestions = [];
        this.historyCount = 0;
        this.highlightedIndex = -1;
      }
    },
    selectSuggestion(suggestion) {
      this.searchQuery = suggestion.text;
      this.performSearch(1);
    },
    async deleteSuggestion(suggestion) {
      if (!this.authStore.isAuthenticated) return;

      try {
        await axios.delete('/api/search-history', {
          headers: { 'x-user': JSON.stringify(this.authStore.user) },
          params: { query: suggestion },
        });
        this.suggestions = this.suggestions.filter((s) => s.text !== suggestion);
        this.historyCount = Math.max(0, this.historyCount - 1);
        if (this.highlightedIndex >= this.suggestions.length) {
          this.highlightedIndex = this.suggestions.length - 1;
        }
      } catch (error) {
        console.error('Error deleting suggestion:', error);
      }
    },
    isFromHistory(index) {
      return index < this.historyCount && !this.suggestions[index].isCorrected;
    },
    clearSuggestions() {
      this.suggestions = [];
      this.historyCount = 0;
      this.highlightedIndex = -1;
    },
    handleKeydown(event) {
      if (!this.suggestions.length) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.highlightedIndex = Math.min(this.highlightedIndex + 1, this.suggestions.length - 1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1);
      } else if (event.key === 'Enter' && this.highlightedIndex >= 0) {
        event.preventDefault();
        this.selectSuggestion(this.suggestions[this.highlightedIndex]);
      } else if (
        (event.key === 'Delete' || event.key === 'Backspace') &&
        this.highlightedIndex >= 0 &&
        this.isFromHistory(this.highlightedIndex) &&
        this.authStore.isAuthenticated
      ) {
        event.preventDefault();
        this.deleteSuggestion(this.suggestions[this.highlightedIndex].text);
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
    goToProfile() {
      this.$router.push('/profile');
    },
    async logout() {
      await this.authStore.logout();
      this.$router.push('/');
    },
    async startSpeechRecognition() {
      if (this.isListening) return;

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Your browser does not support voice input');
        return;
      }

      try {
        const permission = await navigator.permissions.query({ name: 'microphone' });
        if (permission.state === 'denied') {
          alert('Microphone access is blocked. Please allow access in browser settings.');
          return;
        }
      } catch (error) {
        console.error('Error checking microphone permissions:', error);
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'ru-RU';
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        this.isListening = true;
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.searchQuery = transcript;
        if (event.results[0].isFinal) {
          this.performSearch(1);
          recognition.stop();
        }
      };

      recognition.onend = () => {
        this.isListening = false;
      };

      recognition.onerror = (event) => {
        this.isListening = false;
        if (event.error === 'no-speech') {
          alert('Speech not detected. Try speaking louder or closer to the microphone.');
        } else if (event.error === 'audio-capture') {
          alert('Microphone is not available. Check your microphone connection.');
        } else if (event.error === 'not-allowed') {
          alert('Access to the microphone is denied. Allow access in browser settings.');
        } else {
          console.error('Speech recognition error:', event.error);
          alert(`Voice input error: ${event.error}`);
        }
      };

      try {
        recognition.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        this.isListening = false;
        alert('Failed to start voice input. Check microphone settings.');
      }
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

.logo {
  margin-right: 20px;
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

.search-bar {
  flex-grow: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-wrapper {
  position: relative;
  width: 500px;
}

.search-input {
  width: 100%;
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

.suggestions-dropdown {
  position: absolute;
  top: 42px;
  left: 0;
  width: 100%;
  background: #2b2424;
  border: 1px solid #555;
  border-radius: 20px;
  z-index: 1000;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.suggestions-dropdown ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestions-dropdown li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.suggestions-dropdown li:hover,
.suggestions-dropdown li.highlighted {
  background: #007bff;
}

.delete-button {
  background: transparent;
  border: none;
  color: #ff4444;
  font-size: 14px;
  cursor: pointer;
  padding: 0 10px;
}

.delete-button:hover {
  color: #ff6666;
}

.search-button {
  width: 40px;
  height: 40px;
  background: #333;
  border-radius: 20px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.search-button:hover {
  background: #007bff;
}

.mic-button {
  width: 40px;
  height: 40px;
  background: #333;
  border-radius: 20px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.mic-button:hover {
  background: #ff4444;
}

.mic-button.listening {
  background: #ff4444;
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

.profile:hover {
  font-size: 17px;
  width: 90px;
  height: 36px;
  background: rgba(128, 0, 128, 0.568);
  border-radius: 12px;
  color: white;
  opacity: 1;
  transition: 0.4s;
  cursor: pointer;
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

.wikipedia-result {
  background: #2a2a2a;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.wikipedia-result h3 {
  font-size: 20px;
  color: #ffffff;
  margin-bottom: 10px;
}

.wiki-title {
  font-size: 18px;
  color: #1e90ff;
  text-decoration: none;
}

.wiki-title:hover {
  text-decoration: underline;
}

.wiki-extract {
  font-size: 14px;
  color: #cccccc;
  margin-top: 10px;
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
  word-break: break-all;
  max-width: 100%;
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
