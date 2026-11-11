<script setup>
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

function logout() {
  auth.logout()
  router.push({ name: 'home' })
}
</script>

<template>
  <header class="site-header">
    <div class="container header-inner">
      <RouterLink to="/" class="brand">
        <svg class="brand-logo" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
          <rect width="32" height="32" rx="9" fill="#1f5c4a" />
          <path d="M9 16.5l4.5 4.5L23 11.5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="26" cy="6" r="3" fill="#e2774b" />
        </svg>
        <span>Coché</span>
      </RouterLink>

      <nav class="nav">
        <RouterLink to="/">Accueil</RouterLink>
        <!-- Le lien reste surligné aussi sur la page détail (/todos/:id) -->
        <RouterLink :to="{ name: 'todos' }" :class="{ 'router-link-active': route.name === 'todo-detail' }">
          Mes tâches
        </RouterLink>
        <RouterLink :to="{ name: 'about' }">À propos</RouterLink>
      </nav>

      <div class="user-zone">
        <template v-if="auth.isLogged">
          <span class="user-name">{{ auth.username }}</span>
          <button class="btn btn-secondary btn-small" @click="logout">Déconnexion</button>
        </template>
        <RouterLink v-else :to="{ name: 'login' }" class="btn btn-primary btn-small">Connexion</RouterLink>
      </div>
    </div>
  </header>

  <main class="container main">
    <!-- Transition fade entre les pages (mode out-in : l'ancienne page sort avant que la nouvelle entre) -->
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>

  <footer class="site-footer">
    <div class="container">Coché · Mini-projet Vue.js · BTS SIO · Cheikh SECK</div>
  </footer>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(246, 242, 235, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
}

.header-inner {
  display: flex;
  align-items: center;
  gap: 24px;
  min-height: 68px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--ink);
  font-family: var(--font-title);
  font-size: 1.35rem;
  font-weight: 600;
  text-decoration: none;
}

.nav {
  display: flex;
  gap: 4px;
  margin-right: auto;
}

.nav a {
  padding: 7px 14px;
  border-radius: 999px;
  color: var(--muted);
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;
}

.nav a:hover {
  color: var(--ink);
}

/* Classe ajoutée automatiquement par RouterLink sur le lien de la page en cours */
.nav a.router-link-active {
  background: var(--primary-soft);
  color: var(--primary);
}

.user-zone {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.user-name::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3aa57c;
}

.main {
  flex: 1;
}

.site-footer {
  padding: 24px 0;
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 0.85rem;
  text-align: center;
}

/* Sur mobile, la navigation passe sur une deuxième ligne */
@media (max-width: 720px) {
  .header-inner {
    flex-wrap: wrap;
    gap: 8px 12px;
    padding-top: 12px;
    padding-bottom: 10px;
  }

  .brand {
    margin-right: auto;
  }

  .nav {
    order: 3;
    width: 100%;
    margin-right: 0;
    overflow-x: auto;
  }

  .nav a {
    white-space: nowrap;
  }

  .user-name {
    display: none;
  }
}
</style>
