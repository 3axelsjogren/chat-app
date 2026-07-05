import { io } from 'socket.io-client'

const socketUrl = window.location.origin

const socket = io(socketUrl, {
  autoConnect: false,
  auth: {
    token: localStorage.getItem('token'),
  },
})

socket.on('connect_error', (err) => {
  console.error('Socket-anslutning misslyckades:', err.message)
})

export default socket