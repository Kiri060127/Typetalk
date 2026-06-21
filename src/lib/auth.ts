import { cookies } from 'next/headers';
import { prisma } from './prisma';

const AUTH_COOKIE = 'typetalk_session';

export async function setAuthCookie(userId: string) {
  const cookieStore = cookies();
  (await cookieStore).set(AUTH_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7天
    path: '/',
  });
}

export async function clearAuthCookie() {
  const cookieStore = cookies();
  (await cookieStore).delete(AUTH_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = cookies();
  const userId = (await cookieStore).get(AUTH_COOKIE)?.value;

  if (!userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        mbtiType: true,
        bio: true,
        avatar: true,
      },
    });
    return user;
  } catch {
    return null;
  }
}

// 新增 getSession 函数以兼容新代码
export async function getSession() {
  const user = await getCurrentUser();
  return {
    id: user?.id || '',
    user,
  };
}
