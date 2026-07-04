<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref , onMounted} from 'vue'

interface Friend {
  id: number
  username: string
}

const router = useRouter()
const friends = ref<Friend[]>([])
const errorMessage = ref('')

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  router.push('/')
}

async function fetchFriends() {
  errorMessage.value = ''

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/friends`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    const data = await response.json()
    if(!response.ok){
      errorMessage.value = data.error || 'Kunde inte hämta vänner'
      return
    }
    friends.value = data

  }catch(err){
    errorMessage.value = 'Kunde inte ansluta till servern'
  }
  
}

onMounted(() => {
  fetchFriends()
})
</script>

<template>
  <div class="chat-page">
    <h2>Vänner</h2>
    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
    <ul>
      <li v-for="friend in friends" :key="friend.id">
        {{ friend.username }}
      </li>
</ul>
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