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
              placeholder="Поиск..."
              @input="debouncedFetchSuggestions"
              @focus="debouncedFetchSuggestions"
              @keyup.enter="performSearch"
              @blur="handleBlur"
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
                  <span v-if="suggestion.isCorrected" class="suggestion-text"
                    >Исправлено: {{ suggestion.text }}</span
                  >
                  <span v-else class="suggestion-text">{{ suggestion.text }}</span>
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
            <button @click="goToProfile" class="profile">Профиль</button>
            <button @click="logout" class="logout">Выйти</button>
          </template>
          <template v-else>
            <button @click="goToLogin" class="login">Войти</button>
            <button @click="goToRegister" class="signup">Регистрация</button>
          </template>
        </div>
      </div>
      <div class="theme-toggle">
        <ThemeToggle />
      </div>
    </div>
    <div class="results-container">
      <div class="search-type-selector">
        <select v-model="searchType" @change="handleSearchTypeChange">
          <option value="web">Обычный поиск</option>
          <option value="documents">Поиск по документам</option>
        </select>
      </div>
      <div
        v-if="
          results.length === 0 &&
          !wikipediaResult.title &&
          !aiResult.text &&
          documents.length === 0 &&
          !searchPerformed
        "
        class="no-results"
      >
        Ничего не найдено для "{{ searchQuery }}"
      </div>
      <template v-if="searchType === 'web'">
        <div class="ai-result">
          <h3>Ответ от нейросети</h3>
          <div v-if="aiLoading" class="ai-loading">
            <span class="spinner"></span>
            Нейросеть думает...
          </div>
          <div v-else-if="aiResult.text" class="ai-response" v-html="formattedAiResponse"></div>
          <p v-else class="ai-no-response">Ответ от нейросети отсутствует</p>
        </div>
        <div v-if="wikiLoading" class="loading">Загрузка Википедии...</div>
        <div v-else-if="wikipediaResult.title" class="wikipedia-result">
          <h3>Краткая информация из Википедии</h3>
          <a :href="wikipediaResult.url" target="_blank" class="wiki-title">{{
            wikipediaResult.title
          }}</a>
          <p class="wiki-extract">{{ wikipediaResult.extract }}</p>
        </div>
        <div v-if="webLoading" class="loading">Загрузка веб-результатов...</div>
        <div v-else-if="results.length" class="results-list">
          <div v-for="(result, index) in results" :key="index" class="result-item">
            <a :href="result.url" target="_blank" class="result-title">{{ result.title }}</a>
            <p class="result-url">{{ result.url }}</p>
            <p class="result-snippet">{{ result.snippet }}</p>
          </div>
        </div>
        <div v-if="results.length > 0" class="pagination">
          <button :disabled="currentPage === 1" @click="previousPage" class="pagination-button">
            Предыдущая
          </button>
          <span class="page-info">Страница {{ currentPage }}</span>
          <button :disabled="!hasMoreResults" @click="nextPage" class="pagination-button">
            Следующая
          </button>
        </div>
      </template>
      <template v-if="searchType === 'documents'">
        <div v-if="docLoading" class="loading">Загрузка документов...</div>
        <div v-else-if="documents.length" class="documents-result">
          <h3>Документы</h3>
          <div v-for="(doc, index) in documents" :key="index" class="document-item">
            <a :href="doc.url" target="_blank" class="document-title">{{ doc.title }}</a>
            <p class="document-url">{{ doc.url }}</p>
            <p class="document-snippet">{{ doc.snippet }}</p>
            <p class="document-type">Тип: {{ doc.fileType }}</p>
          </div>
        </div>
        <div v-if="documents.length > 0" class="pagination">
          <button
            :disabled="docCurrentPage === 1"
            @click="previousDocPage"
            class="pagination-button"
          >
            Предыдущая
          </button>
          <span class="page-info">Страница {{ docCurrentPage }}</span>
          <button :disabled="!hasMoreDocResults" @click="nextDocPage" class="pagination-button">
            Следующая
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import hotkeys from 'hotkeys-js';
import ThemeToggle from '@/components/ThemeToggle.vue';
import debounce from 'lodash/debounce';
import { marked } from 'marked';

