import { GetCourses, getUserProgress } from '@/db/queries'
import React from 'react'
import List from './list';

const Library = async() => {
    const coursesData = GetCourses();
    const userProgressData = getUserProgress();

    const [
        courses,
        userProgress,
    ] = await Promise.all([
        coursesData,
        userProgressData,
    ]);

    const activeCourseId = courses.find(course => course.isActive)?.courseId || null;

    return (
        <div className='h-full max-w-[912px] px-3 mx-auto'>
            <h1 className='text-2xl font-bold text-neutral-700'>
                Courses
            </h1>
            <List
                courses={courses}
                activeCourseId={activeCourseId}
            />
        </div>
    )
}

export default Library
