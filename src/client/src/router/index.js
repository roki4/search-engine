import { createWebHistory, createRouter } from 'vue-router'
import MainPage from '../components/pages/main-page/MainPage.vue';
import RegisterPage from '../components/pages/register-page/RegisterPage.vue';
import LoginPage from '../components/pages/login-page/LoginPage.vue';
'../components/pages/register-page/RegisterPage.vue';
const routes = [
  { path: '/', component: MainPage },
  { path: '/register', component: RegisterPage },
  { path: '/login', component: LoginPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router;