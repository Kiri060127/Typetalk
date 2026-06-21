const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Initialize Socket.IO
  const io = new Server(httpServer, {
    path: '/api/socket/io',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('register', (userId) => {
      socket.data.userId = userId
      console.log(`User ${userId} registered with socket ${socket.id}`)
    })

    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId)
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`)
    })

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId)
      console.log(`Socket ${socket.id} left conversation ${conversationId}`)
    })

    socket.on('send_message', (data) => {
      socket.to(data.conversationId).emit('new_message', data.message)
    })

    socket.on('typing', (data) => {
      socket.to(data.conversationId).emit('user_typing', { userId: data.userId })
    })

    // WebRTC signaling
    socket.on('call_offer', (data) => {
      socket.broadcast.emit('incoming_call', {
        offer: data.offer,
        from: socket.data.userId,
        fromName: data.fromName,
      })
    })

    socket.on('call_answer', (data) => {
      socket.broadcast.emit('call_answered', {
        answer: data.answer,
        from: socket.data.userId,
      })
    })

    socket.on('ice_candidate', (data) => {
      socket.broadcast.emit('ice_candidate', {
        candidate: data.candidate,
        from: socket.data.userId,
      })
    })

    socket.on('call_end', () => {
      socket.broadcast.emit('call_ended', { from: socket.data.userId })
    })

    socket.on('call_reject', () => {
      socket.broadcast.emit('call_rejected', { from: socket.data.userId })
    })

    socket.on('call_accept', () => {
      socket.broadcast.emit('call_accepted', { from: socket.data.userId })
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
