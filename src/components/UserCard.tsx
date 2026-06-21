'use client'

import { useRouter } from 'next/navigation'
import { getMbtiByCode } from '@/lib/mbti-data'
import { BadgeCheck, MessageCircle } from 'lucide-react'
import FriendButton from './FriendButton'

interface UserCardProps {
  user: {
    id: string
    nickname?: string | null
    name?: string | null
    avatar?: string | null
    mbtiType?: string | null
    isVerified?: boolean
    interests?: { id: string; name: string }[] | null
  }
}

export default function UserCard({ user }: UserCardProps) {
  const router = useRouter()
  const displayName = user.nickname || user.name || '匿名用户'
  const mbtiInfo = user.mbtiType ? getMbtiByCode(user.mbtiType) : null
  const interests = user.interests || []

  async function handleStartChat(e: React.MouseEvent) {
    e.stopPropagation()
    
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: user.id }),
      })

      const data = await response.json()
      if (data.conversation) {
        router.push(`/chat/${data.conversation.id}`)
      }
    } catch (error) {
      console.error('Failed to create conversation:', error)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-start gap-3">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
            {displayName[0] || '?'}
          </div>
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">
              {displayName}
            </h3>
            {user.isVerified && (
              <BadgeCheck size={18} className="text-amber-500 flex-shrink-0" />
            )}
          </div>
          
          {mbtiInfo && (
            <span
              className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: mbtiInfo.color }}
            >
              {user.mbtiType} · {mbtiInfo.name}
            </span>
          )}
          
          {interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {interests.slice(0, 4).map((interest) => (
                <span
                  key={interest.id}
                  className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded-md text-xs"
                >
                  {interest.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleStartChat}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 transition-colors"
        >
          <MessageCircle size={16} />
          发消息
        </button>
        <FriendButton userId={user.id} />
      </div>
    </div>
  )
}
