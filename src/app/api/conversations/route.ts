import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/conversations - 获取当前用户的会话列表
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: session.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
                mbtiType: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    const formattedConversations = conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p.userId !== session.id
      )?.user

      return {
        id: conv.id,
        otherUser: otherParticipant,
        lastMessage: conv.messages[0] || null,
        updatedAt: conv.updatedAt,
      }
    })

    return NextResponse.json({ conversations: formattedConversations })
  } catch (error) {
    console.error('Conversations list error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/conversations - 创建新会话
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { targetUserId } = await request.json()

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Target user ID is required' },
        { status: 400 }
      )
    }

    // 检查是否已存在会话
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: {
                userId: session.id,
              },
            },
          },
          {
            participants: {
              some: {
                userId: targetUserId,
              },
            },
          },
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
                mbtiType: true,
              },
            },
          },
        },
      },
    })

    if (existingConversation) {
      const otherParticipant = existingConversation.participants.find(
        (p) => p.userId !== session.id
      )?.user

      return NextResponse.json({
        conversation: {
          id: existingConversation.id,
          otherUser: otherParticipant,
        },
      })
    }

    // 创建新会话
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: session.id },
            { userId: targetUserId },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
                mbtiType: true,
              },
            },
          },
        },
      },
    })

    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== session.id
    )?.user

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        otherUser: otherParticipant,
      },
    })
  } catch (error) {
    console.error('Create conversation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
