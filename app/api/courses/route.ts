// app/api/courses/route.ts

import { NextResponse } from 'next/server';
import db from "@/db/drizzle";
import { courses, userProgress } from '@/db/schema';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { title, content, description, imageSrc, isActive, userId } = body;

    if (!title || !content) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Create the course
    const course = await db.insert(courses).values({
      title,
      description : content,
      imageSrc: imageSrc || '/default-course-image.jpg',
      isActive: isActive || true,
      totalLessons: 0
    }).returning();

    // Create user progress entry for this course
    if (userId) {
      await db.insert(userProgress).values({
        userId,
        courseId: course[0].courseId,
        completedLessons: 0,
        hearts: 5,
        points: 0
      });
    }

    return NextResponse.json(course[0]);
  } catch (error) {
    console.error('[COURSES_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