export default {
  name: 'SearchResults',
  components: { ThemeToggle },
  setup() {
    const authStore = useAuthStore();
    authStore.initializeAuth();
    return { authStore };
  },
  data() {
    return {
      searchQuery: '',
      results: [],
      webLoading: false,
      wikiLoading: false,
      aiLoading: false,
      docLoading: false,
      currentPage: 1,
      totalResults: 0,
      resultsPerPage: 10,
      docCurrentPage: 1,
      docTotalResults: 0,
      documents: [],
      isListening: false,
      suggestions: [],
      historyCount: 0,
      highlightedIndex: -1,
      wikipediaResult: {},
      aiResult: {},
      errorMessage: '',
      searchPerformed: false,
      searchType: 'web', // По умолчанию обычный поиск
    };
  },
  computed: {
    hasMoreResults() {
      return this.currentPage * this.resultsPerPage < this.totalResults;
    },
    hasMoreDocResults() {
      return this.docCurrentPage * this.resultsPerPage < this.docTotalResults;
    },
    formattedAiResponse() {
      return this.aiResult.text ? marked.parse(this.aiResult.text) : '';
    },
  },
  created() {
    this.searchQuery = this.$route.query.q || '';
    const page = parseInt(this.$route.query.page, 10);
    this.currentPage = Number.isInteger(page) && page > 0 ? page : 1;
    const docPage = parseInt(this.$route.query.docPage, 10);
    this.docCurrentPage = Number.isInteger(docPage) && docPage > 0 ? docPage : 1;
    this.searchType = this.$route.query.type === 'documents' ? 'documents' : 'web';
    this.debouncedFetchSuggestions = debounce(this.fetchSuggestions, 300);
    if (this.searchQuery) {
      this.performSearch(this.currentPage, this.docCurrentPage);
    }
  },
  mounted() {
    hotkeys('ctrl+/,cmd+/', (event) => {
      event.preventDefault();
      this.$refs.searchInput.focus();
    });

    hotkeys('esc', () => {
      this.searchQuery = '';
      this.clearSuggestions();
      this.$refs.searchInput.blur();
    });
  },
  beforeUnmount() {
    hotkeys.unbind('ctrl+/,cmd+/');
    hotkeys.unbind('esc');
    this.debouncedFetchSuggestions.cancel();
  },
  methods: {
    async performSearch(page = 1, docPage = 1) {
      if (!this.searchQuery.trim()) return;
      this.webLoading = true;
      this.wikiLoading = true;
      this.aiLoading = true;
      this.docLoading = true;
      this.errorMessage = '';
      this.currentPage = Number.isInteger(page) && page > 0 ? page : 1;
      this.docCurrentPage = Number.isInteger(docPage) && docPage > 0 ? docPage : 1;
      const start = (this.currentPage - 1) * this.resultsPerPage + 1;
      const docStart = (this.docCurrentPage - 1) * this.resultsPerPage + 1;
      this.searchPerformed = true;

      // Шаг 1: Проверка орфографии
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
        console.warn('Spellcheck failed:', error.message);
      }

      // Шаг 2: Запуск запроса к нейросети (независимо)
      this.fetchAIResult(queryToSearch);

      // Шаг 3: Параллельные запросы к Википедии, поиску и документам
      const promises = [
        // Запрос к Википедии
        axios
          .get('/api/wikipedia', {
            params: { q: queryToSearch },
          })
          .then((response) => ({ type: 'wikipedia', data: response.data || {} }))
          .catch((error) => {
            console.warn('Wikipedia fetch failed:', error.message);
            return { type: 'wikipedia', data: {} };
          }),

        // Запрос к веб-поиску
        axios
          .get('/api/search', {
            params: { q: queryToSearch, start },
            headers: {
              'x-user': this.authStore.user ? JSON.stringify(this.authStore.user) : '{}',
            },
          })
          .then((response) => ({
            type: 'search',
            data: {
              results: response.data.results || [],
              totalResults: response.data.totalResults || 0,
            },
          }))
          .catch((error) => {
            console.warn('Search fetch failed:', error.message);
            return { type: 'search', data: { results: [], totalResults: 0 } };
          }),

        // Запрос к поиску документов
        axios
          .get('/api/document-search', {
            params: { q: queryToSearch, start: docStart },
            headers: {
              'x-user': this.authStore.user ? JSON.stringify(this.authStore.user) : '{}',
            },
          })
          .then((response) => ({
            type: 'document-search',
            data: {
              results: response.data.results || [],
              totalResults: response.data.totalResults || 0,
            },
          }))
          .catch((error) => {
            console.warn('Document search fetch failed:', error.message);
            return { type: 'document-search', data: { results: [], totalResults: 0 } };
          }),
      ];

      // Выполняем запросы
      try {
        const results = await Promise.allSettled(promises);
        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            const { type, data } = result.value;
            if (type === 'wikipedia') {
              this.wikipediaResult = data;
              this.wikiLoading = false;
            } else if (type === 'search') {
              this.results = data.results;
              this.totalResults = data.totalResults;
              this.webLoading = false;
            } else if (type === 'document-search') {
              this.documents = data.results;
              this.docTotalResults = data.totalResults;
              this.docLoading = false;
            }
          }
        });
      } catch (error) {
        console.error('Error during searches:', error);
        this.wikiLoading = false;
        this.webLoading = false;
        this.docLoading = false;
        this.wikipediaResult = {};
        this.results = [];
        this.totalResults = 0;
        this.documents = [];
        this.docTotalResults = 0;
      }

      // Шаг 4: Сохраняем запрос в историю, если пользователь авторизован
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
          console.warn('Failed to save search query:', error.message);
        }
      }

      // Шаг 5: Обновляем URL
      this.$router.push({
        path: '/search',
        query: {
          q: this.searchQuery,
          page: this.currentPage,
          docPage: this.docCurrentPage,
          type: this.searchType,
        },
      });
    },
    async fetchAIResult(query) {
      try {
        const aiResponse = await axios.get('/api/ai', {
          params: { q: query },
        });
        this.aiResult = aiResponse.data.text ? { text: aiResponse.data.text } : {};
      } catch (error) {
        console.warn('AI fetch failed:', error.message);
        this.aiResult = {};
      } finally {
        this.aiLoading = false;
      }
    },
    async fetchSuggestions() {
      if (!this.searchQuery.trim() || this.searchQuery.length < 2) {
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
      this.clearSuggestions();
      this.currentPage = 1;
      this.docCurrentPage = 1;
      this.performSearch(1, 1);
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
        await this.fetchSuggestions();
        this.$refs.searchInput.focus();
      } catch (error) {
        console.error('Error deleting suggestion:', error);
      }
    },
    isFromHistory(index) {
      return index < this.historyCount && !this.suggestions[index].isCorrected;
    },
    clearSuggestions() {
      this.debouncedFetchSuggestions.cancel();
      this.suggestions = [];
      this.historyCount = 0;
      this.highlightedIndex = -1;
    },
    handleBlur() {
      setTimeout(() => {
        this.clearSuggestions();
      }, 100);
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
        this.performSearch(this.currentPage - 1, this.docCurrentPage);
      }
    },
    nextPage() {
      if (this.hasMoreResults) {
        this.performSearch(this.currentPage + 1, this.docCurrentPage);
      }
    },
    previousDocPage() {
      if (this.docCurrentPage > 1) {
        this.performSearch(this.currentPage, this.docCurrentPage - 1);
      }
    },
    nextDocPage() {
      if (this.hasMoreDocResults) {
        this.performSearch(this.currentPage, this.docCurrentPage + 1);
      }
    },
    handleSearchTypeChange() {
      // Сбрасываем пагинацию при смене типа поиска
      this.currentPage = 1;
      this.docCurrentPage = 1;
      this.$router.push({
        path: '/search',
        query: {
          q: this.searchQuery,
          page: this.currentPage,
          docPage: this.docCurrentPage,
          type: this.searchType,
        },
      });
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
        alert('Ваш браузер не поддерживает голосовой ввод');
        return;
      }

      try {
        const permission = await navigator.permissions.query({ name: 'microphone' });
        if (permission.state === 'denied') {
          alert('Доступ к микрофону заблокирован. Разрешите доступ в настройках браузера.');
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
          this.performSearch(1, 1);
          recognition.stop();
        }
      };

      recognition.onend = () => {
        this.isListening = false;
      };

      recognition.onerror = (event) => {
        this.isListening = false;
        if (event.error === 'no-speech') {
          alert('Речь не распознана. Попробуйте говорить громче или ближе к микрофону.');
        } else if (event.error === 'audio-capture') {
          alert('Микрофон недоступен. Проверьте подключение микрофона.');
        } else if (event.error === 'not-allowed') {
          alert('Доступ к микрофону запрещён. Разрешите доступ в настройках браузера.');
        } else {
          console.error('Speech recognition error:', event.error);
          alert(`Ошибка голосового ввода: ${event.error}`);
        }
      };

      try {
        recognition.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        this.isListening = false;
        alert('Не удалось запустить голосовой ввод. Проверьте настройки микрофона.');
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
  background: var(--background-color);
}

