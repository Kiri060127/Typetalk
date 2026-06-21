'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, MessageSquare, Users, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { id: 'discover', label: '发现', icon: Compass, href: '/discover' },
    { id: 'chat', label: '聊天', icon: MessageSquare, href: '/chat' },
    { id: 'square', label: '广场', icon: Users, href: '/square' },
    { id: 'me', label: '我的', icon: User, href: '/me' },
  ];

  const isActive = (path: string) => {
    if (path === '/chat') {
      return pathname?.startsWith('/chat');
    }
    return pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-primary)] border-t border-[var(--primary-800)]/20">
      <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-around">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className="relative flex flex-col items-center justify-center py-2 px-4 group"
            >
              {/* 活跃指示器 */}
              {active && (
                <div className="absolute -top-0.5 w-8 h-1 rounded-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-cyan)]" />
              )}
              
              <div className={`relative p-2 rounded-xl transition-all duration-300 ${
                active 
                  ? 'bg-[var(--primary-800)]/40 text-[var(--primary-400)]' 
                  : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
              }`}>
                <tab.icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.5} />
              </div>
              
              <span className={`text-[10px] font-medium mt-0.5 transition-colors duration-300 ${
                active ? 'text-[var(--primary-400)]' : 'text-[var(--text-muted)]'
              }`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
