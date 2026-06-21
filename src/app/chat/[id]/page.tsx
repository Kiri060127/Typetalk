'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getMbtiByCode } from '@/lib/mbti-data'
import { getSocket, joinConversation, leaveConversation, sendMessage, onNewMessage, offNewMessage } from '@/lib/socket'
import { useWebRTC } from '@/hooks/useWebRTC'
import CallModal from '@/components/CallModal'
import { ArrowLeft, Phone, Send, Sparkles } from 'lucide-react'

interface Message {
  id: string
  content: string
  type: string
  senderId: string
  createdAt: string
  sender: {
    id: string
    nickname: string | null
    avatar: string | null
  }
}

interface ConversationInfo {
  id: string
  otherUser: {
    id: string
    nickname: string | null
    avatar: string | null
    mbtiType: string | null
  } | null
}

export default function ChatDetailPage() {
  const router = useRouter()
  const params = useParams()
  const conversationId = params.id as string

  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [conversation, setConversation] = useState<ConversationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [currentUserName, setCurrentUserName] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    callState,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    formatDuration,
  } = useWebRTC()

  useEffect(() => {
    fetchCurrentUser()
    fetchConversationInfo()
    fetchMessages()
    setupSocket()

    return () => {
      leaveConversation(conversationId)
      offNewMessage(handleNewMessage)
    }
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function fetchCurrentUser() {
    try {
      const response = await fetch('/api/auth/profile')
      const data = await response.json()
      if (data.user) {
        setCurrentUserId(data.user.id)
        setCurrentUserName(data.user.nickname || data.user.name || '')
        // Register socket with user ID
        getSocket().emit('register', data.user.id)
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error)
    }
  }

  function handleCall() {
    if (conversation?.otherUser?.id) {
      initiateCall(conversation.otherUser.id, currentUserName)
    }
  }

  async function fetchConversationInfo() {
    try {
      const response = await fetch(`/api/conversations`)
      const data = await response.json()
      if (data.conversations) {
        const conv = data.conversations.find((c: any) => c.id === conversationId)
        if (conv) {
          setConversation(conv)
        }
      }
    } catch (error) {
      console.error('Failed to fetch conversation info:', error)
    }
  }

  async function fetchMessages() {
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`)
      const data = await response.json()
      if (data.messages) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  function setupSocket() {
    joinConversation(conversationId)
    onNewMessage(handleNewMessage)
  }

  function handleNewMessage(message: Message) {
    setMessages((prev) => [...prev, message])
  }

  async function handleSendMessage() {
    if (!newMessage.trim()) return

    const content = newMessage.trim()
    setNewMessage('')

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          content,
          type: 'text',
        }),
      })

      const data = await response.json()
      if (data.message) {
        setMessages((prev) => [...prev, data.message])
        sendMessage(conversationId, data.message)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  async function handleAIIceBreaker() {
    if (!conversation?.otherUser?.mbtiType) return

    try {
      const response = await fetch('/api/ai/ice-breaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mbtiType: conversation.otherUser.mbtiType,
        }),
      })

      const data = await response.json()
      if (data.message) {
        setNewMessage(data.message)
      }
    } catch (error) {
      console.error('Failed to get ice breaker:', error)
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const mbtiInfo = conversation?.otherUser?.mbtiType
    ? getMbtiByCode(conversation.otherUser.mbtiType)
    : null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <button
          onClick={() => router.push('/chat')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>

        <div className="flex items-center gap-2 flex-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-bold">
            {conversation?.otherUser?.nickname?.[0] || '?'}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">
              {conversation?.otherUser?.nickname || '匿名用户'}
            </h2>
            {mbtiInfo && (
              <span
                className="text-xs text-white px-2 py-0.5 rounded-full"
                style={{ backgroundColor: mbtiInfo.color }}
              >
                {conversation?.otherUser?.mbtiType} · {mbtiInfo.name}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleCall}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Phone size={20} className="text-violet-600" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">开始聊天吧</p>
          </div>
        ) : (
          messages.map((message) => {
            const isMe = message.senderId === currentUserId
            return (
              <div
                key={message.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                    isMe
                      ? 'bg-violet-600 text-white rounded-br-md'
                      : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isMe ? 'text-violet-200' : 'text-gray-400'
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Call Modal */}
      <CallModal
        isOpen={callState.isCalling || callState.isReceiving || callState.isInCall}
        isCalling={callState.isCalling}
        isReceiving={callState.isReceiving}
        isInCall={callState.isInCall}
        remoteUserName={callState.remoteUserName}
        callDuration={formatDuration(callState.callDuration)}
        onAccept={acceptCall}
        onReject={rejectCall}
        onEnd={endCall}
      />

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 sticky bottom-16">
        {/* AI Ice Breaker Button */}
        <button
          onClick={handleAIIceBreaker}
          className="w-full mb-3 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full text-sm font-medium hover:from-amber-500 hover:to-orange-600 transition-colors"
        >
          <Sparkles size={16} />
          AI 破冰 - 基于对方 MBTI 生成话题
        </button>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-3 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
