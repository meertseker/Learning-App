import { Header } from './header';
import { FeedWrapper } from '@/components/feed-wrapper';
import { StickyWrapper } from '@/components/sticky-wrapper';
import { UserProgress } from '@/components/user-progress';
import { GetCourses, getUserProgress } from '@/db/queries';
import React from 'react';
import { redirect } from 'next/navigation';

const LearnPage = async () => {
  const [userProgress, courses] = await Promise.all([
    getUserProgress(),
    GetCourses()
  ]);

  const activeCourse = courses.find(course => course.isActive);

  if (!activeCourse) {
    redirect("/library");
  }

  if (!userProgress) {
    redirect("/library");
  }

  return (
    <div className='flex flex-row-reverse gap-[48px] px-6'>
      <StickyWrapper>
        <UserProgress 
          activeCourse={activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
          hasActiveSubscription={userProgress.hasActiveSubscription}
        />
      </StickyWrapper>
      <FeedWrapper>
        <Header title={activeCourse.title}/>
      </FeedWrapper>
      <div />
    </div>
  );
};

export default LearnPage;
