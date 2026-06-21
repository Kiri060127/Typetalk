'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, User, FileText, X } from 'lucide-react';
import { getMbtiByCode } from '@/lib/mbti-data';

interface SearchUser {
  id: string;
  name: string;
  nickname: string | null;
  mbtiType: string;
  bio: string | null;
  avatar: string | null;
  isVerified: boolean;
  interests: { id: string; name: string }[];
}

interface SearchPost {
  id: string;
  content: string;
  image?: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string;
    nickname: string | null;
    avatar: string | null;
    mbtiType: string;
  };
  likesCount: number;
  commentsCount: number;
}

export default function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'posts'>('all');
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const performSearch = useCallback(async (searchQuery: string, type: string) => {
    if (!searchQuery.trim()) {
      setUsers([]);
      setPosts([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=${type}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setPosts(data.posts || []);
        setSearched(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, activeTab);
    }
  }, [initialQuery, activeTab, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      performSearch(query.trim(), activeTab);
    }
  };

  const handleClear = () => {
    setQuery('');
    setUsers([]);
    setPosts([]);
    setSearched(false);
    router.push('/search');
  };

  const tabs = [
    { id: 'all' as const, label: '全部' },
    { id: 'users' as const, label: '用户' },
    { id: 'posts' as const, label: '动态' },
  ];

  const hasResults = users.length > 0 || posts.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 搜索头部 */}
      <div className="bg-white border-b border-gray-200 sticky top-14 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索用户、MBTI类型、动态内容..."
              className="w-full pl-10 pr-10 py-2.5 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </form>

          {/* 筛选标签 */}
          <div className="flex space-x-1 mt-3 pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (query.trim()) {
                    performSearch(query.trim(), tab.id);
                  }
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-violet-100 text-violet-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
                {tab.id === 'users' && users.length > 0 && (
                  <span className="ml-1 text-xs">({users.length})</span>
                )}
                {tab.id === 'posts' && posts.length > 0 && (
                  <span className="ml-1 text-xs">({posts.length})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 搜索结果 */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          </div>
        ) : !searched ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-400 text-lg">输入关键词开始搜索</p>
            <p className="text-gray-400 text-sm mt-1">支持搜索用户名、MBTI类型、动态内容</p>
          </div>
        ) : !hasResults ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-400 text-lg">未找到相关结果</p>
            <p className="text-gray-400 text-sm mt-1">试试其他关键词</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 用户结果 */}
            {(activeTab === 'all' || activeTab === 'users') && users.length > 0 && (
              <div>
                {activeTab === 'all' && (
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    用户 ({users.length})
                  </h2>
                )}
                <div className="space-y-2">
                  {users.map((user) => {
                    const mbtiInfo = getMbtiByCode(user.mbtiType);
                    return (
                      <Link
                        key={user.id}
                        href={`/users/${user.id}`}
                        className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" loading="lazy" />
                          ) : (
                            (user.nickname || user.name)?.[0] || '?'
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {user.nickname || user.name}
                            </h3>
                            {user.isVerified && (
                              <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          {mbtiInfo && (
                            <span
                              className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: mbtiInfo.color }}
                            >
                              {user.mbtiType} · {mbtiInfo.name}
                            </span>
                          )}
                          {user.bio && (
                            <p className="text-gray-500 text-sm mt-1 truncate">{user.bio}</p>
                          )}
                        </div>
                        <User className="w-5 h-5 text-gray-300 flex-shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 动态结果 */}
            {(activeTab === 'all' || activeTab === 'posts') && posts.length > 0 && (
              <div>
                {activeTab === 'all' && (
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    动态 ({posts.length})
                  </h2>
                )}
                <div className="space-y-3">
                  {posts.map((post) => {
                    const mbtiInfo = getMbtiByCode(post.author.mbtiType);
                    return (
                      <Link
                        key={post.id}
                        href="/square"
                        className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                            {post.author.avatar ? (
                              <img src={post.author.avatar} alt={post.author.name} className="w-full h-full rounded-full object-cover" loading="lazy" />
                            ) : (
                              (post.author.nickname || post.author.name)?.[0] || '?'
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
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
                            <span className="text-xs text-gray-400">
                              {new Date(post.createdAt).toLocaleDateString('zh-CN')}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm line-clamp-3">{post.content}</p>
                        {post.image && (
                          <div className="mt-3">
                            <img
                              src={post.image}
                              alt="动态图片"
                              className="rounded-lg max-h-48 object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {post.likesCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {post.commentsCount}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
