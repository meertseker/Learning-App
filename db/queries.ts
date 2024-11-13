"use server";

import {cache} from "react";
import db from "./drizzle";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { courses, userProgress } from "./schema";

type Course = typeof courses.$inferSelect;

export const GetCourses = cache(async (): Promise<Course[]> => {
    const { userId } = await auth();
    if (!userId) return [];

    const data = await db.query.userProgress.findMany({
        where: eq(userProgress.userId, userId),
        with: {
            course: true
        }
    });

    return data.map(progress => progress.course).filter((course): course is Course => !!course);
});

export const getUserProgress = cache(async () => {
    const { userId } = await auth();
    
    if (!userId) {
        return null;
    }

    try {
        const data = await db
            .select()
            .from(userProgress)
            .leftJoin(courses, eq(userProgress.courseId, courses.courseId))
            .where(
                and(
                    eq(userProgress.userId, userId),
                    eq(courses.isActive, true)
                )
            )
            .limit(1);

        if (!data || data.length === 0) {
            return null;
        }

        return {
            ...data[0].user_progress,
            course: data[0].courses,
            points: data[0].user_progress.points || 0, // Use existing points or default to 0
        };
    } catch (error) {
        console.error("Error fetching user progress:", error);
        return null;
    }
});

export const getCourseById = cache(async (courseId: number) => {
    const data = await db.query.courses.findFirst({
        where: eq(courses.courseId, courseId),
    });

    return data;
});

export async function setActiveCourse(courseId: number) {
    const { userId } = await auth();
    if (!userId) return null;

    try {
        // First, set all courses to inactive
        await db.update(courses)
            .set({ isActive: false });

        // Then set the selected course to active
        const updatedCourse = await db.update(courses)
            .set({ isActive: true })
            .where(eq(courses.courseId, courseId))
            .returning();

        return updatedCourse[0];
    } catch (error) {
        console.error("Error updating active course:", error);
        throw error;
    }
}

