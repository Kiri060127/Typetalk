'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Sparkles, Brain, Heart, MessageCircle, Globe, ArrowRight, Zap } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetch('/api/auth/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-[var(--primary-500)] border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-[var(--accent-cyan)] border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 动态背景光球 */}
      <div 
        className="fixed w-[600px] h-[600px] rounded-full pointer-events-none transition-all duration-1000 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(124,106,237,0.15) 0%, transparent 70%)',
          left: mousePos.x - 300,
          top: mousePos.y - 300,
          filter: 'blur(60px)',
        }}
      />
      
      {/* 装饰性背景 */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-[var(--primary-600)] rounded-full opacity-10 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-[var(--accent-cyan)] rounded-full opacity-10 blur-[100px] pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--primary-700)] rounded-full opacity-5 blur-[120px] pointer-events-none" />

      {/* Hero 区域 */}
      <section className="relative pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* 徽章 */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-[var(--accent-cyan)]" />
            <span className="text-sm font-medium text-[var(--text-secondary)]">基于 MBTI 16型人格</span>
          </div>

          {/* 主标题 */}
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="gradient-text">Type</span>
            <span className="text-[var(--text-primary)]">Talk</span>
          </h1>

          {/* 副标题 */}
          <p className="text-xl md:text-2xl text-[var(--text-secondary)] mb-4 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            发现与你灵魂共振的朋友
          </p>
          <p className="text-base text-[var(--text-muted)] mb-10 max-w-lg mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            探索不同 MBTI 类型的奇妙世界，找到真正懂你的人
          </p>

          {/* CTA 按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {user ? (
              <>
                <Link href="/discover" className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
                  <Zap className="w-5 h-5" />
                  开始探索
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/square" className="btn-glass flex items-center gap-2 text-lg px-8 py-4">
                  <Globe className="w-5 h-5" />
                  浏览广场
                </Link>
              </>
            ) : (
              <>
                <Link href="/api/auth/login" className="btn-primary flex items-center gap-2 text-lg px-8 py-4 glow">
                  <Sparkles className="w-5 h-5" />
                  立即体验
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <p className="text-sm text-[var(--text-muted)] mt-2">无需注册，一键开始</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 特性卡片 */}
      <section className="relative py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: Brain, 
                title: '16种人格', 
                desc: '全面了解MBTI理论体系',
                color: 'var(--accent-cyan)',
                delay: '0s'
              },
              { 
                icon: Heart, 
                title: '性格匹配', 
                desc: '找到志同道合的灵魂伴侣',
                color: 'var(--accent-pink)',
                delay: '0.1s'
              },
              { 
                icon: MessageCircle, 
                title: '实时聊天', 
                desc: '与好友即时沟通交流',
                color: 'var(--primary-400)',
                delay: '0.2s'
              },
              { 
                icon: Globe, 
                title: '动态广场', 
                desc: '分享你的想法和故事',
                color: 'var(--accent-amber)',
                delay: '0.3s'
              },
            ].map((feature, index) => (
              <div 
                key={index}
                className="glass-card p-6 group hover:scale-[1.02] transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: feature.delay }}
              >
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${feature.color}20`, border: `1px solid ${feature.color}30` }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--text-muted)]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MBTI 类型展示 */}
      <section className="relative py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">16</span> 种人格类型
          </h2>
          <p className="text-[var(--text-muted)] mb-10">探索每一种独特的思维与行为模式</p>
          
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'].map((type, i) => (
              <div 
                key={type}
                className="glass-card py-3 px-2 text-center cursor-pointer hover:scale-110 transition-all duration-300 hover:glow"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <span className="text-sm font-bold text-[var(--text-primary)]">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 底部 CTA */}
      <section className="relative py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="glass-card p-10 glow">
            <h2 className="text-3xl font-bold mb-4">准备好探索了吗？</h2>
            <p className="text-[var(--text-muted)] mb-8">加入 TypeTalk，发现属于你的社交新体验</p>
            <Link 
              href={user ? "/discover" : "/api/auth/login"}
              className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4"
            >
              <Sparkles className="w-5 h-5" />
              {user ? '开始探索' : '立即体验'}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 底部间距 */}
      <div className="h-20" />
    </div>
  );
}
