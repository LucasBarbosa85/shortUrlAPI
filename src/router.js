import { createRouter, createWebHistory } from 'vue-router';
import LoginComponent from './components/LoginComponent.vue';
import ManageComponent from './components/ManageComponent.vue';

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    component: LoginComponent,
  },
  {
    path: '/manage/:userId',
    name: 'manage',
    component: ManageComponent,
    meta: { requiresAuth: true },
  },
  
  {
    path: '/:shortURL', 
    name: 'shortURL',
    component: ManageComponent,
    meta: { requiresAuth: true }, 
  },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;