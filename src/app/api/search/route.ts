import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const type = searchParams.get('type') || 'all'; // all, users, posts

    if (!q || q.length === 0) {
      return NextResponse.json({ users: [], posts: [] });
    }

    const searchPattern = `%${q}%`;

    let users: any[] = [];
    let posts: any[] = [];

    // 搜索用户 (SQLite 不区分大小写)
    if (type === 'all' || type === 'users') {
      users = await prisma.user.findMany({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: q } },
                { nickname: { contains: q } },
                { mbtiType: { equals: q.toUpperCase() } },
                { bio: { contains: q } },
              ],
            },
            // 排除当前用户
            session.id ? { id: { not: session.id } } : {},
          ],
        },
        select: {
          id: true,
          name: true,
          nickname: true,
          mbtiType: true,
          bio: true,
          avatar: true,
          isVerified: true,
          interests: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        take: 20,
      });
    }

    // 搜索动态
    if (type === 'all' || type === 'posts') {
      posts = await prisma.post.findMany({
        where: {
          content: {
            contains: q,
          },
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              nickname: true,
              avatar: true,
              mbtiType: true,
            },
          },
          likes: true,
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  nickname: true,
                  avatar: true,
                },
              },
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
      });

      // 格式化帖子数据
      const userId = session.id;
      posts = posts.map((post) => ({
        ...post,
        likesCount: post.likes.length,
        commentsCount: post.comments.length,
        isLiked: userId ? post.likes.some((like: { userId: string }) => like.userId === userId) : false,
      }));
    }

    return NextResponse.json({ users, posts, query: q });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: '搜索失败' },
      { status: 500 }
    );
  }
}
