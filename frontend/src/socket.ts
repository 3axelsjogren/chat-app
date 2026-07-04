import { io } from 'socket.io-client'

const socket = io(import.meta.env.VITE_API_URL || undefined, {
  autoConnect: false,
  auth: {
    token: localStorage.getItem('token'),
  },
})

socket.on('connect_error', (err) => {
  console.error('Socket-anslutning misslyckades:', err.message)
})

export default socket