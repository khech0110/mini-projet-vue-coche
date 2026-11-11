<template>
  <section class="page not-found">
    <span class="code">404</span>
    <h1>Page introuvable</h1>
    <p class="lead">L'adresse demandée n'existe pas dans l'application.</p>
    <RouterLink to="/" class="btn btn-primary">Retour à l'accueil</RouterLink>
  </section>
</template>

<style scoped>
.not-found {
  text-align: center;
}

.code {
  display: block;
  color: var(--accent);
  font-family: var(--font-title);
  font-size: 4rem;
  font-weight: 600;
  line-height: 1;
}

.lead {
  margin: 0 auto 24px;
}
</style>
