<script setup lang="ts">
import { ref } from 'vue'

const appName = ref('Chatt uapp!')
const welcomeMessage = ref('Välkommen! Logga in för att börja chatta.')
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1>{{ appName }}</h1>
    </header>

    <main class="app-main">
      <p class="welcome-text">{{ welcomeMessage }}</p>

      <div class="content-area">
        <!-- Framtida komponenter (login, chattlista etc.) hamnar här -->
      </div>
    </main>

    <footer class="app-footer">
      <p>Byggd av Axel</p>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.app-header {
  background-color: #2d61b4;
  color: white;
  padding: 2rem 3rem;
  width: 100%;
}

.app-header h1 {
  font-size: 2rem;
}

.app-main {
  flex: 1;
  padding: 2rem 3rem;
  width: 100%;
}

.welcome-text {
  font-size: 1.1rem;
  color: #333;
}

.content-area {
  margin-top: 2rem;
}

.app-footer {
  text-align: center;
  padding: 1rem;
  color: #888;
  font-size: 0.9rem;
}
</style>