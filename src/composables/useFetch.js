import { ref } from 'vue'

// Composable qui récupère des données JSON depuis une URL.
// Il gère les 3 états vus en cours : chargement, erreur et données.
export function useFetch(url) {
  const data = ref(null) // résultat de l'appel
  const error = ref(null) // erreur éventuelle
  const loading = ref(true) // vrai tant que la réponse n'est pas arrivée

  fetch(url)
    .then((response) => {
      // fetch ne considère pas un 404 ou un 500 comme une erreur : on le fait nous-mêmes
      if (!response.ok) {
        throw new Error('Erreur HTTP ' + response.status)
      }
      return response.json()
    })
    .then((json) => (data.value = json))
    .catch((e) => (error.value = e))
    .finally(() => (loading.value = false)) // dans tous les cas, le chargement est fini

  return { data, error, loading }
}
