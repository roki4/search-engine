import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
  }),

  actions: {
    async login(credentials) {
      try {
        const response = await axios.post('/api/login', credentials);
        this.user = response.data.user;
        this.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(this.user));
      } catch (error) {
        console.error(error);
      }
    },

    async logout() {
      try {
        await axios.post('/api/logout');
        this.user = null;
        this.isAuthenticated = false;
        localStorage.removeItem('user');
      } catch (error) {
        console.error('Logout error:', error);
      }
    },

    initializeAuth() {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.user = JSON.parse(storedUser);
        this.isAuthenticated = true;
      }
    },
  },
});