.header {
  width: 100%;
  height: 50px;
  background: var(--header-bg);
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
  color: var(--text-color);
  text-decoration: none;
  font-weight: bold;
}

.logo-name:hover {
  color: #007bff;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.search-wrapper {
  position: relative;
  width: 500px;
}

.search-input {
  width: 100%;
  height: 40px;
  border-radius: 20px;
  border: var(--input-border);
  background: var(--input-bg);
  color: var(--text-color);
  font-size: 16px;
  padding: 0 15px;
  outline: none;
}

.search-input:focus {
  border: var(--input-border-focus);
  background: var(--secondary-bg);
}

.suggestions-dropdown {
  position: absolute;
  top: 42px;
  left: 0;
  width: 100%;
  background: var(--secondary-bg);
  border: var(--input-border);
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
  color: var(--text-color);
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  height: 20px;
}

.suggestions-dropdown li:first-child {
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
}

.suggestions-dropdown li:last-child {
  border-bottom-left-radius: 18px;
  border-bottom-right-radius: 18px;
}

.suggestions-dropdown li:hover,
.suggestions-dropdown li.highlighted {
  background: #007bff;
}

.suggestion-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 40px);
}

.delete-button {
  background: transparent;
  border: none;
  color: #ff4444;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.delete-button:hover {
  color: #ff6666;
}

