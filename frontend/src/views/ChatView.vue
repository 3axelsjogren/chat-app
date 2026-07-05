<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'
import socket from '@/socket'

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

interface PendingRequest {
  id: number
  requester_id: number
  requester_username: string
  created_at: string
}

const pendingRequests = ref<PendingRequest[]>([])
const searchQuery = ref('')
const searchResults = ref<Friend[]>([])

const currentUserId = Number(localStorage.getItem('userId'))
const unreadCounts = ref<Record<number, number>>({})

function logout() {
  socket.disconnect()
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  router.push('/')
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
}

async function searchUsers() {
  if (searchQuery.value.trim() === '') {
    searchResults.value = []
    return
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/friends/search?query=${searchQuery.value}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    )
    const data = await response.json()
    if (!response.ok) {
      errorMessage.value = data.error || 'Kunde inte söka'
      return
    }
    searchResults.value = data
  } catch (err) {
    errorMessage.value = 'Kunde inte ansluta till servern1'
  }
}

async function sendFriendRequest(userId: number) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/friends/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ addresseeId: userId }),
    })
    const data = await response.json()
    if (!response.ok) {
      errorMessage.value = data.error || 'Kunde inte skicka förfrågan'
      return
    }
    // Ta bort personen från sökresultaten så man ser att förfrågan skickats
    searchResults.value = searchResults.value.filter((u) => u.id !== userId)
  } catch (err) {
    errorMessage.value = 'Kunde inte ansluta till servern2'
  }
}

async function fetchFriends() {
  errorMessage.value = ''

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/friends`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    const data = await response.json()
    if (!response.ok) {
      errorMessage.value = data.error || 'Kunde inte hämta vänner'
      return
    }
    friends.value = data

  } catch (err) {
    errorMessage.value = 'Kunde inte ansluta till servern3'
  }
}

async function fetchPendingRequests() {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/friends/pending`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    const data = await response.json()
    if (!response.ok) {
      errorMessage.value = data.error || 'Kunde inte hämta förfrågningar'
      return
    }
    pendingRequests.value = data
  } catch (err) {
    errorMessage.value = 'Kunde inte ansluta till servern4'
  }
}

async function acceptRequest(friendshipId: number) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/friends/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ friendshipId }),
    })
    const data = await response.json()
    if (!response.ok) {
      errorMessage.value = data.error || 'Kunde inte acceptera'
      return
    }
    // Uppdatera listorna: ta bort från pending, hämta om vänner
    pendingRequests.value = pendingRequests.value.filter((r) => r.id !== friendshipId)
    fetchFriends()
  } catch (err) {
    errorMessage.value = 'Kunde inte ansluta till servern6'
  }
}

async function declineRequest(friendshipId: number) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/friends/decline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ friendshipId }),
    })
    const data = await response.json()
    if (!response.ok) {
      errorMessage.value = data.error || 'Kunde inte neka'
      return
    }
    pendingRequests.value = pendingRequests.value.filter((r) => r.id !== friendshipId)
  } catch (err) {
    errorMessage.value = 'Kunde inte ansluta till servern7'
  }
}

async function selectFriend(friend: Friend) {
  selectedFriend.value = friend
  unreadCounts.value[friend.id] = 0
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
    errorMessage.value = 'Kunde inte ansluta till servern8'
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
    errorMessage.value = 'Kunde inte ansluta till servern9'
  }
}

function handleIncomingMessage(message: Message) {
  const isOpenConversation =
    selectedFriend.value &&
    (message.sender_id === selectedFriend.value.id || message.receiver_id === selectedFriend.value.id)

  if (isOpenConversation) {
    messages.value.push(message)
  } else {
    const friendId = message.sender_id
    unreadCounts.value[friendId] = (unreadCounts.value[friendId] || 0) + 1
  }
}

onMounted(() => {
  fetchFriends()
  fetchPendingRequests()

  socket.auth = { token: localStorage.getItem('token') }
  socket.connect()

  socket.on('message:new', handleIncomingMessage)
})

onUnmounted(() => {
  socket.off('message:new', handleIncomingMessage)
})
</script>

