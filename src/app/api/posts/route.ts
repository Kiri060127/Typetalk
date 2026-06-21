import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/posts - 获取动态列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const posts = await prisma.post.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
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
    })

    // 获取当前用户点赞状态
    const session = await getSession()
    const userId = session.id

    const formattedPosts = posts.map((post) => ({
      ...post,
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      isLiked: userId ? post.likes.some((like) => like.userId === userId) : false,
    }))

    return NextResponse.json({ posts: formattedPosts })
  } catch (error) {
    console.error('Posts list error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/posts - 发布动态
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { content, image } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        image: image || null,
        authorId: session.id,
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
        comments: true,
      },
    })

    return NextResponse.json({
      post: {
        ...post,
        likesCount: 0,
        commentsCount: 0,
        isLiked: false,
      },
    })
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
