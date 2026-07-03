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
        
        <div class="login-form">
          <input type="text" placeholder="Skriv ditt användarnamn" class="my-input" />
          <input type="password" placeholder="Lösenord" class="my-input" />
          <button class="my-button">Logga in</button>
          <p class="register-link">
          Har du inget konto? <a href="#">Registrera dig</a>
          </p>
        </div>
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
  font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  background-color: #2d61b4;
  color: white;
  padding: 2rem 3rem;
  width: 100%;
}

.app-header h1 {
  font-size: 2rem;
}

.app-main {
  font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
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

.my-button {
  font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
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

.my-input{
  font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  background-color: aliceblue;
  color: #1a3a7a;
  padding: 0.5rem;
  font-size: 0.8rem;
  border-radius: 4px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 300px;
}

.register-link {
  font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
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