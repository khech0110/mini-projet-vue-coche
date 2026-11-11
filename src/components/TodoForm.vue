<script setup>
import { ref, computed, watch } from 'vue'

const MAX_LENGTH = 80

const emit = defineEmits(['add'])

const title = ref('') // lié au champ grâce à v-model
const error = ref('')

const charsLeft = computed(() => MAX_LENGTH - title.value.length)

// Dès que l'utilisateur recommence à écrire, on efface le message d'erreur
watch(title, (newTitle) => {
  if (newTitle !== '') {
    error.value = ''
  }
})

function submit() {
  if (title.value === '') {
    error.value = 'Écrivez quelque chose avant d’ajouter la tâche.'
    return
  }

  emit('add', title.value) // c'est le parent qui ajoute la tâche dans le store
  title.value = '' // on vide le champ
}
</script>

<template>
  <form class="todo-form card" @submit.prevent="submit">
    <label class="label" for="new-todo">Nouvelle tâche</label>

    <div class="row">
      <input
        id="new-todo"
        v-model.trim="title"
        class="input"
        type="text"
        :maxlength="MAX_LENGTH"
        placeholder="Ex : Réviser le cours sur Pinia"
        autocomplete="off"
      />
      <button class="btn btn-primary" type="submit">Ajouter</button>
    </div>

    <div class="footer">
      <Transition name="fade">
        <p v-if="error" class="form-error">{{ error }}</p>
      </Transition>
      <span class="counter" :class="{ low: charsLeft <= 10 }">{{ charsLeft }} caractères restants</span>
    </div>
  </form>
</template>

<style scoped>
.row {
  display: flex;
  gap: 10px;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  min-height: 28px;
}

.counter {
  margin-top: 8px;
  margin-left: auto;
  color: var(--muted);
  font-size: 0.8rem;
  white-space: nowrap;
}

.counter.low {
  color: var(--accent);
}

@media (max-width: 520px) {
  .row {
    flex-direction: column;
  }
}
</style>
