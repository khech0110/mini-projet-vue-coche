<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const name = ref('')
const error = ref('')

function submit() {
  if (name.value.length < 2) {
    error.value = 'Votre prénom doit contenir au moins 2 lettres.'
    return
  }

  auth.login(name.value)

  // Si le guard nous a envoyés ici, on retourne sur la page demandée au départ
  router.push(route.query.redirect || { name: 'todos' })
}
</script>

<template>
  <section class="page login-page">
    <div class="card login-card">
      <span class="eyebrow">Connexion</span>
      <h1>Content de vous voir</h1>
      <p class="muted">Entrez votre prénom pour accéder à vos tâches.</p>

      <p v-if="route.query.redirect" class="alert alert-info">
        Cette page est réservée aux utilisateurs connectés.
      </p>

      <form @submit.prevent="submit">
        <label class="label" for="name">Prénom</label>
        <input id="name" v-model.trim="name" class="input" type="text" placeholder="Ex : Cheikh" autocomplete="given-name" />
        <p v-if="error" class="form-error">{{ error }}</p>

        <button class="btn btn-primary submit" type="submit">Se connecter</button>
      </form>

      <p class="note">
        Connexion simulée pour le projet : pas de mot de passe, le prénom est seulement gardé dans votre navigateur.
      </p>
    </div>
  </section>
</template>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
}

.login-card {
  width: 100%;
  max-width: 440px;
  padding: 36px 32px;
}

.muted {
  color: var(--muted);
}

.alert {
  margin-bottom: 20px;
}

.submit {
  width: 100%;
  margin-top: 20px;
}

.note {
  margin: 24px 0 0;
  padding-top: 18px;
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 0.85rem;
}

@media (max-width: 520px) {
  .login-card {
    padding: 26px 20px;
  }
}
</style>