.search-button {
  width: 40px;
  height: 40px;
  background: var(--accent-bg);
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
  background: var(--accent-bg);
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
  position: absolute;
  right: 20px;
}

.user-name {
  color: var(--text-color);
  font-size: 16px;
  margin-right: 10px;
}

button {
  font-size: 15px;
  height: 36px;
  background: var(--button-bg);
  border-radius: 15px;
  border: none;
  color: var(--button-text);
  opacity: var(--button-opacity);
  transition: 0.4s;
  cursor: pointer;
  font-weight: bold;
  white-space: nowrap;
}

button.login,
button.profile,
button.logout {
  width: 90px;
}

button.signup {
  width: 140px;
}

button:hover {
  font-size: 17px;
  opacity: var(--button-hover-opacity);
  transition: 0.4s;
}

.signup:hover {
  background: rgba(85, 243, 45, 0.568);
  border-radius: 12px;
}

.login:hover {
  background: rgba(24, 58, 211, 0.568);
  border-radius: 12px;
}

.profile:hover {
  background: rgba(128, 0, 128, 0.568);
  border-radius: 12px;
}

.logout:hover {
  background: rgba(255, 65, 65, 0.568);
  border-radius: 12px;
}

.results-container {
  max-width: 800px;
  margin: 80px auto 20px;
  padding: 0 20px;
}

.search-type-selector {
  margin-bottom: 20px;
}

.search-type-selector select {
  width: 210px;
  height: 40px;
  border-radius: 8px;
  border: var(--input-border);
  background: var(--input-bg);
  color: var(--text-color);
  font-size: 16px;
  padding: 0 10px;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg fill="%23ffffff" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 10px center;
}

[data-theme='light'] .search-type-selector select {
  background-image: url('data:image/svg+xml;utf8,<svg fill="%23333333" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
}

.search-type-selector select:focus {
  border: var(--input-border-focus);
}

.search-type-selector select option {
  background: var(--secondary-bg);
  color: var(--text-color);
}

.loading {
  color: var(--text-color);
  font-size: 18px;
  text-align: center;
}

.no-results {
  color: var(--text-color);
  font-size: 18px;
  text-align: center;
}

.ai-result {
  background: var(--secondary-bg);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.ai-result h3 {
  font-size: 20px;
  color: var(--text-color);
  margin-bottom: 10px;
}

.ai-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-color);
  font-size: 14px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid var(--text-color);
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.ai-response {
  font-size: 14px;
  color: var(--text-color);
  margin-top: 10px;
  line-height: 1.5;
  word-wrap: break-word;
}

.ai-response h3 {
  font-size: 16px;
  font-weight: bold;
  margin: 10px 0 5px;
}

.ai-response strong {
  font-weight: bold;
}

.ai-no-response {
  font-size: 14px;
  color: var(--text-color);
  margin-top: 10px;
  opacity: 0.7;
}

.wikipedia-result {
  background: var(--secondary-bg);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.wikipedia-result h3 {
  font-size: 20px;
  color: var(--text-color);
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
  color: var(--text-color);
  margin-top: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.result-item {
  background: var(--secondary-bg);
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
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-snippet {
  font-size: 14px;
  color: var(--text-color);
  margin: 5px 0;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.documents-result {
  background: var(--secondary-bg);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.documents-result h3 {
  font-size: 20px;
  color: var(--text-color);
  margin-bottom: 10px;
}

.document-item {
  margin-bottom: 15px;
}

.document-title {
  font-size: 18px;
  color: #1e90ff;
  text-decoration: none;
}

.document-title:hover {
  text-decoration: underline;
}

.document-url {
  font-size: 14px;
  color: #00cc00;
  margin: 5px 0;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.document-snippet {
  font-size: 14px;
  color: var(--text-color);
  margin: 5px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.document-type {
  font-size: 12px;
  color: var(--text-color);
  margin: 5px 0;
  opacity: 0.7;
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
  background: var(--accent-bg);
  border-radius: 8px;
  border: none;
  color: var(--button-text);
  opacity: var(--button-opacity);
  transition: 0.3s;
  cursor: pointer;
}

.pagination-button:hover {
  background: #007bff;
  opacity: var(--button-hover-opacity);
}

.pagination-button:disabled {
  background: #999;
  cursor: not-allowed;
  opacity: 0.5;
}

.page-info {
  color: var(--text-color);
  font-size: 14px;
}

.error {
  color: #ff4444;
  font-size: 16px;
  text-align: center;
  margin: 20px 0;
}

.theme-toggle {
  left: 20px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
