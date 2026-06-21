import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setAuthCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 获取或创建一个演示用户
    let user = await prisma.user.findFirst({
      where: { email: 'demo@typetalk.com' },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'demo@typetalk.com',
          name: '演示用户',
          mbtiType: 'INTJ',
          bio: '这是演示账号',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
        },
      });
    }

    await setAuthCookie(user.id);

    // 重定向到首页
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('登录失败:', error);
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    );
  }
}
