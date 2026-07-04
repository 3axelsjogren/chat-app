<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import socket from '@/socket'



const username = ref('')
const password = ref('')
const errorMessage = ref('')
const router = useRouter()

async function handleLogin() {
  errorMessage.value = ''

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.error || 'Något gick fel'
      return
    }

    localStorage.setItem('token', data.token)
    localStorage.setItem('username', data.username)
    localStorage.setItem('userId', data.userId)

    socket.auth = { token: data.token }
    socket.connect()

    router.push('/chat')
  } catch (err) {
    errorMessage.value = 'Kunde inte ansluta till servern'
  }
}
</script>

<template>
  <p class="welcome-text">Välkommen! Logga in för att börja chatta.</p>
  <div class="login-form">
    <input
      v-model="username"
      type="text"
      placeholder="Skriv ditt användarnamn"
      class="my-input"
      @keyup.enter="handleLogin"
    />
    <input
      v-model="password"
      type="password"
      placeholder="Lösenord"
      class="my-input"
      @keyup.enter="handleLogin"
    />
    <button class="my-button" @click="handleLogin">Logga in</button>
    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
    <p class="register-link">
      Har du inget konto? <RouterLink to="/register">Registrera dig</RouterLink>
    </p>
  </div>
</template>

<style scoped>

.welcome-text {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 1rem;
}

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

.error-text {
  color: #c0392b;
  font-size: 0.85rem;
  margin: 0;
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