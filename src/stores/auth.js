import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'coche-user'

// Connexion simulée : pas de mot de passe ni de serveur.
// On garde juste le prénom dans le localStorage pour rester connecté après un rechargement.
export const useAuthStore = defineStore('auth', () => {
  const username = ref(localStorage.getItem(STORAGE_KEY) || '')

  const isLogged = computed(() => username.value !== '')

  function login(name) {
    username.value = name
    localStorage.setItem(STORAGE_KEY, name)
  }

  function logout() {
    username.value = ''
    localStorage.removeItem(STORAGE_KEY)
  }

  return { username, isLogged, login, logout }
})
