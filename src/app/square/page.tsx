'use client'

import { useState, useEffect } from 'react'
import { getMbtiByCode } from '@/lib/mbti-data'
import {
  Heart,
  MessageCircle,
  Send,
  Clock,
} from 'lucide-react'
import ImageUploader from '@/components/ImageUploader'

interface Post {
  id: string
  content: string
  image?: string | null
  createdAt: string
  author: {
    id: string
    name: string
    nickname: string | null
    avatar: string | null
    mbtiType: string
  }
  likesCount: number
  commentsCount: number
  isLiked: boolean
  comments: Comment[]
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string
    nickname: string | null
    avatar: string | null
  }
}

export default function SquarePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostImage, setNewPostImage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [showComments, setShowComments] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      const response = await fetch('/api/posts')
      const data = await response.json()
      if (data.posts) {
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createPost() {
    if (!newPostContent.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPostContent, image: newPostImage }),
      })

      const data = await response.json()
      if (data.post) {
        setPosts((prev) => [data.post, ...prev])
        setNewPostContent('')
        setNewPostImage('')
      }
    } catch (error) {
      console.error('Create post error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleLike(postId: string) {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      })

      const data = await response.json()
      if (data.likesCount !== undefined) {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isLiked: data.liked,
                  likesCount: data.likesCount,
                }
              : post
          )
        )
      }
    } catch (error) {
      console.error('Like error:', error)
    }
  }

  async function addComment(postId: string) {
    const content = commentInputs[postId]
    if (!content?.trim()) return

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      const data = await response.json()
      if (data.comment) {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: [...post.comments, data.comment],
                  commentsCount: post.commentsCount + 1,
                }
              : post
          )
        )
        setCommentInputs((prev) => ({ ...prev, [postId]: '' }))
      }
    } catch (error) {
      console.error('Comment error:', error)
    }
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-6">
        <h1 className="text-2xl font-bold">广场</h1>
        <p className="text-violet-100 text-sm mt-1">分享你的想法，发现有趣的人</p>
      </div>

      {/* New Post Input */}
      <div className="p-4 bg-white border-b border-gray-100">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
            我
          </div>
          <div className="flex-1">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="分享你的想法..."
              className="w-full p-3 bg-gray-50 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              rows={3}
            />
            <div className="flex justify-between items-center mt-2">
              <ImageUploader
                type="post"
                value={newPostImage}
                onChange={setNewPostImage}
              />
              <button
                onClick={createPost}
                disabled={submitting || !newPostContent.trim()}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
              >
                {submitting ? '发布中...' : '发布'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400">还没有动态</p>
            <p className="text-gray-400 text-sm mt-1">成为第一个分享想法的人吧</p>
          </div>
        ) : (
          posts.map((post) => {
            const mbtiInfo = getMbtiByCode(post.author.mbtiType)
            return (
              <div
                key={post.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              >
                {/* Author */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold"
                    style={{
                      background: mbtiInfo
                        ? `linear-gradient(135deg, ${mbtiInfo.color}88, ${mbtiInfo.color})`
                        : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    }}
                  >
                    {post.author.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {post.author.nickname || post.author.name}
                      </span>
                      {mbtiInfo && (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: mbtiInfo.color }}
                        >
                          {post.author.mbtiType}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={12} />
                      {formatTime(post.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <p className="text-gray-800 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
                  {post.content}
                </p>
                {post.image && (
                  <div className="mb-3">
                    <img
                      src={post.image}
                      alt="post image"
                      className="max-h-64 rounded-lg object-cover w-full"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 pt-3 border-t border-gray-50">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      post.isLiked
                        ? 'text-red-500'
                        : 'text-gray-500 hover:text-red-500'
                    }`}
                  >
                    <Heart
                      size={18}
                      fill={post.isLiked ? 'currentColor' : 'none'}
                    />
                    <span>{post.likesCount}</span>
                  </button>

                  <button
                    onClick={() =>
                      setShowComments((prev) => ({
                        ...prev,
                        [post.id]: !prev[post.id],
                      }))
                    }
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-violet-500 transition-colors"
                  >
                    <MessageCircle size={18} />
                    <span>{post.commentsCount}</span>
                  </button>
                </div>

                {/* Comments Section */}
                {showComments[post.id] && (
                  <div className="mt-3 pt-3 border-t border-gray-50 space-y-3">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                          {comment.user.name[0]}
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-xs font-medium text-gray-700">
                            {comment.user.nickname || comment.user.name}
                          </span>
                          <p className="text-sm text-gray-800 mt-0.5">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Add Comment */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                        onKeyPress={(e) =>
                          e.key === 'Enter' && addComment(post.id)
                        }
                        placeholder="写下你的评论..."
                        className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                      <button
                        onClick={() => addComment(post.id)}
                        className="p-2 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
