import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/notifications - 获取当前用户的通知列表
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({
        where: { userId: session.id },
      }),
      prisma.notification.count({
        where: { userId: session.id, isRead: false },
      }),
    ])

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Notifications list error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/notifications - 标记通知为已读
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { notificationId, markAll } = await request.json()

    if (markAll) {
      // 标记所有通知为已读
      await prisma.notification.updateMany({
        where: {
          userId: session.id,
          isRead: false,
        },
        data: { isRead: true },
      })

      return NextResponse.json({ success: true, markedAll: true })
    }

    if (notificationId) {
      // 标记单个通知为已读
      await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId: session.id,
        },
        data: { isRead: true },
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Notification ID or markAll is required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Mark notification read error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/notifications - 删除通知
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId: session.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
