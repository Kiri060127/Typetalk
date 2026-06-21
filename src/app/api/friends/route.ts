import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

// GET /api/friends - 获取好友列表或好友请求
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'friends' // friends, requests, pending

    if (type === 'requests') {
      // 收到的好友请求
      const requests = await prisma.friend.findMany({
        where: {
          friendId: session.id,
          status: 'pending',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              nickname: true,
              avatar: true,
              mbtiType: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ requests })
    }

    if (type === 'pending') {
      // 我发送的待处理请求
      const pending = await prisma.friend.findMany({
        where: {
          userId: session.id,
          status: 'pending',
        },
        include: {
          friend: {
            select: {
              id: true,
              name: true,
              nickname: true,
              avatar: true,
              mbtiType: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ pending })
    }

    // 好友列表（双向 accepted）
    const sentFriends = await prisma.friend.findMany({
      where: {
        userId: session.id,
        status: 'accepted',
      },
      include: {
        friend: {
          select: {
            id: true,
            name: true,
            nickname: true,
            avatar: true,
            mbtiType: true,
          },
        },
      },
    })

    const receivedFriends = await prisma.friend.findMany({
      where: {
        friendId: session.id,
        status: 'accepted',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nickname: true,
            avatar: true,
            mbtiType: true,
          },
        },
      },
    })

    // 合并好友列表并去重
    const allFriends = [
      ...sentFriends.map((f) => ({ ...f.friend, friendRecordId: f.id })),
      ...receivedFriends.map((f) => ({ ...f.user, friendRecordId: f.id })),
    ]

    return NextResponse.json({ friends: allFriends })
  } catch (error) {
    console.error('Get friends error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/friends - 发送好友请求
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { friendId } = await request.json()

    if (!friendId || friendId === session.id) {
      return NextResponse.json({ error: 'Invalid friend ID' }, { status: 400 })
    }

    // 检查是否已存在关系
    const existing = await prisma.friend.findUnique({
      where: {
        userId_friendId: {
          userId: session.id,
          friendId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Friend request already exists', status: existing.status },
        { status: 400 }
      )
    }

    // 检查对方是否已发送请求
    const reverseRequest = await prisma.friend.findUnique({
      where: {
        userId_friendId: {
          userId: friendId,
          friendId: session.id,
        },
      },
    })

    if (reverseRequest) {
      if (reverseRequest.status === 'pending') {
        // 自动接受对方的请求
        await prisma.friend.update({
          where: { id: reverseRequest.id },
          data: { status: 'accepted' },
        })

        const sender = await prisma.user.findUnique({
          where: { id: session.id },
          select: { nickname: true, name: true },
        })

        await createNotification({
          userId: friendId,
          type: 'follow',
          title: `${sender?.nickname || sender?.name || '有人'} 接受了你的好友请求`,
          relatedId: session.id,
        })

        return NextResponse.json({ success: true, status: 'accepted' })
      }
      return NextResponse.json(
        { error: 'Already friends', status: reverseRequest.status },
        { status: 400 }
      )
    }

    // 创建新的好友请求
    const friendRequest = await prisma.friend.create({
      data: {
        userId: session.id,
        friendId,
        status: 'pending',
      },
    })

    // 发送通知
    const sender = await prisma.user.findUnique({
      where: { id: session.id },
      select: { nickname: true, name: true },
    })

    await createNotification({
      userId: friendId,
      type: 'follow',
      title: `${sender?.nickname || sender?.name || '有人'} 请求添加你为好友`,
      relatedId: session.id,
    })

    return NextResponse.json({ success: true, request: friendRequest })
  } catch (error) {
    console.error('Send friend request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/friends - 接受/拒绝好友请求
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { requestId, action } = await request.json()

    if (!requestId || !['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    const friendRequest = await prisma.friend.findFirst({
      where: {
        id: requestId,
        friendId: session.id,
        status: 'pending',
      },
    })

    if (!friendRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (action === 'accept') {
      await prisma.friend.update({
        where: { id: requestId },
        data: { status: 'accepted' },
      })

      // 发送通知给请求发送者
      const receiver = await prisma.user.findUnique({
        where: { id: session.id },
        select: { nickname: true, name: true },
      })

      await createNotification({
        userId: friendRequest.userId,
        type: 'follow',
        title: `${receiver?.nickname || receiver?.name || '有人'} 接受了你的好友请求`,
        relatedId: session.id,
      })

      return NextResponse.json({ success: true, status: 'accepted' })
    }

    // reject
    await prisma.friend.update({
      where: { id: requestId },
      data: { status: 'rejected' },
    })

    return NextResponse.json({ success: true, status: 'rejected' })
  } catch (error) {
    console.error('Update friend request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/friends - 删除好友或取消请求
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const friendId = searchParams.get('friendId')

    if (!friendId) {
      return NextResponse.json({ error: 'Friend ID is required' }, { status: 400 })
    }

    // 删除双向关系
    await prisma.friend.deleteMany({
      where: {
        OR: [
          { userId: session.id, friendId },
          { userId: friendId, friendId: session.id },
        ],
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete friend error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
