import { getUser } from '@/modules/auth/auth.actions';
import { getCourseWithUserProgress } from '@/modules/course/course.actions';
import { notFound } from 'next/navigation';

import CourseDetailClient from './CourseDetailClient';

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const user = await getUser();
	const { id } = await params;

	const course = await getCourseWithUserProgress(id);

	if (!course) {
		notFound();
	}

	const isOwner = user?.id === course.authorId;

	return <CourseDetailClient course={course} isOwner={isOwner} />;
}
