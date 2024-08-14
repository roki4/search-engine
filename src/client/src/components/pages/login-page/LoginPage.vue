<template>
  <div class="login-page">
    <div class="login-logo">Login</div>
    <form class="form">
      <input v-model="user.email" type="email" placeholder="Email" class="email" />
      <input v-model="user.password" type="password" placeholder="Password" class="password" />
    </form>
    <div class="buttons">
      <button @click="loginUser" type="submit" class="login">Log in</button>
      <button @click="goToMain" type="submit" class="back">Back</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

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
  methods: {
    goToMain() {
      this.$router.push('/');
    },
    async loginUser() {
      try {
        const response = await axios.post('/api/login', {
          email: this.user.email,
          password: this.user.password,
        });
        console.log('logresp: \n', response);
        this.$router.push('/');
      } catch (error) {
        console.error('Ошибка при входе в систему:', error);
      }
    },
  },
};
</script>

<style scoped>
button {
  font-size: 18px;
  width: 150px;
  height: 45px;
  background: black;
  border-radius: 15px;
  border: none;
  color: white;
  opacity: 0.8;
  transition: 0.4s;
  cursor: pointer;
  font-weight: bold;
}

.login:hover {
  font-size: 20px;
  width: 150px;
  background: rgba(24, 58, 211, 0.568);
  border-radius: 12px;
  color: white;
  opacity: 1;
  transition: 0.4s;
  cursor: pointer;
  font-weight: bold;
}

.back:hover {
  font-size: 21px;
  width: 150px;
  background: white;
  border-radius: 12px;
  color: black;
  opacity: 1;
  transition: 0.4s;
  cursor: pointer;
  font-weight: bold;
}

.buttons {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
}

.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 65vh;
}

.login-logo {
  font-size: 70px;
  background: white;
  -webkit-background-clip: text;
  color: transparent;
  text-fill-color: transparent;
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
  background: transparent;
  border: 1px solid gray;
  color: white;
  padding: 0 15px 0px 15px;
  font-size: 15px;
}

input:focus {
  height: 40px;
  width: 350px;
  border-radius: 15px;
  outline: none;
  background: transparent;
  border: 1px solid white;
  color: white;
  padding: 0 15px 0px 15px;
  font-size: 15px;
}
</style>
