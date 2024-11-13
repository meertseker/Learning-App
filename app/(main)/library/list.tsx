"use client";

import React from 'react';
import { courses } from "@/db/schema";
import Card from './card';
import { useRouter } from 'next/navigation';

type ListProps = {
    courses: typeof courses.$inferSelect[];
    activeCourseId: number | null;
}

const List = ({ courses, activeCourseId }: ListProps) => {
    const router = useRouter();

    const handleCardClick = (id: number) => {
        router.push('/learn'); // Redirect to learn page after setting active course
    };

    return (
        <div className='pt-6 grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4'>
            {courses.map((course) => (
                <Card
                    key={course.courseId}
                    id={course.courseId}
                    title={course.title}
                    image_src={course.imageSrc}
                    onClick={handleCardClick}
                    active={activeCourseId === course.courseId}
                />
            ))}
        </div>
    );
}

export default List;
