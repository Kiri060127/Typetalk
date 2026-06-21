'use client';

import { useState, useEffect } from 'react';
import { UserPlus, UserCheck, UserX, Clock, Loader2 } from 'lucide-react';

interface FriendButtonProps {
  userId: string;
  size?: 'sm' | 'md';
}

type FriendStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends' | 'loading';

export default function FriendButton({ userId, size = 'md' }: FriendButtonProps) {
  const [status, setStatus] = useState<FriendStatus>('loading');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    checkFriendStatus();
  }, [userId]);

  const checkFriendStatus = async () => {
    try {
      // 获取我的好友列表
      const res = await fetch('/api/friends');
      if (res.ok) {
        const data = await res.json();
        const friends = data.friends || [];
        if (friends.some((f: any) => f.id === userId)) {
          setStatus('friends');
          return;
        }
      }

      // 检查我发送的请求
      const pendingRes = await fetch('/api/friends?type=pending');
      if (pendingRes.ok) {
        const data = await pendingRes.json();
        const pending = data.pending || [];
        const sent = pending.find((p: any) => p.friend.id === userId);
        if (sent) {
          setStatus('pending_sent');
          setRequestId(sent.id);
          return;
        }
      }

      // 检查收到的请求
      const requestsRes = await fetch('/api/friends?type=requests');
      if (requestsRes.ok) {
        const data = await requestsRes.json();
        const requests = data.requests || [];
        const received = requests.find((r: any) => r.user.id === userId);
        if (received) {
          setStatus('pending_received');
          setRequestId(received.id);
          return;
        }
      }

      setStatus('none');
    } catch (error) {
      console.error('Check friend status error:', error);
      setStatus('none');
    }
  };

  const sendRequest = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: userId }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.status === 'accepted') {
          setStatus('friends');
        } else {
          setStatus('pending_sent');
        }
      }
    } catch (error) {
      console.error('Send friend request error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const acceptRequest = async () => {
    if (!requestId) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/friends', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action: 'accept' }),
      });
      if (res.ok) {
        setStatus('friends');
      }
    } catch (error) {
      console.error('Accept friend request error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const rejectRequest = async () => {
    if (!requestId) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/friends', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action: 'reject' }),
      });
      if (res.ok) {
        setStatus('none');
      }
    } catch (error) {
      console.error('Reject friend request error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const removeFriend = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/friends?friendId=${userId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setStatus('none');
      }
    } catch (error) {
      console.error('Remove friend error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const sizeClasses = size === 'sm'
    ? 'px-2 py-1 text-xs'
    : 'px-3 py-1.5 text-sm';

  if (status === 'loading') {
    return (
      <button disabled className={`${sizeClasses} rounded-lg bg-gray-100 text-gray-400`}>
        <Loader2 className="w-4 h-4 animate-spin" />
      </button>
    );
  }

  if (status === 'friends') {
    return (
      <button
        onClick={removeFriend}
        disabled={actionLoading}
        className={`${sizeClasses} rounded-lg bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600 transition-colors flex items-center gap-1 font-medium`}
      >
        {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
        <span className="hidden sm:inline">已是好友</span>
      </button>
    );
  }

  if (status === 'pending_sent') {
    return (
      <button
        disabled
        className={`${sizeClasses} rounded-lg bg-amber-100 text-amber-700 flex items-center gap-1 font-medium cursor-default`}
      >
        <Clock className="w-3 h-3" />
        等待验证
      </button>
    );
  }

  if (status === 'pending_received') {
    return (
      <div className="flex gap-1">
        <button
          onClick={acceptRequest}
          disabled={actionLoading}
          className={`${sizeClasses} rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors flex items-center gap-1 font-medium`}
        >
          {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
          接受
        </button>
        <button
          onClick={rejectRequest}
          disabled={actionLoading}
          className={`${sizeClasses} rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-1 font-medium`}
        >
          <UserX className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={sendRequest}
      disabled={actionLoading}
      className={`${sizeClasses} rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors flex items-center gap-1 font-medium`}
    >
      {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
      加好友
    </button>
  );
}
