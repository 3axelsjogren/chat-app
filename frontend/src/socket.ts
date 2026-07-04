import { io } from 'socket.io-client'

const socket = io(import.meta.env.VITE_API_URL || undefined, {
  autoConnect: false,
  auth: {
    token: localStorage.getItem('token'),
  },
})

socket.on('connect', () => {
  console.log('Socket ansluten:', socket.id)
})

socket.on('connect_error', (err) => {
  console.log('Socket-anslutning misslyckades:', err.message)
})

export default socket