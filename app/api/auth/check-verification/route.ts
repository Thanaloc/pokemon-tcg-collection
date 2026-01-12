import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json({ exists: false, verified: false });
    }

    return NextResponse.json({
      exists: true,
      verified: !!user.emailVerified,
    });
  } catch (error) {
    console.error('Check verification error:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}