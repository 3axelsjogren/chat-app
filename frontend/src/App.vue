<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'

const appName = ref('Chatt uapp!')
</script>

<template>
  <div class="app-container">
    <header class="app-header">
    <img src="/ch-logo.png" alt="Chatt-logga" class="logo" />
    <h1>{{ appName }}</h1>
    </header>

    <main class="app-main">
      <div class="content-area">
        <RouterView />
      </div>
    </main>

    <footer class="app-footer">
      <p>byggd av axel, kingen med stort K själv</p>
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
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  background-color: #2d61b4;
  color: white;
  padding: 2rem 3rem;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.app-header h1 {
  font-size: 2rem;
}

.logo {
  width: 40px;
  height: 40px;
}

.app-main {
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  flex: 1;
  padding: 2rem 3rem;
  width: 100%;
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