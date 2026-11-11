# Présentation du projet Coché

Document de préparation à l'oral – Cheikh SECK.

Le but : comprendre chaque partie du projet et savoir l'expliquer avec mes propres exemples.

---

## 1. Fonctionnement général

Coché est une **SPA** (Single Page Application) : il n'y a qu'une seule page HTML (`index.html`). Vue Router change le composant affiché selon l'URL, sans recharger la page.

Parcours d'un utilisateur :

1. Il arrive sur l'**accueil** (`/`).
2. Il clique sur « Mes tâches ». Il n'est pas connecté, donc le **guard** l'envoie sur `/login`.
3. Il entre son prénom. Le **store auth** l'enregistre, puis il est renvoyé vers `/todos`.
4. La page `/todos` appelle l'**API** avec `useFetch` et remplit le **store Pinia** avec 6 tâches de départ.
5. Il ajoute une tâche avec **TodoForm**, coche ou supprime une tâche avec **TodoItem**. Les **animations** se lancent.
6. Il clique sur une tâche et arrive sur la **page détail** `/todos/:id`.

Le démarrage se fait dans `src/main.js` :

```js
const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

---

## 2. Rôle de chaque dossier

| Dossier / fichier | Rôle |
|---|---|
| `public/` | Fichiers copiés tels quels (icône, règle de déploiement) |
| `src/main.js` | Crée l'application et installe Pinia + le routeur |
| `src/App.vue` | Composant racine : menu, `RouterView`, pied de page |
| `src/assets/` | CSS global (`main.css`) |
| `src/components/` | Petits composants réutilisables : `TodoItem`, `TodoForm` |
| `src/views/` | Les pages, une par route |
| `src/router/` | La liste des routes et le guard |
| `src/stores/` | Les stores Pinia (données partagées) |
| `src/composables/` | La logique réutilisable (`useFetch`) |
| `.env` | L'adresse de l'API |

---

## 3. Rôle de chaque composant

| Composant | Rôle |
|---|---|
| `App.vue` | En-tête avec le logo, le menu (`RouterLink`) et le bouton connexion/déconnexion. Affiche la page en cours dans `RouterView` avec la transition fade. |
| `HomeView.vue` | Page d'accueil. Si on est connecté, affiche le nombre de tâches restantes et les 3 prochaines. |
| `TodosView.vue` | Page principale : compteurs, formulaire, filtres, liste animée, appel de l'API. |
| `TodoDetailView.vue` | Détail d'une tâche lue dans l'URL. Gère le cas « tâche introuvable ». |
| `AboutView.vue` | Présentation du projet et du choix de l'API. |
| `LoginView.vue` | Formulaire de connexion simulée. |
| `NotFoundView.vue` | Page 404. |
| `TodoItem.vue` | Une ligne de la liste : case à cocher, titre (lien vers le détail), bouton supprimer. |
| `TodoForm.vue` | Formulaire d'ajout d'une tâche. |

---

## 4. Le store Pinia (`src/stores/todo.js`)

**Pourquoi ?** Plusieurs pages ont besoin des mêmes tâches : l'accueil, la liste et le détail. Sans store, il faudrait passer la liste de composant en composant. Pinia la garde à un seul endroit.

Il est écrit comme un composant : `ref` pour les données, `computed` pour les getters, des fonctions pour les actions.

```js
export const useTodoStore = defineStore('todo', () => {
  const todos = ref(saved ? JSON.parse(saved) : [])       // state

  const remaining = computed(() =>                          // getter
    todos.value.filter((todo) => !todo.done).length)

  function addTodo(title) {                                 // action
    todos.value.unshift({ id: Date.now(), title: title, done: false, fromApi: false, createdAt: ... })
  }

  function toggleTodo(id) {
    const todo = getTodoById(id)
    if (todo) {
      todo.done = !todo.done
    }
  }
  ...
  return { todos, loaded, remaining, doneCount, getTodoById, addTodo, removeTodo, toggleTodo, loadInitialTodos }
})
```

Dans une page, on l'utilise ainsi (`TodosView.vue`) :

```js
const todoStore = useTodoStore()
```

```html
<span class="stat-value accent">{{ todoStore.remaining }}</span>
```

**Sauvegarde** : un `watch` surveille la liste et l'écrit dans le `localStorage` à chaque changement. L'option `{ deep: true }` permet de voir aussi les changements à l'intérieur des tâches, par exemple `done`.

```js
watch(todos, (newTodos) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos))
}, { deep: true })
```

Le second store, `useAuthStore` (`src/stores/auth.js`), garde le prénom de l'utilisateur. Il fournit `isLogged` (un `computed`), `login(name)` et `logout()`.

---

## 5. Le composable useFetch (`src/composables/useFetch.js`)

**Un composable**, c'est une fonction `useXxx` qui utilise `ref`, `computed` ou `watch` et renvoie ce dont on a besoin. On l'écrit une fois et on peut le réutiliser dans n'importe quel composant.

`useFetch` gère les **3 états** vus en cours :

```js
export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(true)

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erreur HTTP ' + response.status)
      }
      return response.json()
    })
    .then((json) => (data.value = json))
    .catch((e) => (error.value = e))
    .finally(() => (loading.value = false))

  return { data, error, loading }
}
```

Utilisation dans `TodosView.vue` :

```js
const { data, error, loading } = useFetch(import.meta.env.VITE_API_URL)

