# Coché – Mini-projet Vue.js

Projet réalisé par **Cheikh SECK** et **Ivann BENINI**, BTS SIO 2e année, dans le cadre du module « Base du Vue.js » (EPSI, promotion 2026-2027).

Coché est une petite application de gestion de tâches. Elle reprend le mini-projet de fin de cours : des pages avec Vue Router, un store Pinia, des composants qui communiquent avec des props et des événements, un composable qui appelle une API, un guard de navigation et des transitions.

---

## Fonctionnalités

- **Accueil** (`/`) : présentation de l'application. Une fois connecté, on voit le nombre de tâches restantes et les trois prochaines.
- **Liste des tâches** (`/todos`), réservée aux utilisateurs connectés :
  - ajout d'une tâche (champ obligatoire, 80 caractères maximum) ;
  - passage d'une tâche de « à faire » à « terminée », et inversement ;
  - suppression d'une tâche ;
  - compteurs (total, à faire, terminées) et barre de progression ;
  - filtres : toutes, à faire, terminées ;
  - tâches de départ chargées depuis une API publique.
- **Détail d'une tâche** (`/todos/:id`) : titre, statut, origine, date d'ajout, boutons pour changer le statut ou supprimer. Si l'identifiant n'existe pas, un message « Tâche introuvable » s'affiche.
- **À propos** (`/about`) : explication du projet et du choix de l'API.
- **Connexion** (`/login`) : connexion simulée avec un simple prénom, pour tester le guard.
- **Page 404** pour toute adresse inconnue.
- **Animations** : fondu entre les pages, glissement à l'ajout et à la suppression d'une tâche.
- **Sauvegarde** : les tâches et l'utilisateur connecté sont gardés dans le `localStorage` du navigateur, donc rien n'est perdu au rechargement.
- **Responsive** : l'interface s'adapte aux écrans de téléphone.

## Technologies utilisées

| Outil | Rôle |
|---|---|
| Vue 3 (`<script setup>`, Composition API) | Framework de l'interface |
| Vite | Serveur de développement et build |
| Vue Router 4 | Navigation entre les pages |
| Pinia | Store global (tâches et utilisateur) |
| JavaScript | Langage (pas de TypeScript) |
| CSS classique | Mise en forme, sans bibliothèque externe |
| JSONPlaceholder | API publique pour les tâches de départ |

Le projet a été créé avec `npm create vue@latest` en cochant Router et Pinia, comme demandé dans le sujet.

## Prérequis

