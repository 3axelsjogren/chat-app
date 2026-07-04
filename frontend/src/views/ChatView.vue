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

interface Message {
  id: number
  sender_id: number
  receiver_id: number
  content: string
  is_read: number
  created_at: string
}

const selectedFriend = ref<Friend | null>(null)
const messages = ref<Message[]>([])
const newMessage = ref('')

const currentUserId = Number(localStorage.getItem('userId'))

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  router.push('/')
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
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

async function selectFriend(friend: Friend) {
  selectedFriend.value = friend
  messages.value = []

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/${friend.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    const data = await response.json()
    if (!response.ok) {
      errorMessage.value = data.error || 'Kunde inte hämta meddelanden'
      return
    }
    messages.value = data
  } catch (err) {
    errorMessage.value = 'Kunde inte ansluta till servern'
  }
}

async function sendMessage() {
  if (!selectedFriend.value) return
  if (newMessage.value.trim() === '') return

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        receiverId: selectedFriend.value.id,
        content: newMessage.value,
      }),
    })
    const data = await response.json()
    if (!response.ok) {
      errorMessage.value = data.error || 'Kunde inte skicka meddelande'
      return
    }
    newMessage.value = ''
    selectFriend(selectedFriend.value)
  } catch (err) {
    errorMessage.value = 'Kunde inte ansluta till servern'
  }
}
</script>

<template>
  <div class="chat-page">
    <!-- Vänster sidopanel -->
    <aside class="sidebar">
      <h2 class="sidebar-title">Vänner</h2>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <ul class="friends-list">
        <li v-for="friend in friends" :key="friend.id" class="friend-item" @click="selectFriend(friend)">
          {{ friend.username }}
        </li>
      </ul>

      <p v-if="friends.length === 0 && !errorMessage" class="empty-text">
        Du har inga vänner än.
      </p>

      <button class="logout-button" @click="logout">Logga ut</button>
    </aside>

    <!-- Höger chattyta -->
    <section class="chat-area">
  <!-- Ingen vän vald än -->
  <div v-if="!selectedFriend" class="chat-placeholder">
    <p>Välj en vän för att börja chatta</p>
  </div>

  <!-- Vän vald: visa konversationen -->
  <div v-else class="conversation">
    <div class="conversation-header">
      {{ selectedFriend.username }}
    </div>

    <div class="messages-list">
      <div
      v-for="message in messages"
      :key="message.id"
      class="message-bubble"
      :class="message.sender_id === currentUserId ? 'mine' : 'theirs'">
      <div class="message-content">{{ message.content }}</div>
      <div class="message-time">{{ formatTime(message.created_at) }}</div>
      </div>
      <p v-if="messages.length === 0" class="empty-text">
        Inga meddelanden än. Säg hej!
      </p>
    </div>
    <div class="message-input-area">
      <input
      v-model="newMessage"
      type="text"
      placeholder="Skriv ett meddelande..."
      class="message-input"
      @keyup.enter="sendMessage"
    />
  <button class="send-button" @click="sendMessage">Skicka</button>
</div>
  </div>
</section>
  </div>
</template>

<style scoped>
.chat-page {
  display: flex;
  height: calc(100vh - 200px); /* fyller höjden minus header/footer ungefär */
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
}

/* Sidopanel */
.sidebar {
  width: 280px;
  background-color: #f4f7fb;
  border-right: 1px solid #d9e2ec;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.sidebar-title {
  font-size: 1.3rem;
  color: #2d61b4;
  margin-bottom: 1rem;
}

.friends-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

.friend-item {
  padding: 0.75rem 1rem;
  background-color: white;
  border: 1px solid #d9e2ec;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  color: #1a3a7a;
  cursor: pointer;
  transition: background-color 0.15s;
}

.friend-item:hover {
  background-color: #e3ecf7;
}

.empty-text {
  color: #888;
  font-size: 0.9rem;
  flex: 1;
}

.error-text {
  color: #c0392b;
  font-size: 0.85rem;
}

.logout-button {
  margin-top: 1rem;
  background-color: #888;
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  cursor: pointer;
  border-radius: 6px;
}

.logout-button:hover {
  background-color: #666;
}

/* Chattyta */
.chat-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
}

.chat-placeholder {
  color: #aaa;
  font-size: 1.1rem;
}

.conversation {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.conversation-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #d9e2ec;
  font-weight: 600;
  color: #2d61b4;
  font-size: 1.1rem;
}

.messages-list {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.message-bubble {
  padding: 0.6rem 1rem;
  border-radius: 12px;
  max-width: 60%;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.message-bubble.mine {
  background-color: #2d61b4;
  color: white;
  align-self: flex-end;
}

.message-bubble.theirs {
  background-color: #e3ecf7;
  color: #1a3a7a;
  align-self: flex-start;
}

.message-content {
  font-size: 0.95rem;
}

.message-time {
  font-size: 0.7rem;
  opacity: 0.7;
  text-align: right;
}

.message-input-area {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #d9e2ec;
}

.message-input {
  flex: 1;
  padding: 0.6rem 1rem;
  border: 1px solid #d9e2ec;
  border-radius: 6px;
  font-size: 0.9rem;
}

.send-button {
  background-color: #2d61b4;
  color: white;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
}

.send-button:hover {
  background-color: #1a3a7a;
}
</style>