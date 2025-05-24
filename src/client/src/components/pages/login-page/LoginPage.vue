<template>
  <div class="login-page">
    <div class="login-logo">Вход</div>
    <form class="form">
      <input v-model="user.email" type="email" placeholder="Email" class="email" />
      <input v-model="user.password" type="password" placeholder="Пароль" class="password" />
    </form>
    <div class="buttons">
      <button @click="loginUser" type="submit" class="login">Войти</button>
      <button @click="goToMain" type="submit" class="back">Назад</button>
    </div>
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
    };
  },
  mounted() {
    hotkeys.filter = () => true;
    hotkeys('enter', (event) => {
      event.preventDefault();
      this.loginUser();
    });
  },
  beforeUnmount() {
    hotkeys.unbind('enter');
  },
  methods: {
    goToMain() {
      this.$router.push('/');
    },
    async loginUser() {
      const authStore = useAuthStore();
      try {
        await authStore.login({
          email: this.user.email,
          password: this.user.password,
        });
        this.$router.push('/');
      } catch (error) {
        console.error('Ошибка при входе в систему:', error);
      }
    },
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
  transition: background 0.3s ease;
}

.login-logo {
  font-size: 70px;
  color: var(--text-color);
  margin-bottom: 30px;
  transition: color 0.3s ease;
}

.form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.email {
  margin-top: 30px;
}

input {
  height: 40px;
  width: 350px;
  border-radius: 15px;
  outline: none;
  background: var(--input-bg);
  border: var(--input-border);
  color: var(--text-color);
  padding: 0 15px;
  font-size: 15px;
  transition: border 0.3s ease, background 0.3s ease, color 0.3s ease;
}

input:focus {
  border: var(--input-border-focus);
  background: var(--input-bg);
  color: var(--text-color);
}

.buttons {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
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
  transition: all 0.4s ease;
  cursor: pointer;
  font-weight: bold;
}

.login:hover {
  font-size: 20px;
  background: #007bff;
  color: #ffffff;
  border-radius: 12px;
  opacity: 1;
}

.back:hover {
  font-size: 20px;
  background: #cccccc;
  color: #000000;
  border-radius: 12px;
  opacity: 1;
}
</style>
