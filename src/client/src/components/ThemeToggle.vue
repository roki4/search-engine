<template>
  <button
    class="theme-toggle"
    @click="toggleTheme"
    :title="theme === 'light' ? 'Тёмная тема' : 'Светлая тема'"
  >
    <i :class="theme === 'light' ? 'fas fa-moon' : 'fas fa-sun'"></i>
  </button>
</template>

<script>
export default {
  name: 'ThemeToggle',
  data() {
    return {
      theme: 'dark', // Начальная тема
    };
  },
  created() {
    // Загружаем тему из localStorage или системных настроек
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.theme = savedTheme;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      this.theme = 'light';
    }
    document.documentElement.setAttribute('data-theme', this.theme);
  },
  methods: {
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', this.theme);
      localStorage.setItem('theme', this.theme);
    },
  },
};
</script>

<style scoped>
.theme-toggle {
  position: fixed;
  top: 10px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: var(--button-bg);
  border-radius: 50%;
  border: none;
  color: var(--button-text);
  opacity: var(--button-opacity);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;
}

.theme-toggle:hover {
  opacity: var(--button-hover-opacity);
  background: #007bff;
}

.theme-toggle i {
  font-size: 20px;
}
</style>
