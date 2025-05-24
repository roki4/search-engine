<template>
  <div class="register-page">
    <div class="register-logo">Регистрация</div>
    <form class="form" @submit.prevent="registerUser">
      <div class="input-group">
        <input
          v-model="user.name"
          type="text"
          placeholder="Имя"
          :class="{ 'input-error': errors.name }"
        />
        <div class="error" v-if="errors.name">{{ errors.name }}</div>
      </div>

      <div class="input-group">
        <input
          v-model="user.surname"
          type="text"
          placeholder="Фамилия"
          :class="{ 'input-error': errors.surname }"
        />
        <div class="error" v-if="errors.surname">{{ errors.surname }}</div>
      </div>

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
        <button type="submit" class="signup">Регистрация</button>
        <button type="button" @click="goToMain" class="back">Назад</button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
import hotkeys from 'hotkeys-js';

export default {
  name: 'RegisterPage',
  data() {
    return {
      user: {
        name: '',
        surname: '',
        email: '',
        password: '',
      },
      errors: {
        name: '',
        surname: '',
        email: '',
        password: '',
      },
    };
  },
  methods: {
    goToMain() {
      this.$router.push('/');
    },
    async registerUser() {
      this.errors = { name: '', surname: '', email: '', password: '' };
      const { name, surname, email, password } = this.user;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      let valid = true;

      if (!name) {
        this.errors.name = 'Имя обязательно';
        valid = false;
      }
      if (!surname) {
        this.errors.surname = 'Фамилия обязательна';
        valid = false;
      }
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
      } else if (password.length < 6) {
        this.errors.password = 'Пароль должен быть не менее 6 символов';
        valid = false;
      }

      if (!valid) return;

      try {
        const response = await axios.post('/api/register', { name, surname, email, password });
        console.log('response:', response);
        this.$router.push('/login');
      } catch (error) {
        this.errors.email = 'Такой email уже зарегистрирован';
        console.error('Ошибка при регистрации:', error);
      }
    },
  },
  mounted() {
    hotkeys.filter = () => true;
    hotkeys('enter', (e) => {
      e.preventDefault();
      this.registerUser();
    });
  },
  beforeUnmount() {
    hotkeys.unbind('enter');
  },
};
</script>

<style scoped>
.register-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 65vh;
  background: var(--background-color);
}
.register-logo {
  font-size: 60px;
  color: var(--text-color);
  margin-bottom: 20px;
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
.signup:hover {
  font-size: 20px;
  background: #28a745;
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
