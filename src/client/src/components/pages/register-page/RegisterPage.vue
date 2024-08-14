<template>
  <div class="register-page">
    <div class="register-logo">Register</div>
    <form class="form">
      <input type="text" v-model="user.name" placeholder="Name" class="name" />
      <input type="text" v-model="user.surname" placeholder="Surname" class="surname" />
      <input type="email" v-model="user.email" placeholder="Email" class="email" />
      <input type="password" v-model="user.password" placeholder="Password" class="password" />
    </form>
    <div class="buttons">
      <button type="submit" @click="registerUser" class="signup">Sign up</button>
      <button @click="goToMain" type="submit" class="back">Back</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

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

.signup:hover {
  font-size: 20px;
  width: 150px;
  background: rgba(85, 243, 45, 0.568);
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

.register-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 65vh;
}

.register-logo {
  font-size: 70px;
  color: white;
  webkit-background-clip: text;
  text-fill-color: transparent;
}

.form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.buttons {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
}

.name {
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
