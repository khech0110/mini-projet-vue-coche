import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'coche-todos'

export const useTodoStore = defineStore('todo', () => {
  // ----- State -----
  // Au démarrage, on reprend les tâches sauvegardées dans le navigateur s'il y en a
  const saved = localStorage.getItem(STORAGE_KEY)
  const todos = ref(saved ? JSON.parse(saved) : [])

  // Vrai quand les tâches de départ ont déjà été récupérées (ou qu'une sauvegarde existe)
  const loaded = ref(saved !== null)

  // ----- Getters -----
  const remaining = computed(() => todos.value.filter((todo) => !todo.done).length)
  const doneCount = computed(() => todos.value.length - remaining.value)

  // ----- Actions -----
  function getTodoById(id) {
    return todos.value.find((todo) => todo.id === id)
  }

  function addTodo(title) {
    // unshift ajoute la tâche en haut de la liste
    todos.value.unshift({
      id: Date.now(), // nombre unique, suffisant pour ce projet
      title: title,
      done: false,
      fromApi: false,
      createdAt: new Date().toISOString(),
    })
  }

  function removeTodo(id) {
    todos.value = todos.value.filter((todo) => todo.id !== id)
  }

  function toggleTodo(id) {
    const todo = getTodoById(id)
    if (todo) {
      todo.done = !todo.done
    }
  }

  // Reçoit les tâches de JSONPlaceholder et les adapte à notre format
  function loadInitialTodos(apiTodos) {
    if (loaded.value) return

    const converted = apiTodos.map((item) => ({
      id: item.id,
      title: item.title,
      done: item.completed,
      fromApi: true,
      createdAt: null,
    }))

    // On garde les tâches éventuellement ajoutées avant la fin du chargement
    todos.value = [...todos.value, ...converted]
    loaded.value = true
  }

  // À chaque modification de la liste, on la sauvegarde dans le navigateur
  watch(
    todos,
    (newTodos) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos))
    },
    { deep: true },
  )

  return {
    todos,
    loaded,
    remaining,
    doneCount,
    getTodoById,
    addTodo,
    removeTodo,
    toggleTodo,
    loadInitialTodos,
  }
})
