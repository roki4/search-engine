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
        <input
          v-model="searchQuery"
          type="text"
          class="search-panel"
          placeholder="Search..."
          @keyup.enter="performSearch"
        />
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
      isListening: false,
    };
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
        this.$router.push({
          path: '/search',
          query: { q: this.searchQuery },
        });
      }
    },
    async startSpeechRecognition() {
      if (this.isListening) return;

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Ваш браузер не поддерживает голосовой ввод');
        return;
      }

      // Проверяем разрешение на использование микрофона
      try {
        const permission = await navigator.permissions.query({ name: 'microphone' });
        if (permission.state === 'denied') {
          alert(
            'Доступ к микрофону заблокирован. Пожалуйста, разрешите доступ в настройках браузера.'
          );
          return;
        }
      } catch (error) {
        console.error('Ошибка проверки разрешений микрофона:', error);
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'ru-RU'; // Или 'ru-RU' для русского
      recognition.interimResults = true; // Включаем промежуточные результаты
      recognition.continuous = true; // Продолжаем слушать до остановки
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
          alert('Access to the microphone is denied. Allow access in your browser settings.');
        } else {
          console.error('Speech recognition error:', event.error);
          alert(`Voice input error: ${event.error}`);
        }
      };

      try {
        recognition.start();
      } catch (error) {
        console.error('Ошибка запуска распознавания:', error);
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
