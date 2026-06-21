import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'image';

    if (!file) {
      return NextResponse.json({ error: '没有文件' }, { status: 400 });
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: '只支持图片文件' }, { status: 400 });
    }

    // 限制文件大小 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: '文件大小不能超过5MB' }, { status: 400 });
    }

    // 生成文件名
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${type}/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

    // 上传到 Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public',
    });

    // 返回 Blob URL
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('上传失败:', error);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}
