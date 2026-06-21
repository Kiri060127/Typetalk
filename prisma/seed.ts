import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const mbtiTypes = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

const sampleUsers = [
  { name: '小明', mbtiType: 'INTJ', bio: '喜欢思考和规划，追求效率' },
  { name: '小红', mbtiType: 'ENFP', bio: '充满热情，喜欢结交新朋友' },
  { name: '阿杰', mbtiType: 'ISTJ', bio: '踏实可靠，注重细节' },
  { name: 'Lisa', mbtiType: 'INFJ', bio: '理想主义者，富有同理心' },
  { name: 'Tom', mbtiType: 'ENTP', bio: '喜欢辩论和创新' },
  { name: 'Sarah', mbtiType: 'ISFJ', bio: '温柔体贴，乐于助人' },
  { name: 'David', mbtiType: 'ESTP', bio: '行动派，喜欢冒险' },
  { name: 'Emma', mbtiType: 'INFP', bio: '富有创意，追求内心和谐' },
];

async function main() {
  console.log('开始种子数据...');

  // 清理现有数据
  await prisma.message.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // 创建用户
  for (const userData of sampleUsers) {
    const email = `${userData.name.toLowerCase()}@example.com`;
    await prisma.user.create({
      data: {
        email,
        name: userData.name,
        mbtiType: userData.mbtiType,
        bio: userData.bio,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
      },
    });
  }

  // 创建一些动态
  const users = await prisma.user.findMany();
  const samplePosts = [
    '今天测了MBTI，发现自己是INTJ，感觉挺准的！',
    '有没有ENFP的小伙伴一起聊天呀？',
    'MBTI只是参考，不要把自己框住哦',
    '发现同类了，INTJ真的很少见吗？',
    '今天遇到了一个很懂我的人，感动',
  ];

  for (let i = 0; i < samplePosts.length; i++) {
    await prisma.post.create({
      data: {
        content: samplePosts[i],
        authorId: users[i % users.length].id,
      },
    });
  }

  console.log('种子数据完成！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
