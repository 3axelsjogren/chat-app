<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  router.push('/')
}
</script>

<template>
  <div class="chat-page">
    <p>Välkommen till chatten! Här kommer vänlista och meddelanden att visas.</p>
    <button class="logout-button" @click="logout">Logga ut</button>
  </div>
</template>

<style scoped>
.chat-page {
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
}

.logout-button {
  margin-top: 1rem;
  background-color: #888;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
}

.logout-button:hover {
  background-color: #666;
}
</style>