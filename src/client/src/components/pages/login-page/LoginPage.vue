<template>
  <div class="login-page">
    <div class="login-logo">Вход</div>
    <form class="form" @submit.prevent="loginUser">
      <div class="input-group">
        <input
          v-model="user.email"
          type="email"
          placeholder="Email"
          :class="{ 'input-error': errors.email }"
        />
        <div class="error" v-if="errors.email">{{ errors.email }}</div>
      </div>

      <div class="input-group">
        <input
          v-model="user.password"
          type="password"
          placeholder="Пароль"
          :class="{ 'input-error': errors.password }"
        />
        <div class="error" v-if="errors.password">{{ errors.password }}</div>
      </div>

      <div class="buttons">
        <button type="submit" class="login">Войти</button>
        <button type="button" @click="goToMain" class="back">Назад</button>
      </div>
    </form>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import hotkeys from 'hotkeys-js';

export default {
  name: 'LoginPage',
  data() {
    return {
      user: {
        email: '',
        password: '',
      },
      errors: {
        email: '',
        password: '',
      },
    };
  },
  methods: {
    goToMain() {
      this.$router.push('/');
    },
    async loginUser() {
      this.errors = { email: '', password: '' };

      const { email, password } = this.user;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      let valid = true;

      if (!email) {
        this.errors.email = 'Email обязателен';
        valid = false;
      } else if (!emailRegex.test(email)) {
        this.errors.email = 'Неверный формат email';
        valid = false;
      }

      if (!password) {
        this.errors.password = 'Пароль обязателен';
        valid = false;
      }

      if (!valid) return;

      try {
        const authStore = useAuthStore();
        await authStore.login({ email, password });
        this.$router.push('/');
      } catch (error) {
        this.errors.password = 'Неверный email или пароль';
        console.error(error);
      }
    },
  },
  mounted() {
    hotkeys.filter = () => true;
    hotkeys('enter', (e) => {
      e.preventDefault();
      this.loginUser();
    });
  },
  beforeUnmount() {
    hotkeys.unbind('enter');
  },
};
</script>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 65vh;
  background: var(--background-color);
}
.login-logo {
  font-size: 50px;
  color: var(--text-color);
  margin-bottom: 30px;
}
.form {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.input-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 350px;
  margin-bottom: 15px;
}
input {
  height: 40px;
  width: 100%;
  border-radius: 15px;
  outline: none;
  background: var(--input-bg);
  border: var(--input-border);
  color: var(--text-color);
  padding: 0 15px;
  font-size: 15px;
}
.input-error {
  border: 2px solid #ff4d4f !important;
}
.error {
  color: #ff4d4f;
  font-size: 14px;
  margin-top: 4px;
}
.buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 5px;
}
button {
  font-size: 18px;
  width: 150px;
  height: 45px;
  background: var(--button-bg);
  border-radius: 15px;
  border: none;
  color: var(--button-text);
  opacity: 0.8;
  cursor: pointer;
  font-weight: bold;
}
.login:hover {
  font-size: 20px;
  background: #007bff;
  color: #ffffff;
  opacity: 1;
}
.back:hover {
  font-size: 20px;
  background: #cccccc;
  color: #000000;
  opacity: 1;
}
</style>
