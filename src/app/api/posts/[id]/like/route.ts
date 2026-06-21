import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

// POST /api/posts/[id]/like - 点赞/取消点赞
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const postId = params.id
    const userId = session.id

    // 检查是否已点赞
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    })

    if (existingLike) {
      // 取消点赞
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      })

      const likesCount = await prisma.like.count({
        where: { postId },
      })

      return NextResponse.json({ liked: false, likesCount })
    } else {
      // 点赞
      await prisma.like.create({
        data: {
          postId,
          userId,
        },
      })

      const likesCount = await prisma.like.count({
        where: { postId },
      })

      // 获取帖子作者并创建通知（不给自己点赞发通知）
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true, content: true },
      })

      const liker = await prisma.user.findUnique({
        where: { id: userId },
        select: { nickname: true, name: true },
      })

      if (post && post.authorId !== userId) {
        await createNotification({
          userId: post.authorId,
          type: 'like',
          title: `${liker?.nickname || liker?.name || '有人'} 赞了你的动态`,
          content: post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content,
          relatedId: postId,
        })
      }

      return NextResponse.json({ liked: true, likesCount })
    }
  } catch (error) {
    console.error('Like post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
