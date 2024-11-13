import { NextResponse } from 'next/server';
import db from "@/db/drizzle";
import { lessonData } from '@/db/schema';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { courseId, content } = body;

    const data = await db.insert(lessonData).values({
      courseId,
      content
    }).returning();

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('[LESSON-DATA]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 