import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getMbtiDescription, getMbtiColor } from '@/lib/mbti';
import Link from 'next/link';
import { Edit3, ChevronRight } from 'lucide-react';

export default async function MePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/api/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <h1 className="text-2xl font-bold px-4 py-4">我的</h1>

      {/* 用户信息卡片 */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4 mx-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-2xl font-bold overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              user.name[0]
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold">{user.nickname || user.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-3 py-1 text-sm rounded-full font-medium ${getMbtiColor(user.mbtiType as any)}`}>
                {user.mbtiType}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1 truncate">
              {getMbtiDescription(user.mbtiType as any)}
            </p>
          </div>
          <Link href="/me/edit" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Edit3 size={18} className="text-gray-400" />
          </Link>
        </div>

        {user.bio && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-gray-600 text-sm">{user.bio}</p>
          </div>
        )}
      </div>

      {/* 统计 */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 mx-4 flex justify-around">
        <div className="text-center">
          <div className="text-xl font-bold text-violet-600">0</div>
          <div className="text-xs text-gray-500 mt-1">动态</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-violet-600">0</div>
          <div className="text-xs text-gray-500 mt-1">关注</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-violet-600">0</div>
          <div className="text-xs text-gray-500 mt-1">粉丝</div>
        </div>
      </div>

      {/* 功能菜单 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mx-4">
        <MenuItem href="/friends" icon="friends" label="我的好友" />
        <MenuItem href="/discover" icon="search" label="发现朋友" />
        <MenuItem href="/chat" icon="message" label="我的消息" />
        <MenuItem href="/square" icon="users" label="动态广场" />
        <MenuItem href="/mbti-test" icon="test" label="MBTI测试" />
        <MenuItem href="/me/edit" icon="settings" label="编辑资料" />
      </div>
    </div>
  );
}

function MenuItem({ href, icon, label }: { href: string; icon: string; label: string }) {
  const icons: Record<string, React.ReactNode> = {
    friends: <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center"><svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg></div>,
    test: <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center"><svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg></div>,
    search: <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>,
    message: <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"><svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></div>,
    users: <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center"><svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg></div>,
    settings: <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center"><svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>,
  };

  return (
    <Link href={href} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b last:border-b-0">
      <div className="flex items-center gap-3">
        {icons[icon]}
        <span className="font-medium">{label}</span>
      </div>
      <ChevronRight size={18} className="text-gray-400" />
    </Link>
  );
}
