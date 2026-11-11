<script setup>
// Le parent donne la tâche à afficher (prop)…
defineProps({
  todo: { type: Object, required: true },
})

// …et TodoItem prévient le parent quand on clique (événements)
const emit = defineEmits(['toggle', 'delete'])
</script>

<template>
  <li class="todo-item" :class="{ done: todo.done }">
    <button
      class="check"
      type="button"
      :aria-label="todo.done ? 'Marquer comme à faire' : 'Marquer comme terminée'"
      @click="emit('toggle', todo.id)"
    >
      <svg v-if="todo.done" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <RouterLink :to="{ name: 'todo-detail', params: { id: todo.id } }" class="title">
      {{ todo.title }}
    </RouterLink>

    <span v-if="todo.fromApi" class="tag">API</span>

    <button class="delete" type="button" aria-label="Supprimer la tâche" @click="emit('delete', todo.id)">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path d="M5 7h14M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  </li>
</template>

<style scoped>
.todo-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-small);
  box-shadow: 0 1px 2px rgba(28, 42, 38, 0.04);
  transition: border-color 0.2s, background-color 0.2s;
}

.todo-item:hover {
  border-color: #d6cdbf;
}

.check {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 2px solid #c9c1b4;
  border-radius: 8px;
  background: var(--surface);
  color: #fff;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

.check:hover {
  border-color: var(--primary);
}

.title {
  flex: 1;
  min-width: 0;
  color: var(--ink);
  text-decoration: none;
  overflow-wrap: anywhere;
}

.title:hover {
  color: var(--primary);
  text-decoration: underline;
}

.tag {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: #b2522a;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.delete {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.delete:hover {
  background: var(--danger-soft);
  color: var(--danger);
}

/* Tâche terminée */
.done {
  background: var(--surface-alt);
}

.done .check {
  border-color: var(--primary);
  background: var(--primary);
}

.done .title {
  color: var(--muted);
  text-decoration: line-through;
}
</style>
