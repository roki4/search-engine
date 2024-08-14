import { createApp } from 'vue';
import './assets/styles.css';
// import App from './components/pages/main-page/MainPage.vue';
import App from './App.vue';
import router from './router';

createApp(App).use(router).mount('#app');