<template>
  <div class="chat-page" :class="{ 'has-selected': selectedFriend }">
    <!-- Vänster sidopanel -->
    <aside class="sidebar">
      <h2 class="sidebar-title">Vänner</h2>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
      <div class="search-area">
        <input v-model="searchQuery" type="text" placeholder="Sök användare..." class="search-input"
          @keyup.enter="searchUsers" />
        <button class="search-button" @click="searchUsers">Sök</button>
      </div>

      <div v-if="pendingRequests.length > 0" class="pending-section">
        <h3 class="pending-title">Förfrågningar</h3>
        <ul class="pending-list">
          <li v-for="request in pendingRequests" :key="request.id" class="pending-item">
            <span>{{ request.requester_username }}</span>
            <div class="pending-buttons">
              <button class="accept-button" @click="acceptRequest(request.id)">✓</button>
              <button class="decline-button" @click="declineRequest(request.id)">✕</button>
            </div>
          </li>
        </ul>
      </div>

      <ul v-if="searchResults.length > 0" class="search-results">
        <li v-for="user in searchResults" :key="user.id" class="search-item">
          <span>{{ user.username }}</span>
          <button class="add-button" @click="sendFriendRequest(user.id)">+</button>
        </li>
      </ul>
      <ul class="friends-list">
        <li v-for="friend in friends" :key="friend.id" class="friend-item" @click="selectFriend(friend)">
          <span>{{ friend.username }}</span>
          <span v-if="unreadCounts[friend.id]" class="unread-badge">{{ unreadCounts[friend.id] }}</span>
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
          <button class="back-button" @click="selectedFriend = null"><-</button>
          {{ selectedFriend.username }}
        </div>

        <div class="messages-list">
          <div v-for="message in messages" :key="message.id" class="message-bubble"
            :class="message.sender_id === currentUserId ? 'mine' : 'theirs'">
            <div class="message-content">{{ message.content }}</div>
            <div class="message-time">{{ formatTime(message.created_at) }}</div>
          </div>
          <p v-if="messages.length === 0" class="empty-text">
            Inga meddelanden än. Säg hej!
          </p>
        </div>
        <div class="message-input-area">
          <input v-model="newMessage" type="text" placeholder="Skriv ett meddelande..." class="message-input"
            @keyup.enter="sendMessage" />
          <button class="send-button" @click="sendMessage">Skicka</button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.chat-page {
  display: flex;
  height: calc(100vh - 200px);
  /* fyller höjden minus header/footer ungefär */
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
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.unread-badge {
  background-color: #c0392b;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
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
  min-width: 0;
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
  min-width: 0;
}

.conversation-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #d9e2ec;
  font-weight: 600;
  color: #2d61b4;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.back-button {
  display: none;
  background: none;
  border: none;
  font-size: 1.3rem;
  color: #2d61b4;
  cursor: pointer;
  padding: 0;
  line-height: 1;
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
  overflow-wrap: break-word;
  word-break: break-word;
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

.search-area {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d9e2ec;
  border-radius: 6px;
  font-size: 0.85rem;
}

.search-button {
  background-color: #2d61b4;
  color: white;
  border: none;
  padding: 0.5rem 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.search-button:hover {
  background-color: #1a3a7a;
}

.search-results {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
}

.search-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background-color: #fff8e6;
  border: 1px solid #f0e0b0;
  border-radius: 6px;
  margin-bottom: 0.4rem;
  color: #1a3a7a;
}

.add-button {
  background-color: #2d61b4;
  color: white;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}

.add-button:hover {
  background-color: #1a3a7a;
}

.pending-section {
  margin-bottom: 1rem;
}

.pending-title {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 0.5rem;
}

.pending-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.pending-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background-color: #fef2f2;
  border: 1px solid #f0c0c0;
  border-radius: 6px;
  margin-bottom: 0.4rem;
  color: #1a3a7a;
}

.pending-buttons {
  display: flex;
  gap: 0.3rem;
}

.accept-button {
  background-color: #16a34a;
  color: white;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
}

.accept-button:hover {
  background-color: #15803d;
}

.decline-button {
  background-color: #c0392b;
  color: white;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
}

.decline-button:hover {
  background-color: #a93226;
}

@media (max-width: 700px) {
  .chat-page {
    overflow: hidden;
  }
  .sidebar {
    width: 100%;
  }
  .chat-area {
    display: none;
  }
  .chat-page.has-selected .sidebar {
    display: none;
  }
  .chat-page.has-selected .chat-area {
    display: flex;
  }
  .back-button {
    display: inline-flex;
  }
}
</style>