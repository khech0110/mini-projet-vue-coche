import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// Pinia doit être installé avant le routeur : le guard utilise le store d'authentification
app.use(createPinia())
app.use(router)

app.mount('#app')
