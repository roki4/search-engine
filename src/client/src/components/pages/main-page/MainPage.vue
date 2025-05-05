<template>
  <div>
    <div class="header">
      <div class="header-content">
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
    <div class="main-content">
      <div class="logo-name">Quirk</div>
      <div class="search-container">
        <div class="search-wrapper">
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            class="search-panel"
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
      suggestions: [], // Now contains { text, isCorrected } objects
      historyCount: 0,
      isListening: false,
      highlightedIndex: -1,
    };
  },
  mounted() {
    // Initialize hotkeys
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
    // Cleanup hotkeys
    hotkeys.unbind('ctrl+/,cmd+/');
    hotkeys.unbind('esc');
  },
  methods: {
    /**
     * Navigate to login page.
     */
    goToLogin() {
      this.$router.push('/login');
    },
    /**
     * Navigate to register page.
     */
    goToRegister() {
      this.$router.push('/register');
    },
    /**
     * Navigate to profile page.
     */
    goToProfile() {
      this.$router.push('/profile');
    },
    /**
     * Log out the user and redirect to home page.
     * @async
     */
    async logout() {
      await this.authStore.logout();
      this.$router.push('/');
    },
    /**
     * Perform search and navigate to results page.
     */
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
    /**
     * Fetch autocomplete suggestions and spellcheck.
     * @async
     */
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

        // Check spelling
        let correctedQuery = this.searchQuery;
        const spellcheckResponse = await axios.get('/api/spellcheck', {
          params: { q: this.searchQuery },
        });
        if (
          spellcheckResponse.data.corrected &&
          spellcheckResponse.data.corrected !== this.searchQuery
        ) {
          correctedQuery = spellcheckResponse.data.corrected;
          suggestions.push({ text: correctedQuery, isCorrected: true });
        }

        // Get history suggestions for authenticated users
        if (this.authStore.isAuthenticated) {
          const response = await axios.get('/api/autocomplete', {
            headers: { 'x-user': JSON.stringify(this.authStore.user) },
            params: { q: correctedQuery },
          });
          const historySuggestions = (response.data.suggestions || [])
            .filter((s) => !suggestions.some((sug) => sug.text === s))
            .map((text) => ({ text, isCorrected: false }));
          suggestions = suggestions.concat(historySuggestions);
          this.historyCount = historySuggestions.length;
        }

        // Fill remaining slots with external suggestions
        if (suggestions.length < 5) {
          const response = await axios.get('/api/external-autocomplete', {
            params: { q: correctedQuery },
          });
          const external = (response.data.suggestions || [])
            .filter((s) => !suggestions.some((sug) => sug.text === s))
            .map((text) => ({ text, isCorrected: false }));
          suggestions = suggestions.concat(external).slice(0, 5);
        }

        this.suggestions = suggestions;
        this.highlightedIndex = -1; // Reset highlight
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        this.suggestions = [];
        this.historyCount = 0;
        this.highlightedIndex = -1;
      }
    },
    /**
     * Select a suggestion and perform search.
     * @param {Object} suggestion - Selected suggestion { text, isCorrected }.
     */
    selectSuggestion(suggestion) {
      this.searchQuery = suggestion.text;
      this.performSearch();
    },
    /**
     * Delete a suggestion from search history.
     * @async
     * @param {string} suggestion - Suggestion to delete.
     */
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
    /**
     * Check if a suggestion is from history.
     * @param {number} index - Index of suggestion.
     * @returns {boolean} True if from history.
     */
    isFromHistory(index) {
      return index < this.historyCount && !this.suggestions[index].isCorrected;
    },
    /**
     * Clear suggestions list.
     */
    clearSuggestions() {
      this.suggestions = [];
      this.historyCount = 0;
      this.highlightedIndex = -1;
    },
    /**
     * Handle keydown events for navigation and deletion.
     * @param {Event} event - Keydown event.
     */
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
    /**
     * Start speech recognition for voice input.
     * @async
     */
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
  padding: 0 10px;
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
