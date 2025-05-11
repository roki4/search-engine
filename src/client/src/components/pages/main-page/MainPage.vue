<template>
  <div>
    <div class="header">
      <div class="header-content">
        <div class="auth-buttons">
          <template v-if="authStore.isAuthenticated">
            <span class="user-name">{{ authStore.user.name }}</span>
            <button @click="goToProfile" class="profile">Профиль</button>
            <button @click="logout" class="logout">Выйти</button>
          </template>
          <template v-else>
            <button @click="goToLogin" class="login">Войти</button>
            <button @click="goToRegister" class="signup">Зарегистрироваться</button>
          </template>
        </div>
      </div>
    </div>
    <div class="main-content">
      <div class="logo-name">Quirk</div>
      <div class="search-container">
        <div class="search-wrapper">
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            class="search-panel"
            placeholder="Поиск..."
            @input="fetchSuggestions"
            @focus="fetchSuggestions"
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
                <span v-if="suggestion.isCorrected">Исправлено: {{ suggestion.text }}</span>
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
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import hotkeys from 'hotkeys-js';

export default {
  name: 'MainPage',
  setup() {
    const authStore = useAuthStore();
    authStore.initializeAuth();
    return { authStore };
  },
  data() {
    return {
      searchQuery: '',
      suggestions: [],
      historyCount: 0,
      isListening: false,
      highlightedIndex: -1,
    };
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
    performSearch() {
      if (this.searchQuery.trim()) {
        this.suggestions = [];
        this.historyCount = 0;
        this.highlightedIndex = -1;
        this.$router.push({
          path: '/search',
          query: { q: this.searchQuery },
        });
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
      this.performSearch();
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
        // Обновляем предложения без закрытия панели
        await this.fetchSuggestions();
        // Сохраняем фокус на инпуте
        this.$refs.searchInput.focus();
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
          this.performSearch();
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

.main-content {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 55vh;
  flex-direction: column;
}

.logo-name {
  font-family: sans-serif;
  font-size: 120px;
  background: radial-gradient(circle, rgba(63, 94, 251, 1) 0%, rgba(252, 70, 107, 1) 100%);
  -webkit-background-clip: text;
  color: transparent;
  text-fill-color: transparent;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 25px;
}

.search-wrapper {
  position: relative;
  width: 700px;
}

.search-panel {
  width: 100%;
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

.suggestions-dropdown {
  position: absolute;
  top: 47px;
  left: 0;
  width: 100%;
  background: #2b2424;
  border: 2px solid gray;
  border-radius: 15px;
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
  font-size: 18px;
  cursor: pointer;
  transition: background 0.2s;
  height: 20px;
}

.suggestions-dropdown li:first-child {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.suggestions-dropdown li:last-child {
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.suggestions-dropdown li:hover,
.suggestions-dropdown li.highlighted {
  background: #007bff;
}

.delete-button {
  background: transparent;
  border: none;
  color: #ff4444;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.delete-button:hover {
  color: #ff6666;
}

.search-button {
  width: 45px;
  height: 45px;
  background: #333;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button:hover {
  background: #007bff;
}

.mic-button {
  width: 45px;
  height: 45px;
  background: #333;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mic-button:hover {
  background: #ff4444;
}

.mic-button.listening {
  background: #ff4444;
}
</style>
