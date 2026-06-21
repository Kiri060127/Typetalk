'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getMbtiByCode } from '@/lib/mbti-data';
import ImageUploader from '@/components/ImageUploader';

const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    nickname: '',
    mbtiType: '',
    bio: '',
    avatar: '',
  });

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    try {
      const res = await fetch('/api/auth/profile');
      const data = await res.json();
      if (data.id) {
        setForm({
          name: data.name || '',
          nickname: data.nickname || '',
          mbtiType: data.mbtiType || '',
          bio: data.bio || '',
          avatar: data.avatar || '',
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.user) {
        router.push('/me');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold">编辑资料</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <ImageUploader
          type="avatar"
          value={form.avatar}
          onChange={(url) => setForm({ ...form, avatar: url })}
        />

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
            <input
              type="text"
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              placeholder="设置你的昵称"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="p-4 border-b">
            <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="你的真实姓名"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="p-4 border-b">
            <label className="block text-sm font-medium text-gray-700 mb-2">MBTI类型</label>
            <div className="grid grid-cols-4 gap-2">
              {MBTI_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, mbtiType: type })}
                  className={`px-2 py-2 text-sm rounded-lg font-medium transition-colors ${
                    form.mbtiType === type
                      ? (getMbtiByCode(type)?.color ? `text-white` : '') + ' ring-2 ring-offset-1 ring-violet-500'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={form.mbtiType === type ? { backgroundColor: getMbtiByCode(type)?.color } : undefined}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">个性签名</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="写点什么介绍自己..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存修改'}
        </button>
      </form>
    </div>
  );
}
