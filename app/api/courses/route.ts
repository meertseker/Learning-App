import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
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