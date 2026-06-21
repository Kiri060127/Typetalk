import { NextResponse } from 'next/server'
import { Server as SocketIOServer } from 'socket.io'
import { Server as NetServer } from 'http'

export async function GET(req: Request) {
  if ((global as any).io) {
    return NextResponse.json({ success: true, status: 'already-running' })
  }

  return NextResponse.json({ success: false, status: 'not-initialized' })
}

// Socket.IO 服务器初始化
export const dynamic = 'force-dynamic'

let io: SocketIOServer | null = null

function getIO() {
  return io
}

function initIO(server: NetServer) {
  if (io) return io

  io = new SocketIOServer(server, {
    path: '/api/socket/io',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // 用户注册
    socket.on('register', (userId: string) => {
      socket.data.userId = userId
      console.log(`User ${userId} registered with socket ${socket.id}`)
    })

    // 聊天室相关
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(conversationId)
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`)
    })

    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(conversationId)
      console.log(`Socket ${socket.id} left conversation ${conversationId}`)
    })

    socket.on('send_message', (data: { conversationId: string; message: any }) => {
      socket.to(data.conversationId).emit('new_message', data.message)
    })

    socket.on('typing', (data: { conversationId: string; userId: string }) => {
      socket.to(data.conversationId).emit('user_typing', { userId: data.userId })
    })

    // WebRTC 语音通话信令
    socket.on('call_offer', (data: { offer: RTCSessionDescriptionInit; to: string; fromName: string }) => {
      // 广播给目标用户
      socket.broadcast.emit('incoming_call', {
        offer: data.offer,
        from: socket.data.userId,
        fromName: data.fromName,
      })
    })

    socket.on('call_answer', (data: { answer: RTCSessionDescriptionInit; to: string }) => {
      socket.broadcast.emit('call_answered', {
        answer: data.answer,
        from: socket.data.userId,
      })
    })

    socket.on('ice_candidate', (data: { candidate: RTCIceCandidateInit; to: string }) => {
      socket.broadcast.emit('ice_candidate', {
        candidate: data.candidate,
        from: socket.data.userId,
      })
    })

    socket.on('call_end', (data: { to: string }) => {
      socket.broadcast.emit('call_ended', {
        from: socket.data.userId,
      })
    })

    socket.on('call_reject', (data: { to: string }) => {
      socket.broadcast.emit('call_rejected', {
        from: socket.data.userId,
      })
    })

    socket.on('call_accept', (data: { to: string }) => {
      socket.broadcast.emit('call_accepted', {
        from: socket.data.userId,
      })
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  return io
}
