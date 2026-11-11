<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTodoStore } from '@/stores/todo'

const auth = useAuthStore()
const todoStore = useTodoStore()

// Les 3 premières tâches encore à faire, pour l'aperçu
const nextTodos = computed(() => todoStore.todos.filter((todo) => !todo.done).slice(0, 3))

// Exemple affiché aux visiteurs non connectés
const exampleTodos = [
  { id: 1, title: 'Relire le cours sur Vue Router', done: true },
  { id: 2, title: 'Terminer le mini-projet', done: false },
  { id: 3, title: "Préparer l'oral", done: false },
]

const features = [
  { id: 1, title: 'Ajoutez', text: 'Notez une tâche en quelques secondes depuis le formulaire.' },
  { id: 2, title: 'Cochez', text: 'Un clic suffit pour marquer une tâche comme terminée.' },
  { id: 3, title: 'Suivez', text: 'Le compteur vous montre ce qu’il reste à faire.' },
]
</script>

<template>
  <section class="page">
    <div class="hero">
      <div class="hero-text">
        <span class="eyebrow">Mini-projet Vue.js</span>
        <h1>Vos tâches, sans prise de tête.</h1>
        <p class="lead">
          Coché est une petite application pour noter ce que vous avez à faire, cocher ce qui est fini
          et garder un œil sur ce qui reste.
        </p>

        <div class="hero-actions">
          <RouterLink v-if="auth.isLogged" :to="{ name: 'todos' }" class="btn btn-primary">Voir mes tâches</RouterLink>
          <RouterLink v-else :to="{ name: 'login' }" class="btn btn-primary">Se connecter</RouterLink>
          <RouterLink :to="{ name: 'about' }" class="btn btn-secondary">En savoir plus</RouterLink>
        </div>
      </div>

      <aside class="card preview">
        <template v-if="auth.isLogged">
          <p class="preview-title">Bonjour {{ auth.username }} 👋</p>
          <p class="preview-count">
            <strong>{{ todoStore.remaining }}</strong>
            {{ todoStore.remaining > 1 ? 'tâches à faire' : 'tâche à faire' }}
          </p>
          <ul v-if="nextTodos.length > 0" class="preview-list">
            <li v-for="todo in nextTodos" :key="todo.id">
              <span class="box"></span>
              <RouterLink :to="{ name: 'todo-detail', params: { id: todo.id } }">{{ todo.title }}</RouterLink>
            </li>
          </ul>
          <p v-else class="preview-empty">Rien en attente pour l’instant.</p>
        </template>

        <template v-else>
          <p class="preview-title">Exemple de liste</p>
          <ul class="preview-list">
            <li v-for="todo in exampleTodos" :key="todo.id" :class="{ done: todo.done }">
              <span class="box"></span>
              <span>{{ todo.title }}</span>
            </li>
          </ul>
        </template>
      </aside>
    </div>

    <div class="features">
      <article v-for="feature in features" :key="feature.id" class="card feature">
        <span class="feature-number">0{{ feature.id }}</span>
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.text }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  align-items: center;
  gap: 40px;
  padding: 24px 0 48px;
}

.hero h1 {
  font-size: clamp(2.2rem, 5vw, 3.2rem);
  margin-bottom: 16px;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.preview {
  transform: rotate(1.5deg);
}

.preview-title {
  margin-bottom: 6px;
  color: var(--muted);
  font-size: 0.9rem;
}

.preview-count {
  font-size: 1.05rem;
}

.preview-count strong {
  color: var(--accent);
  font-family: var(--font-title);
  font-size: 2rem;
}

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

.preview-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-small);
  background: var(--surface-alt);
}

.preview-list a {
  color: var(--ink);
  text-decoration: none;
  overflow-wrap: anywhere;
}

.preview-list a:hover {
  color: var(--primary);
}

.box {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border: 2px solid #c9c1b4;
  border-radius: 6px;
}

.preview-list .done span:last-child {
  color: var(--muted);
  text-decoration: line-through;
}

.preview-list .done .box {
  border-color: var(--primary);
  background: var(--primary);
}

.preview-empty {
  margin: 12px 0 0;
  color: var(--muted);
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.feature p {
  margin: 0;
  color: var(--muted);
}

.feature-number {
  display: block;
  margin-bottom: 12px;
  color: var(--accent);
  font-family: var(--font-title);
  font-weight: 600;
}

@media (max-width: 800px) {
  .hero {
    grid-template-columns: 1fr;
    gap: 32px;
    padding-top: 8px;
  }

  .preview {
    transform: none;
  }

  .features {
    grid-template-columns: 1fr;
  }
}
</style>