watch(data, (apiTodos) => {
  if (apiTodos) {
    todoStore.loadInitialTodos(apiTodos)
  }
})
```

```html
<p v-if="loading && !todoStore.loaded" class="alert alert-info">Chargement des tâches de départ…</p>
<p v-else-if="error && !todoStore.loaded" class="alert alert-error">
  Impossible de récupérer les tâches de départ ({{ error.message }}). …
</p>
```

**Réutilisation** : `TodoDetailView.vue` appelle aussi `useFetch`. Si on ouvre directement `/todos/2` sans être passé par la liste, les tâches de départ sont chargées et la tâche s'affiche. C'est tout l'intérêt d'un composable : la même logique dans deux composants, sans copier-coller.

**Pourquoi JSONPlaceholder ?** L'adresse data.economie.gouv.fr du sujet renvoie des catégories du catalogue de données publiques, pas des tâches. JSONPlaceholder, cité aussi dans le sujet, renvoie de vraies tâches (`id`, `title`, `completed`). `loadInitialTodos` convertit `completed` en `done` pour garder notre format.

---

## 6. Communication entre composants : props et emit

Règle du cours : **props vers le bas, événements vers le haut**.

**Le parent donne la tâche à l'enfant** avec une prop (`TodosView.vue`) :

```html
<TodoItem
  v-for="todo in filteredTodos"
  :key="todo.id"
  :todo="todo"
  @toggle="todoStore.toggleTodo"
  @delete="todoStore.removeTodo"
/>
```

**L'enfant déclare la prop et les événements** (`TodoItem.vue`) :

```js
defineProps({
  todo: { type: Object, required: true },
})

const emit = defineEmits(['toggle', 'delete'])
```

```html
<button class="delete" @click="emit('delete', todo.id)">…</button>
```

Au clic, `TodoItem` ne supprime rien lui-même : il **prévient** le parent en envoyant l'id. Le parent appelle `todoStore.removeTodo(id)`. La prop `todo` est en lecture seule : l'enfant ne la modifie jamais.

`TodoForm` fonctionne de la même façon : il émet `add` avec le titre, et la page appelle `todoStore.addTodo`.

---

## 7. v-model

`v-model` crée une **liaison dans les deux sens** entre un champ et une variable (`TodoForm.vue`) :

```js
const title = ref('')
```

```html
<input id="new-todo" v-model.trim="title" class="input" type="text" :maxlength="MAX_LENGTH" />
```

- Quand on tape, `title` change.
- Quand on écrit `title.value = ''` après l'ajout, le champ se vide.
- Le modificateur `.trim` retire les espaces au début et à la fin.

On s'en sert aussi pour afficher le compteur de caractères :

```js
const charsLeft = computed(() => MAX_LENGTH - title.value.length)
```

`@submit.prevent="submit"` empêche le rechargement de la page que ferait normalement un formulaire HTML.

Même principe dans `LoginView.vue` avec `v-model.trim="name"`.

---

## 8. Le guard (`src/router/index.js`)

On marque les routes protégées avec `meta` :

```js
{
  path: '/todos',
  name: 'todos',
  component: () => import('@/views/TodosView.vue'),
  meta: { requiresAuth: true },
},
```

Le guard global s'exécute **avant chaque changement de page** :

```js
router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLogged) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'login' && auth.isLogged) {
    return { name: 'todos' }
  }
})
```

- `to` = la page où l'on veut aller.
- Retourner une route = rediriger. Ne rien retourner = laisser passer.
- `redirect` garde la page demandée. Après la connexion, `LoginView` y renvoie l'utilisateur :

```js
router.push(route.query.redirect || { name: 'todos' })
```

---

## 9. Les transitions

**Entre les pages** (`App.vue`) : comme page 78 du cours.

```html
<RouterView v-slot="{ Component }">
  <Transition name="fade" mode="out-in">
    <component :is="Component" />
  </Transition>
