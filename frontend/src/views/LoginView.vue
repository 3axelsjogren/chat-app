<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const username = ref('')
const password = ref('')
</script>

<template>
  <div class="login-form">
    <input
      v-model="username"
      type="text"
      placeholder="Skriv ditt användarnamn"
      class="my-input"
    />
    <input
      v-model="password"
      type="password"
      placeholder="Lösenord"
      class="my-input"
    />
    <button class="my-button">Logga in</button>
    <p class="register-link">
      Har du inget konto? <RouterLink to="/register">Registrera dig</RouterLink>
    </p>
  </div>
</template>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 300px;
}

.my-button {
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  background-color: #2d61b4;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1rem;
}

.my-button:hover {
  background-color: #1a3a7a;
}

.my-input {
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  background-color: aliceblue;
  color: #1a3a7a;
  padding: 0.5rem;
  font-size: 0.8rem;
  border-radius: 4px;
}

.register-link {
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  font-size: 0.9rem;
  color: #555;
  text-align: center;
}

.register-link a {
  color: #225487;
  font-weight: 600;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>