- **Node.js** version 22.18 ou plus récente (Vite 8 l'exige). Vérifier avec `node -v`.
- **npm** (installé avec Node.js).
- Une connexion Internet pour charger les tâches de départ et les polices.

## Installation

```bash
cd todo-app
npm install
```

## Lancement

```bash
npm run dev        # serveur de développement sur http://localhost:5173
npm run build      # version de production dans le dossier dist/
npm run preview    # tester la version de production en local
```

Pour tester le guard : cliquer sur « Mes tâches » sans être connecté. On arrive sur la page de connexion. Après avoir entré un prénom, on revient automatiquement sur la page demandée.

## Organisation des fichiers

```
todo-app/
├── .env                      ← adresse de l'API (VITE_API_URL)
├── index.html                ← page HTML unique (langue, titre, polices)
├── package.json              ← dépendances et scripts npm
├── vite.config.js            ← configuration de Vite (alias @ = src)
├── public/
│   ├── favicon.svg           ← icône de l'onglet
│   └── _redirects            ← règle pour le déploiement sur Netlify
└── src/
    ├── main.js               ← crée l'application, installe Pinia et le routeur
    ├── App.vue               ← en-tête, menu, RouterView avec la transition, pied de page
    ├── assets/main.css       ← styles communs (couleurs, boutons, champs, transition fade)
    ├── components/
    │   ├── TodoItem.vue      ← une tâche de la liste (props + emit)
    │   └── TodoForm.vue      ← formulaire d'ajout (v-model)
    ├── composables/
    │   └── useFetch.js       ← appel d'API avec loading / error / data
    ├── router/
    │   └── index.js          ← routes et guard beforeEach
    ├── stores/
    │   ├── todo.js           ← useTodoStore : les tâches
    │   └── auth.js           ← useAuthStore : la connexion simulée
    └── views/
        ├── HomeView.vue      ← /
        ├── TodosView.vue     ← /todos
        ├── TodoDetailView.vue← /todos/:id
        ├── AboutView.vue     ← /about
        ├── LoginView.vue     ← /login
        └── NotFoundView.vue  ← toute autre adresse
```

## Fonctionnement de Pinia

Le store `useTodoStore` (`src/stores/todo.js`) est écrit comme dans le cours, avec `ref`, `computed` et des fonctions :

- **state** : `todos` (la liste) et `loaded` (les tâches de départ ont-elles déjà été chargées ?) ;
- **getters** : `remaining` (nombre de tâches restantes, demandé par le sujet) et `doneCount` ;
- **actions** : `addTodo`, `removeTodo`, `toggleTodo`, `getTodoById` et `loadInitialTodos`.

Une tâche a cette forme :

```js
{ id: 1794412467100, title: 'Réviser Pinia', done: false, fromApi: false, createdAt: '2026-11-11T…' }
```

Un `watch` surveille la liste et la sauvegarde dans le `localStorage` à chaque modification. Au démarrage, le store relit cette sauvegarde.

Comme le store est global, la page d'accueil, la liste et la page détail affichent toujours les mêmes données.

Un deuxième store, `useAuthStore` (`src/stores/auth.js`), garde le prénom de l'utilisateur connecté. Il expose `isLogged` (computed), `login()` et `logout()`. Il est utilisé par le menu et par le guard.

## Fonctionnement de useFetch

`src/composables/useFetch.js` reprend le composable vu en cours. Il reçoit une URL et renvoie trois `ref` :

- `loading` : `true` pendant l'appel ;
- `error` : l'erreur s'il y en a une (réseau coupé, ou code HTTP comme 404 / 500) ;
- `data` : le JSON reçu.

`fetch` ne lève pas d'erreur sur un code 404 ou 500 : c'est pour ça que le composable vérifie `response.ok` et lance lui-même une erreur.

Dans `TodosView.vue`, un `watch` sur `data` envoie les tâches reçues au store (`loadInitialTodos`). Le store ne les prend que la première fois. La page affiche :

- « Chargement des tâches de départ… » pendant l'appel ;
- un message d'erreur clair si l'appel échoue. On peut quand même ajouter ses propres tâches ;
- la liste une fois les données arrivées.

La page détail (`TodoDetailView.vue`) réutilise le même composable. Ainsi, si on ouvre directement `/todos/2` sans être passé par la liste, la tâche est quand même trouvée.

L'adresse de l'API est dans le fichier `.env` (`VITE_API_URL`), comme vu en cours. Elle est lue avec `import.meta.env.VITE_API_URL`.

### Choix de l'API

Le sujet donne l'adresse `https://data.economie.gouv.fr/api/v2/catalog/facets`. Nous l'avons testée : elle renvoie les « facettes » du catalogue de données publiques du ministère (`features`, `modified`, `publisher`…). Ce sont des catégories de jeux de données, pas des tâches. Faire passer ces données pour des tâches n'aurait pas eu de sens.

Nous avons donc utilisé **JSONPlaceholder** (`https://jsonplaceholder.typicode.com/todos`), aussi cité comme exemple dans le sujet. Cette API renvoie de vraies tâches avec `id`, `title` et `completed`. Nous gardons 6 tâches (`userId=1&_limit=6`). Leurs titres sont en faux latin : c'est normal pour cette API de test.

## Le guard de navigation

Dans `src/router/index.js`, les routes `/todos` et `/todos/:id` ont `meta: { requiresAuth: true }`.

Le guard global `router.beforeEach` s'exécute avant chaque changement de page :

1. si la page demande une connexion et que l'utilisateur n'est pas connecté, il renvoie vers `/login`. La page demandée est gardée dans `?redirect=…` ;
2. si un utilisateur déjà connecté va sur `/login`, il est renvoyé vers `/todos` ;
3. sinon, la navigation continue.

Après la connexion, `LoginView` utilise `router.push(route.query.redirect)` pour revenir sur la page demandée au départ.

Comme le dit le cours, ce guard est un confort d'interface : la vraie sécurité se fait toujours côté serveur. Ici la connexion est simulée exprès (pas de mot de passe, pas de serveur).

## Les transitions

- **Entre les pages** (`App.vue`) : `RouterView` avec `v-slot="{ Component }"`, entouré d'une `<Transition name="fade" mode="out-in">`. Les classes `.fade-…` sont dans `main.css`.
- **Ajout et suppression** (`TodosView.vue`) : `<TransitionGroup name="list" tag="ul">`. Une nouvelle tâche glisse depuis la gauche, une tâche supprimée part vers la droite, et les autres se décalent en douceur grâce à `.list-move`.
- **Message d'erreur du formulaire** : petite `<Transition name="fade">`.

## Choix techniques

- **`<script setup>` et Composition API** partout, comme dans le cours.
- **Lazy loading** des pages (`() => import(...)`) sauf l'accueil, pour alléger le premier chargement.
- **`useRoute()` dans la page détail** pour lire `route.params.id`. Le paramètre est une chaîne : on le convertit avec `Number()`. Le `computed` se met à jour si l'URL change.
- **`emit` plutôt qu'un accès direct au store dans les composants** : `TodoItem` et `TodoForm` ne connaissent pas Pinia. Ils préviennent la page avec des événements. Ils restent donc simples et réutilisables (« props vers le bas, événements vers le haut »).
- **`Date.now()` comme identifiant** des nouvelles tâches : simple et unique pour ce projet.
- **`localStorage`** pour garder les tâches et la connexion après un rechargement.
- **Vue Router 4** : `create-vue` installe maintenant Vue Router 5. Nous avons installé `vue-router@4` pour respecter le sujet et le cours.
- **CSS classique** avec des variables (`--primary`, `--accent`…) dans `main.css` pour garder le même style sur toutes les pages. Pas de framework CSS.

## Déploiement

```bash
npm run build
```

Le dossier `dist/` contient le site prêt à être mis en ligne (Netlify, Vercel, GitHub Pages…).

L'application utilise `createWebHistory` (adresses sans `#`). L'hébergeur doit donc renvoyer `index.html` pour toutes les adresses. Sinon, recharger la page `/todos` donnerait une erreur 404. Le fichier `public/_redirects` règle ce point pour Netlify : il suffit de déposer le dossier `dist/` sur [app.netlify.com/drop](https://app.netlify.com/drop).
