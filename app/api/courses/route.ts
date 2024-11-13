<<<<<<< HEAD
// app/api/courses/route.ts

import { NextResponse } from 'next/server';
import db from "@/db/drizzle";
import { courses, userProgress } from '@/db/schema';
=======
import { NextResponse } from 'next/server';
>>>>>>> 6b53e2b1458913382595d02a92a64f54670453f4

export async function POST(request: Request) {
  try {
    const body = await request.json();
<<<<<<< HEAD
    
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
=======
    const { title, fileUrl, userId, courseId, type, content } = body;

    // Here you would typically save to your database
    // For now, we'll just return a success response
    return NextResponse.json({ 
      courseId,
      message: "Course created successfully" 
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: error.message || "Failed to create course" },
      { status: 500 }
    );
  }
} 
>>>>>>> 6b53e2b1458913382595d02a92a64f54670453f4
