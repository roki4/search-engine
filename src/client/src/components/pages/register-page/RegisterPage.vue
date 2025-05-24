<template>
  <div class="register-page">
    <div class="register-logo">Регистрация</div>
    <form class="form">
      <input type="text" v-model="user.name" placeholder="Имя" class="name" />
      <input type="text" v-model="user.surname" placeholder="Фамилия" class="surname" />
      <input type="email" v-model="user.email" placeholder="Email" class="email" />
      <input type="password" v-model="user.password" placeholder="Пароль" class="password" />
    </form>
    <div class="buttons">
      <button type="submit" @click="registerUser" class="signup">Регистрация</button>
      <button @click="goToMain" type="submit" class="back">Назад</button>
    </div>
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
    };
  },
  mounted() {
    hotkeys.filter = () => true;
    hotkeys('enter', (event) => {
      event.preventDefault();
      this.registerUser();
    });
  },
  beforeUnmount() {
    hotkeys.unbind('enter');
  },
  methods: {
    goToMain() {
      this.$router.push('/');
    },
    async registerUser() {
      try {
        const response = await axios.post('/api/register', {
          name: this.user.name,
          surname: this.user.surname,
          email: this.user.email,
          password: this.user.password,
        });
        console.log('response: \n', response);
        this.$router.push('/login');
      } catch (error) {
        console.error('Ошибка при регистрации:', error);
      }
    },
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
  transition: background 0.3s ease;
}

.register-logo {
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

.name {
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

.signup:hover {
  font-size: 20px;
  background: #28a745;
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
