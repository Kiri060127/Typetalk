import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const iceBreakerTemplates: Record<string, string[]> = {
  INTJ: [
    '最近在思考什么有趣的理论问题？',
    '你对未来的某个技术趋势有什么看法？',
    '如果让你设计一个完美的系统，会是什么样的？',
  ],
  INTP: [
    '最近在探索什么新的知识领域？',
    '有什么让你陷入深度思考的话题吗？',
    '如果你可以解决任何一个科学难题，会选择哪个？',
  ],
  ENTJ: [
    '最近在工作或学习上有什么新目标？',
    '你认为成功的关键要素是什么？',
    '有什么项目让你特别兴奋吗？',
  ],
  ENTP: [
    '最近有什么新奇的想法想分享？',
    '如果你可以辩论任何话题，会选择什么？',
    '有什么让你感到兴奋的创意项目吗？',
  ],
  INFJ: [
    '最近在读什么书或看什么电影？',
    '你对人性有什么独特的见解？',
    '有什么让你感到内心平静的事情？',
  ],
  INFP: [
    '最近有什么触动你内心的故事？',
    '你的理想世界是什么样的？',
    '有什么创作让你感到特别满足？',
  ],
  ENFJ: [
    '最近帮助了谁，感觉如何？',
    '你认为什么样的关系最有意义？',
    '有什么让你感到充满热情的事情？',
  ],
  ENFP: [
    '最近有什么让你兴奋的新发现？',
    '如果你可以去任何地方，会选择哪里？',
    '有什么让你感到活力满满的事情？',
  ],
  ISTJ: [
    '最近完成了什么让你自豪的事情？',
    '你最喜欢的日常习惯是什么？',
    '有什么传统对你来说特别重要？',
  ],
  ISFJ: [
    '最近照顾了谁或帮助了谁？',
    '什么让你感到最安心？',
    '你最喜欢的温馨时刻是什么？',
  ],
  ESTJ: [
    '最近组织或计划了什么活动？',
    '你认为效率的关键是什么？',
    '有什么目标你正在努力实现？',
  ],
  ESFJ: [
    '最近和朋友们有什么愉快的聚会？',
    '什么让你感到被需要和重视？',
    '你最喜欢的社交活动是什么？',
  ],
  ISTP: [
    '最近在修理或制作什么东西？',
    '有什么技能你特别擅长？',
    '你最喜欢的动手活动是什么？',
  ],
  ISFP: [
    '最近在创作什么艺术作品？',
    '什么美景或音乐触动了你？',
    '你最喜欢的自由时刻是什么？',
  ],
  ESTP: [
    '最近有什么刺激的冒险经历？',
    '你最喜欢的运动或活动是什么？',
    '有什么让你感到肾上腺素飙升的事情？',
  ],
  ESFP: [
    '最近参加了什么有趣的活动？',
    '你最喜欢的娱乐方式是什么？',
    '有什么让你感到快乐的事情？',
  ],
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { mbtiType } = await request.json()

    if (!mbtiType || !iceBreakerTemplates[mbtiType]) {
      return NextResponse.json(
        { error: 'Invalid MBTI type' },
        { status: 400 }
      )
    }

    const templates = iceBreakerTemplates[mbtiType]
    const randomMessage = templates[Math.floor(Math.random() * templates.length)]

    return NextResponse.json({ message: randomMessage })
  } catch (error) {
    console.error('Ice breaker error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
