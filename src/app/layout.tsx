import type { Metadata } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import TopBar from '@/components/TopBar';
import ThemeProvider from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'TypeTalk - MBTI社交',
  description: '基于MBTI性格类型的社交平台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <TopBar />
          <main className="min-h-screen pt-16 pb-20 relative">
            {children}
          </main>
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
