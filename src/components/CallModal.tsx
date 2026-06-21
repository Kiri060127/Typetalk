'use client'

import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react'
import { useState } from 'react'

interface CallModalProps {
  isOpen: boolean
  isCalling: boolean
  isReceiving: boolean
  isInCall: boolean
  remoteUserName: string | null
  callDuration: string
  onAccept: () => void
  onReject: () => void
  onEnd: () => void
}

export default function CallModal({
  isOpen,
  isCalling,
  isReceiving,
  isInCall,
  remoteUserName,
  callDuration,
  onAccept,
  onReject,
  onEnd,
}: CallModalProps) {
  const [isMuted, setIsMuted] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-gray-900 rounded-3xl p-8 w-full max-w-sm mx-4 text-center">
        {/* 头像 */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
          {remoteUserName?.[0] || '?'}
        </div>

        {/* 用户名 */}
        <h2 className="text-white text-xl font-semibold mb-2">
          {remoteUserName || '未知用户'}
        </h2>

        {/* 状态文字 */}
        <p className="text-gray-400 text-sm mb-8">
          {isCalling && '正在呼叫...'}
          {isReceiving && '来电中...'}
          {isInCall && callDuration}
        </p>

        {/* 动画波纹 */}
        {(isCalling || isReceiving) && (
          <div className="flex justify-center gap-1 mb-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}

        {/* 按钮 */}
        <div className="flex justify-center gap-6">
          {isReceiving && (
            <>
              <button
                onClick={onAccept}
                className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-white hover:bg-green-600 transition-colors"
              >
                <Phone size={24} />
              </button>
              <button
                onClick={onReject}
                className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
              >
                <PhoneOff size={24} />
              </button>
            </>
          )}

          {isCalling && (
            <button
              onClick={onEnd}
              className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
            >
              <PhoneOff size={24} />
            </button>
          )}

          {isInCall && (
            <>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-colors ${
                  isMuted ? 'bg-gray-600' : 'bg-gray-500 hover:bg-gray-600'
                }`}
              >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              <button
                onClick={onEnd}
                className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
              >
                <PhoneOff size={24} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
