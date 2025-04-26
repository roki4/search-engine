<template>
  <div>
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
    <div class="main-content">
      <div class="logo-name">Quirk</div>
      <div>
        <input type="text" class="search-panel" placeholder="Search..." />
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
  height: 50px; /* Увеличиваем высоту контейнера для соответствия header */
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
  height: 36px; /* Увеличиваем высоту кнопок */
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
  height: 36px; /* Увеличиваем высоту при ховере */
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
  height: 36px; /* Увеличиваем высоту при ховере */
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
  height: 36px; /* Увеличиваем высоту кнопки logout */
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
  height: 36px; /* Увеличиваем высоту при ховере */
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

.search-panel {
  width: 700px;
  height: 45px;
  border-radius: 15px;
  border: 2px solid gray;
  margin-top: 25px;
  color: white;
  font-size: 20px;
  outline: none;
  background: transparent;
  padding: 0 15px 0px 15px;
}

.search-panel:focus {
  width: 700px;
  height: 45px;
  border-radius: 15px;
  border: 2px solid white;
  margin-top: 25px;
  color: white;
  font-size: 20px;
  outline: none;
  background: transparent;
  padding: 0 15px 0px 15px;
}
</style>
