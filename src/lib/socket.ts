import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      path: '/api/socket/io',
      autoConnect: true,
    })
  }
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function joinConversation(conversationId: string) {
  const s = getSocket()
  s.emit('join_conversation', conversationId)
}

export function leaveConversation(conversationId: string) {
  const s = getSocket()
  s.emit('leave_conversation', conversationId)
}

export function sendMessage(conversationId: string, message: any) {
  const s = getSocket()
  s.emit('send_message', { conversationId, message })
}

export function onNewMessage(callback: (message: any) => void) {
  const s = getSocket()
  s.on('new_message', callback)
}

export function offNewMessage(callback: (message: any) => void) {
  const s = getSocket()
  s.off('new_message', callback)
}
