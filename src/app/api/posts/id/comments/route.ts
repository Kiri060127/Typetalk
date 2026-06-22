import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

// POST /api/posts/id/comments?postId=xxx - 添加评论
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    const { content } = await request.json()

    if (!postId) {
      return NextResponse.json(
        { error: 'postId is required' },
        { status: 400 }
      )
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        userId: session.id,
      },
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
    })

    // 获取帖子作者并创建通知（不给自己评论发通知）
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, content: true },
    })

    if (post && post.authorId !== session.id) {
      await createNotification({
        userId: post.authorId,
        type: 'comment',
        title: `${comment.user.nickname || comment.user.name || '有人'} 评论了你的动态`,
        content: content.length > 50 ? content.substring(0, 50) + '...' : content,
        relatedId: postId,
      })
    }

    return NextResponse.json({ comment })
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
