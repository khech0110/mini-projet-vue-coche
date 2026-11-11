<script setup>
const technologies = ['Vue 3', 'Vite', 'Vue Router 4', 'Pinia', 'JavaScript', 'CSS']

const notions = [
  { id: 1, title: 'Composants', text: 'TodoItem reçoit une tâche en prop et prévient la page avec des événements (emit).' },
  { id: 2, title: 'Formulaire', text: 'TodoForm utilise v-model pour lier le champ de saisie à une variable.' },
  { id: 3, title: 'Pinia', text: 'Le store useTodoStore garde la liste des tâches et la partage entre les pages.' },
  { id: 4, title: 'Vue Router', text: "Cinq pages, une route avec paramètre (/todos/:id) et un guard qui protège la liste." },
  { id: 5, title: 'Composable', text: "useFetch récupère les tâches de départ et gère le chargement et les erreurs." },
  { id: 6, title: 'Transitions', text: "Un fondu entre les pages et une animation à l'ajout et à la suppression." },
]
</script>

<template>
  <section class="page">
    <header class="page-header">
      <span class="eyebrow">À propos</span>
      <h1>Le projet</h1>
      <p class="lead">
        Coché est le mini-projet de fin du module « Base du Vue.js ». Le but : réunir dans une seule
        application les notions vues en cours.
      </p>
    </header>

    <div class="tech-list">
      <span v-for="tech in technologies" :key="tech" class="tech">{{ tech }}</span>
    </div>

    <h2>Ce qu'on retrouve dans l'application</h2>
    <div class="notions">
      <article v-for="notion in notions" :key="notion.id" class="card notion">
        <h3>{{ notion.title }}</h3>
        <p>{{ notion.text }}</p>
      </article>
    </div>

    <div class="card api">
      <h2>D'où viennent les tâches de départ ?</h2>
      <p>
        Le sujet propose l'API <code>data.economie.gouv.fr/api/v2/catalog/facets</code>. Nous l'avons testée :
        elle renvoie des catégories du catalogue de données publiques (thèmes, producteurs, années…),
        pas des tâches. L'utiliser ici n'aurait pas eu de sens.
      </p>
      <p>
        Nous avons donc pris <strong>JSONPlaceholder</strong>, l'exemple cité dans le sujet. C'est une fausse API
        gratuite faite pour s'entraîner. Elle renvoie de vraies tâches (un titre et un état terminé ou non).
        Les titres sont en faux latin, c'est normal.
      </p>
    </div>

    <p class="author">Réalisé par <strong>Cheikh SECK</strong> et <strong>Ivann BENINI</strong> · BTS SIO, 2e année.</p>
  </section>
</template>

<style scoped>
.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 40px;
}

.tech {
  padding: 6px 14px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  font-size: 0.9rem;
  font-weight: 500;
}

.notions {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
  margin: 16px 0 40px;
}

.notion {
  padding: 20px;
}

.notion h3 {
  color: var(--primary);
}

.notion p {
  margin: 0;
  color: var(--muted);
  font-size: 0.95rem;
}

.api {
  border-left: 4px solid var(--accent);
}

.api p:last-child {
  margin-bottom: 0;
}

code {
  padding: 2px 6px;
  border-radius: 6px;
  background: var(--surface-alt);
  font-size: 0.85em;
  overflow-wrap: anywhere;
}

.author {
  margin-top: 32px;
  color: var(--muted);
}
</style>
