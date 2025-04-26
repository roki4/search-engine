import { createWebHistory, createRouter } from 'vue-router';
import MainPage from '../components/pages/main-page/MainPage.vue';
import RegisterPage from '../components/pages/register-page/RegisterPage.vue';
import LoginPage from '../components/pages/login-page/LoginPage.vue';
import SearchResults from '../components/pages/search-results/SearchResults.vue';

const routes = [
  { path: '/', component: MainPage },
  { path: '/register', component: RegisterPage },
  { path: '/login', component: LoginPage },
  { path: '/search', component: SearchResults },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.onError((error) => {
  console.error('Ошибка маршрутизации:', error);
});

export default router;