'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getMbtiByCode } from '@/lib/mbti-data'
import { MessageCircle, Clock } from 'lucide-react'

interface Conversation {
  id: string
  otherUser: {
    id: string
    nickname: string | null
    avatar: string | null
    mbtiType: string | null
  } | null
  lastMessage: {
    id: string
    content: string
    createdAt: string
    senderId: string
  } | null
  updatedAt: string
}

export default function ChatListPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
  }, [])

  async function fetchConversations() {
    try {
      const response = await fetch('/api/conversations')
      const data = await response.json()
      if (data.conversations) {
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-6">
        <h1 className="text-2xl font-bold">聊天</h1>
        <p className="text-violet-100 text-sm mt-1">与你的朋友保持联系</p>
      </div>

      {/* Conversation List */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400">还没有聊天记录</p>
            <p className="text-gray-400 text-sm mt-1">去发现页找到感兴趣的人开始聊天吧</p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const mbtiInfo = conversation.otherUser?.mbtiType
              ? getMbtiByCode(conversation.otherUser.mbtiType)
              : null

            return (
              <div
                key={conversation.id}
                onClick={() => router.push(`/chat/${conversation.id}`)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                      {conversation.otherUser?.nickname?.[0] || '?'}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {conversation.otherUser?.nickname || '匿名用户'}
                        </h3>
                        {mbtiInfo && (
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: mbtiInfo.color }}
                          >
                            {conversation.otherUser?.mbtiType}
                          </span>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={12} />
                          {formatTime(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-500 mt-1 truncate">
                      {conversation.lastMessage?.content || '暂无消息'}
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
