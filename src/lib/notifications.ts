import { prisma } from './prisma'

/**
 * 创建通知
 */
export async function createNotification({
  userId,
  type,
  title,
  content,
  relatedId,
}: {
  userId: string
  type: 'message' | 'like' | 'comment' | 'follow'
  title: string
  content?: string
  relatedId?: string
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        content,
        relatedId,
      },
    })
    return notification
  } catch (error) {
    console.error('Create notification error:', error)
    return null
  }
}

/**
 * 获取用户未读通知数量
 */
export async function getUnreadNotificationCount(userId: string) {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    })
    return count
  } catch (error) {
    console.error('Get unread notification count error:', error)
    return 0
  }
}
