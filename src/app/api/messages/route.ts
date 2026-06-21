import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

// GET /api/messages?conversationId=xxx - 获取会话消息
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    // 验证用户是否属于该会话
    const participation = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.id,
        },
      },
    })

    if (!participation) {
      return NextResponse.json(
        { error: 'Not a participant of this conversation' },
        { status: 403 }
      )
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // 标记对方发送的消息为已读
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: session.id },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Messages list error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/messages - 发送消息
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { conversationId, content, type = 'text' } = await request.json()

    if (!conversationId || !content) {
      return NextResponse.json(
        { error: 'Conversation ID and content are required' },
        { status: 400 }
      )
    }

    // 验证用户是否属于该会话
    const participation = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.id,
        },
      },
    })

    if (!participation) {
      return NextResponse.json(
        { error: 'Not a participant of this conversation' },
        { status: 403 }
      )
    }

    // 获取接收者信息
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
        },
      },
    })

    const receiver = conversation?.participants.find(
      (p) => p.userId !== session.id
    )
    const sender = conversation?.participants.find(
      (p) => p.userId === session.id
    )

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.id,
        receiverId: receiver?.userId || session.id,
        content,
        type,
      },
      include: {
        sender: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
    })

    // 更新会话的 updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })

    // 创建通知
    if (receiver && sender) {
      await createNotification({
        userId: receiver.userId,
        type: 'message',
        title: `${sender.user.nickname || '有人'} 发来新消息`,
        content: content.length > 50 ? content.substring(0, 50) + '...' : content,
        relatedId: conversationId,
      })
    }

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
