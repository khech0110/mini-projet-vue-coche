<script setup>
import { ref, computed, watch } from 'vue'
import { useTodoStore } from '@/stores/todo'
import { useAuthStore } from '@/stores/auth'
import { useFetch } from '@/composables/useFetch'
import TodoItem from '@/components/TodoItem.vue'
import TodoForm from '@/components/TodoForm.vue'

const todoStore = useTodoStore()
const auth = useAuthStore()

// Chargement des tâches de départ depuis l'API (adresse définie dans le fichier .env)
const { data, error, loading } = useFetch(import.meta.env.VITE_API_URL)

// Quand les données arrivent, on les donne au store (il ne les prend que la première fois)
watch(data, (apiTodos) => {
  if (apiTodos) {
    todoStore.loadInitialTodos(apiTodos)
  }
})

// ----- Filtres -----
const filters = [
  { value: 'all', label: 'Toutes' },
  { value: 'active', label: 'À faire' },
  { value: 'done', label: 'Terminées' },
]
const currentFilter = ref('all')

const filteredTodos = computed(() => {
  if (currentFilter.value === 'active') {
    return todoStore.todos.filter((todo) => !todo.done)
  }
  if (currentFilter.value === 'done') {
    return todoStore.todos.filter((todo) => todo.done)
  }
  return todoStore.todos
})

// ----- Textes et progression -----
const remainingText = computed(() => {
  const n = todoStore.remaining
  if (n === 0) return 'Plus rien à faire, bravo !'
  if (n === 1) return 'Il vous reste 1 tâche à faire.'
  return `Il vous reste ${n} tâches à faire.`
})

const progress = computed(() => {
  if (todoStore.todos.length === 0) return 0
  return Math.round((todoStore.doneCount / todoStore.todos.length) * 100)
})

const emptyText = computed(() => {
  if (currentFilter.value === 'active') return 'Aucune tâche en attente.'
  if (currentFilter.value === 'done') return 'Aucune tâche terminée pour le moment.'
  return 'Votre liste est vide. Ajoutez une première tâche !'
})
</script>

<template>
  <section class="page">
    <header class="page-header">
      <span class="eyebrow">Bonjour {{ auth.username }}</span>
      <h1>Mes tâches</h1>
      <p class="lead">{{ remainingText }}</p>
    </header>

    <div class="stats">
      <div class="stat card">
        <span class="stat-value">{{ todoStore.todos.length }}</span>
        <span class="stat-label">au total</span>
      </div>
      <div class="stat card">
        <span class="stat-value accent">{{ todoStore.remaining }}</span>
        <span class="stat-label">à faire</span>
      </div>
      <div class="stat card">
        <span class="stat-value">{{ todoStore.doneCount }}</span>
        <span class="stat-label">terminées</span>
      </div>
      <div class="stat card progress-card">
        <div class="progress-top">
          <span class="stat-label">Progression</span>
          <strong>{{ progress }} %</strong>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
      </div>
    </div>

    <TodoForm @add="todoStore.addTodo" />

    <div class="toolbar">
      <div class="filters" role="group" aria-label="Filtrer les tâches">
        <button
          v-for="filter in filters"
          :key="filter.value"
          type="button"
          class="filter"
          :class="{ active: currentFilter === filter.value }"
          @click="currentFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- États de l'appel API (affichés seulement tant que les tâches de départ ne sont pas chargées) -->
    <p v-if="loading && !todoStore.loaded" class="alert alert-info">Chargement des tâches de départ…</p>
    <p v-else-if="error && !todoStore.loaded" class="alert alert-error">
      Impossible de récupérer les tâches de départ ({{ error.message }}).
      Vous pouvez quand même ajouter vos propres tâches.
    </p>

    <!-- TransitionGroup anime l'ajout et la suppression des tâches -->
    <TransitionGroup name="list" tag="ul" class="todo-list">
      <TodoItem
        v-for="todo in filteredTodos"
        :key="todo.id"
        :todo="todo"
        @toggle="todoStore.toggleTodo"
        @delete="todoStore.removeTodo"
      />
    </TransitionGroup>

    <p v-if="filteredTodos.length === 0 && !loading" class="empty">{{ emptyText }}</p>
  </section>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr) 2fr;
  gap: 12px;
  margin-bottom: 20px;
}

.stat {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 16px 18px;
}

.stat-value {
  font-family: var(--font-title);
  font-size: 1.8rem;
  font-weight: 600;
  line-height: 1.1;
}

.stat-value.accent {
  color: var(--accent);
}

.stat-label {
  color: var(--muted);
  font-size: 0.85rem;
}

.progress-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 10px;
}

.progress-bar {
  height: 10px;
  border-radius: 999px;
  background: var(--primary-soft);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--primary);
  transition: width 0.4s ease;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 28px 0 14px;
}

.filters {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
}

.filter {
  padding: 6px 14px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.filter:hover {
  color: var(--ink);
}

.filter.active {
  background: var(--primary);
  color: #fff;
}

.todo-list {
  position: relative; /* nécessaire pour l'animation de suppression */
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.alert {
  margin-bottom: 14px;
}

.empty {
  padding: 32px 16px;
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  color: var(--muted);
  text-align: center;
}

/* ----- Animations de la liste (TransitionGroup name="list") ----- */
.list-enter-active,
.list-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

/* Une nouvelle tâche glisse depuis la gauche */
.list-enter-from {
  opacity: 0;
  transform: translateX(-24px);
}

/* Une tâche supprimée part vers la droite */
.list-leave-to {
  opacity: 0;
  transform: translateX(40px);
}

/* Les autres tâches se décalent en douceur */
.list-move {
  transition: transform 0.35s ease;
}

/* L'élément qui sort ne prend plus de place, pour que les autres puissent remonter */
.list-leave-active {
  position: absolute;
  width: 100%;
}

@media (max-width: 720px) {
  .stats {
    grid-template-columns: repeat(3, 1fr);
  }

  .progress-card {
    grid-column: 1 / -1;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}
</style>
