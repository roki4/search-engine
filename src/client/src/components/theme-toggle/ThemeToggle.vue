<template>
  <button
    class="theme-toggle"
    @click="toggleTheme"
    :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
  >
    <svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path v-if="isDark" class="moon" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      <circle v-else class="sun" cx="12" cy="12" r="5" />
      <line v-if="!isDark" x1="12" y1="2" x2="12" y2="4" />
      <line v-if="!isDark" x1="12" y1="20" x2="12" y2="22" />
      <line v-if="!isDark" x1="2" y1="12" x2="4" y2="12" />
      <line v-if="!isDark" x1="20" y1="12" x2="22" y2="12" />
      <line v-if="!isDark" x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line v-if="!isDark" x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line v-if="!isDark" x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line v-if="!isDark" x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  </button>
</template>

<script>
import { useDark, useToggle } from '@vueuse/core';

export default {
  name: 'ThemeToggle',
  setup() {
    const isDark = useDark({
      selector: 'html',
      attribute: 'data-theme',
      valueDark: 'dark',
      valueLight: 'light',
    });
    const toggleTheme = useToggle(isDark);

    return { isDark, toggleTheme };
  },
};
</script>

<style scoped>
.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.theme-toggle:hover {
  transform: scale(1.1);
}

.theme-icon {
  width: 24px;
  height: 24px;
  color: white;
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.moon {
  transform-origin: center;
  animation: moonAnimation 0.5s ease forwards;
}

.sun {
  transform-origin: center;
  animation: sunAnimation 0.5s ease forwards;
}

@keyframes moonAnimation {
  0% {
    transform: rotate(0deg) scale(1);
    opacity: 0;
  }
  100% {
    transform: rotate(360deg) scale(1);
    opacity: 1;
  }
}

@keyframes sunAnimation {
  0% {
    transform: rotate(0deg) scale(1);
    opacity: 0;
  }
  100% {
    transform: rotate(-360deg) scale(1);
    opacity: 1;
  }
}
</style>
