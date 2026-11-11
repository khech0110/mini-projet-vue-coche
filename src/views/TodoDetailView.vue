<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTodoStore } from '@/stores/todo'
import { useFetch } from '@/composables/useFetch'

const route = useRoute() // pour lire l'URL (le paramètre :id)
const router = useRouter() // pour changer de page depuis le code
const todoStore = useTodoStore()

// Si on arrive ici directement (sans passer par la liste), les tâches de départ
// ne sont peut-être pas encore chargées : on réutilise le même composable.
const { data, loading } = useFetch(import.meta.env.VITE_API_URL)
watch(data, (apiTodos) => {
  if (apiTodos) {
    todoStore.loadInitialTodos(apiTodos)
  }
})

// route.params.id est une chaîne de caractères : on la convertit en nombre.
// Le computed se recalcule tout seul si l'id dans l'URL change.
const todo = computed(() => todoStore.getTodoById(Number(route.params.id)))

function removeTodo() {
  todoStore.removeTodo(todo.value.id)
  router.push({ name: 'todos' })
}

// Petite fonction de mise en forme de la date (ex : 11 novembre 2026)
function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <section class="page">
    <RouterLink :to="{ name: 'todos' }" class="back">← Retour à la liste</RouterLink>

    <p v-if="!todo && loading && !todoStore.loaded" class="alert alert-info">Chargement de la tâche…</p>

    <article v-else-if="todo" class="card detail">
      <span class="status" :class="todo.done ? 'status-done' : 'status-todo'">
        {{ todo.done ? 'Terminée' : 'À faire' }}
      </span>

      <h1>{{ todo.title }}</h1>

      <dl class="infos">
        <div>
          <dt>Numéro</dt>
          <dd>#{{ todo.id }}</dd>
        </div>
        <div>
          <dt>Origine</dt>
          <dd>{{ todo.fromApi ? 'Tâche de départ (JSONPlaceholder)' : 'Ajoutée par vous' }}</dd>
        </div>
        <div v-if="todo.createdAt">
          <dt>Ajoutée le</dt>
          <dd>{{ formatDate(todo.createdAt) }}</dd>
        </div>
      </dl>

      <div class="actions">
        <button class="btn btn-primary" type="button" @click="todoStore.toggleTodo(todo.id)">
          {{ todo.done ? 'Remettre à faire' : 'Marquer comme terminée' }}
        </button>
        <button class="btn btn-danger" type="button" @click="removeTodo">Supprimer</button>
      </div>
    </article>

    <div v-else class="card not-found">
      <h1>Tâche introuvable</h1>
      <p class="lead">Aucune tâche ne porte le numéro « {{ route.params.id }} ». Elle a peut-être été supprimée.</p>
      <RouterLink :to="{ name: 'todos' }" class="btn btn-primary">Voir mes tâches</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.back {
  display: inline-block;
  margin-bottom: 20px;
  color: var(--muted);
  font-weight: 500;
  text-decoration: none;
}

.back:hover {
  color: var(--primary);
}

.detail {
  max-width: 680px;
  padding: 32px;
}

.detail h1 {
  margin: 16px 0 24px;
  overflow-wrap: anywhere;
}

.status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-todo {
  background: var(--accent-soft);
  color: #b2522a;
}

.status-done {
  background: var(--primary-soft);
  color: var(--primary);
}

.infos {
  display: grid;
  gap: 12px;
  margin: 0 0 28px;
  padding: 20px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.infos div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.infos dt {
  color: var(--muted);
}

.infos dd {
  margin: 0;
  font-weight: 500;
  text-align: right;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.not-found {
  max-width: 680px;
  padding: 32px;
}

@media (max-width: 520px) {
  .detail,
  .not-found {
    padding: 22px;
  }

  .actions .btn {
    width: 100%;
  }
}
</style>