</RouterView>
```

```css
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
```

Vue ajoute ces classes tout seul au bon moment. `mode="out-in"` : l'ancienne page disparaît avant que la nouvelle arrive.

**Ajout et suppression** (`TodosView.vue`) : `TransitionGroup` anime une liste.

```html
<TransitionGroup name="list" tag="ul" class="todo-list">
```

```css
.list-enter-from { opacity: 0; transform: translateX(-24px); }  /* arrive par la gauche */
.list-leave-to  { opacity: 0; transform: translateX(40px); }    /* part vers la droite */
.list-move      { transition: transform 0.35s ease; }           /* les autres glissent */
.list-leave-active { position: absolute; width: 100%; }
```

La dernière règle sort l'élément supprimé du flux pour que les autres puissent remonter en douceur. Le `:key="todo.id"` est indispensable : Vue sait ainsi quel élément entre ou sort.

---

## 10. Les principales fonctions et notions utilisées

| Notion | Où ? | Exemple |
|---|---|---|
| `ref()` | partout | `const title = ref('')` |
| `computed()` | store, pages | `remaining`, `filteredTodos`, `progress` |
| `watch()` | store, TodosView, TodoForm | sauvegarde, réception de l'API, effacer l'erreur |
| `v-if / v-else-if / v-else` | TodosView, Detail | chargement / erreur / liste ; tâche trouvée ou non |
| `v-for` + `:key` | listes | `v-for="todo in filteredTodos" :key="todo.id"` |
| `v-bind` (`:`) | partout | `:todo="todo"`, `:class="{ done: todo.done }"`, `:style="{ width: progress + '%' }"` |
| `v-on` (`@`) | partout | `@click="emit('toggle', todo.id)"`, `@submit.prevent` |
| `v-model` | TodoForm, Login | `v-model.trim="title"` |
| `defineProps` / `defineEmits` | TodoItem, TodoForm | voir partie 6 |
| `useRoute()` | Detail, Login, App | `route.params.id`, `route.query.redirect` |
| `useRouter()` | Detail, Login, App | `router.push({ name: 'todos' })` |
| `RouterLink` / `RouterView` | App, pages | menu, lien vers le détail |
| Route à paramètre | router | `path: '/todos/:id'` |
| Lazy loading | router | `component: () => import('@/views/TodosView.vue')` |
| Variable d'environnement | `.env` | `VITE_API_URL`, lue avec `import.meta.env.VITE_API_URL` |
| `Transition` / `TransitionGroup` | App, TodosView, TodoForm | voir partie 9 |

Quelques fonctions à connaître :

- `addTodo(title)` : crée une tâche avec `id: Date.now()` et l'ajoute en haut avec `unshift`.
- `removeTodo(id)` : garde toutes les tâches sauf celle-là avec `filter`.
- `toggleTodo(id)` : retrouve la tâche avec `find` et inverse `done`.
- `loadInitialTodos(apiTodos)` : convertit les tâches de l'API avec `map`. Ne fait rien si c'est déjà chargé.
- `formatDate(isoDate)` (TodoDetailView) : affiche la date en français avec `toLocaleDateString('fr-FR', …)`.

---

## 11. Questions possibles du professeur

**Pourquoi utiliser Pinia et pas juste des props ?**
Les tâches sont utilisées par plusieurs pages qui n'ont pas de lien parent/enfant : l'accueil, la liste et le détail. Avec Pinia, elles sont rangées à un seul endroit, et toutes les pages voient les mêmes données.

**Quelle différence entre `computed` et `watch` ?**
Un `computed` calcule et renvoie une valeur (ex : `remaining`). Un `watch` déclenche une action quand une donnée change et ne renvoie rien (ex : sauvegarder dans le `localStorage`).

**À quoi sert `.value` ?**
Une `ref` est une boîte réactive. Dans le `<script>`, on lit et on modifie son contenu avec `.value`. Dans le `<template>`, Vue le fait tout seul.

**Pourquoi `TodoItem` émet un événement au lieu de supprimer la tâche lui-même ?**
Une prop est en lecture seule, et le composant doit rester simple et réutilisable. Il prévient le parent (« on veut supprimer la tâche 3 »), et c'est le parent qui décide quoi faire.

**Que fait `:key` dans le `v-for` ?**
Il donne un identifiant unique et stable à chaque élément. Vue sait ainsi quelle tâche a été ajoutée, déplacée ou supprimée. C'est indispensable pour les animations du `TransitionGroup`. On utilise `todo.id` et pas l'index, car la liste change.

**Différence entre `useRoute()` et `useRouter()` ?**
`useRoute()` sert à lire la route actuelle, par exemple `route.params.id`. `useRouter()` sert à naviguer, par exemple `router.push('/todos')`.

**Pourquoi `Number(route.params.id)` ?**
Les paramètres d'URL sont toujours des chaînes de caractères. Nos `id` sont des nombres, donc sans conversion `find` ne trouverait jamais la tâche (`'2' !== 2`).

**Que se passe-t-il si on va sur `/todos/999` ?**
`getTodoById` renvoie `undefined`, donc `todo` est vide. Le `v-else` affiche « Tâche introuvable » avec un lien vers la liste.

**Le guard sécurise-t-il vraiment l'application ?**
Non, c'est un confort d'interface. Tout le code est dans le navigateur, on pourrait le contourner. Une vraie protection se fait côté serveur. Ici la connexion est simulée exprès, comme demandé.

**Comment le guard sait-il que l'utilisateur est connecté ?**
Il lit `isLogged` dans le store `auth`. C'est un `computed` qui vaut `true` si un prénom est enregistré. Le prénom est aussi gardé dans le `localStorage` pour rester connecté après un rechargement.

**Pourquoi ne pas avoir utilisé l'API data.economie.gouv.fr ?**
Je l'ai testée : elle renvoie des catégories du catalogue de données publiques, pas des tâches. Les afficher comme des tâches aurait été faux. JSONPlaceholder, cité dans le sujet, renvoie de vraies tâches.

**Que se passe-t-il si l'API ne répond pas ?**
`fetch` échoue, le `.catch` remplit `error`, et la page affiche un message rouge. L'application reste utilisable : on peut ajouter ses propres tâches. Si l'API répond avec une erreur (404, 500), on la détecte avec `response.ok`.

**Pourquoi vérifier `response.ok` ?**
`fetch` ne considère comme erreur qu'un problème réseau. Une réponse 404 ou 500 passe dans le `.then`. On lance donc l'erreur nous-mêmes.

**À quoi sert `mode="out-in"` ?**
L'ancienne page termine sa sortie avant que la nouvelle commence son entrée. Sans ça, les deux pages seraient affichées en même temps pendant l'animation.

**Pourquoi `() => import(...)` dans les routes ?**
C'est le lazy loading : le code d'une page n'est téléchargé que quand on la visite. Le premier chargement est plus léger. On le voit dans le build : chaque page a son propre fichier `.js`.

**Pourquoi les nouvelles tâches ont un `id` comme `1794412467100` ?**
C'est `Date.now()`, le nombre de millisecondes depuis 1970. Il est différent à chaque ajout, donc unique. Pour un vrai projet avec une base de données, c'est le serveur qui donnerait l'id.

**À quoi sert le fichier `public/_redirects` ?**
Avec `createWebHistory`, les adresses n'ont pas de `#`. Si on recharge `/todos` sur un hébergeur, il chercherait un fichier `/todos` qui n'existe pas. Ce fichier dit à Netlify de toujours renvoyer `index.html`. Vue Router affiche ensuite la bonne page.

**Pourquoi les tâches restent après un rechargement ?**
Le `watch` du store les enregistre dans le `localStorage` du navigateur, et le store les relit au démarrage.

**Qu'est-ce qu'une SPA ?**
Une application avec une seule page HTML. Le JavaScript change le contenu affiché au lieu de charger une nouvelle page depuis le serveur.

---

## 12. Démonstration conseillée (2-3 minutes)

1. Accueil → cliquer « Mes tâches » : montrer la redirection vers la connexion (guard).
2. Se connecter → retour automatique sur `/todos`, avec les 6 tâches de l'API.
3. Ajouter une tâche vide (message d'erreur), puis une vraie tâche (animation).
4. Cocher une tâche : le compteur et la barre de progression changent (getter).
5. Supprimer une tâche (animation), essayer les filtres.
6. Ouvrir une tâche (page détail), changer son statut, puis taper `/todos/999` dans l'URL.
7. Recharger la page : tout est encore là.
8. Bonus : ouvrir Vue DevTools, onglet Pinia, pour montrer le contenu du store.
