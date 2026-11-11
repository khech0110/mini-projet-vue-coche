import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // URL propres, sans #
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/todos',
      name: 'todos',
      component: () => import('@/views/TodosView.vue'), // lazy loading
      meta: { requiresAuth: true },
    },
    {
      path: '/todos/:id',
      name: 'todo-detail',
      component: () => import('@/views/TodoDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      // Toutes les autres adresses : page introuvable
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

// Guard global : s'exécute avant chaque changement de page
router.beforeEach((to) => {
  const auth = useAuthStore()

  // Page protégée et utilisateur non connecté : direction la page de connexion.
  // On garde la page demandée dans "redirect" pour y revenir après la connexion.
  if (to.meta.requiresAuth && !auth.isLogged) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Inutile d'afficher la connexion à quelqu'un de déjà connecté
  if (to.name === 'login' && auth.isLogged) {
    return { name: 'todos' }
  }

  // Aucun retour = navigation autorisée
})

export default router
