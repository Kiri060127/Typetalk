'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMbtiByCode } from '@/lib/mbti-data';
import { UserPlus, MessageCircle, UserX, Clock, ArrowLeft, Users } from 'lucide-react';

interface FriendUser {
  id: string;
  name: string;
  nickname: string | null;
  avatar: string | null;
  mbtiType: string;
  friendRecordId?: string;
}

interface FriendRequest {
  id: string;
  user: FriendUser;
  createdAt: string;
}

export default function FriendsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/friends');
      if (res.ok) {
        const data = await res.json();
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error('Fetch friends error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/friends?type=requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Fetch requests error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'friends') {
      fetchFriends();
    } else {
      fetchRequests();
    }
  }, [activeTab]);

  const handleAccept = async (requestId: string) => {
    try {
      const res = await fetch('/api/friends', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action: 'accept' }),
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
        // 刷新好友列表
        fetchFriends();
      }
    } catch (error) {
      console.error('Accept request error:', error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const res = await fetch('/api/friends', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action: 'reject' }),
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
      }
    } catch (error) {
      console.error('Reject request error:', error);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      const res = await fetch(`/api/friends?friendId=${friendId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setFriends((prev) => prev.filter((f) => f.id !== friendId));
      }
    } catch (error) {
      console.error('Remove friend error:', error);
    }
  };

  const startChat = async (friendId: string) => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: friendId }),
      });
      const data = await res.json();
      if (data.conversation) {
        router.push(`/chat/${data.conversation.id}`);
      }
    } catch (error) {
      console.error('Start chat error:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-200 sticky top-14 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-lg font-semibold text-gray-800">好友</h1>
            </div>
            <Link
              href="/discover"
              className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 font-medium"
            >
              <UserPlus className="w-4 h-4" />
              添加好友
            </Link>
          </div>

          {/* 标签切换 */}
          <div className="flex gap-1 mt-3">
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'friends'
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              我的好友 {friends.length > 0 && `(${friends.length})`}
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'requests'
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              好友请求 {requests.length > 0 && `(${requests.length})`}
            </button>
          </div>
        </div>
      </div>

      {/* 内容 */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          </div>
        ) : activeTab === 'friends' ? (
          friends.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-400 text-lg">还没有好友</p>
              <p className="text-gray-400 text-sm mt-1">去发现页面寻找志同道合的朋友吧</p>
              <Link
                href="/discover"
                className="inline-block mt-4 px-6 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors"
              >
                去发现
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map((friend) => {
                const mbtiInfo = getMbtiByCode(friend.mbtiType);
                return (
                  <div
                    key={friend.id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
                  >
                    <Link href={`/users/${friend.id}`} className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                        {friend.avatar ? (
                          <img src={friend.avatar} alt={friend.name} className="w-full h-full rounded-full object-cover" loading="lazy" />
                        ) : (
                          (friend.nickname || friend.name)?.[0] || '?'
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/users/${friend.id}`}>
                        <h3 className="font-semibold text-gray-900 truncate">
                          {friend.nickname || friend.name}
                        </h3>
                      </Link>
                      {mbtiInfo && (
                        <span
                          className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: mbtiInfo.color }}
                        >
                          {friend.mbtiType} · {mbtiInfo.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startChat(friend.id)}
                        className="p-2 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors"
                        title="发消息"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveFriend(friend.id)}
                        className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="删除好友"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : requests.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-400 text-lg">没有待处理的好友请求</p>
          </div>
        ) : (
          <div className="space-y-2">
            {requests.map((request) => {
              const mbtiInfo = getMbtiByCode(request.user.mbtiType);
              return (
                <div
                  key={request.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
                >
                  <Link href={`/users/${request.user.id}`} className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                      {request.user.avatar ? (
                        <img src={request.user.avatar} alt={request.user.name} className="w-full h-full rounded-full object-cover" loading="lazy" />
                      ) : (
                        (request.user.nickname || request.user.name)?.[0] || '?'
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/users/${request.user.id}`}>
                      <h3 className="font-semibold text-gray-900 truncate">
                        {request.user.nickname || request.user.name}
                      </h3>
                    </Link>
                    {mbtiInfo && (
                      <span
                        className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: mbtiInfo.color }}
                      >
                        {request.user.mbtiType} · {mbtiInfo.name}
                      </span>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formatTime(request.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleAccept(request.id)}
                      className="px-3 py-1.5 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 transition-colors font-medium"
                    >
                      接受
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      拒绝
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
