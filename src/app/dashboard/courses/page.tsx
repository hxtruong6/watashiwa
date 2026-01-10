import { getUser } from '@/modules/auth/auth.actions';
import { getCourses } from '@/modules/course/course.actions';
import { PageSkeleton } from '@/modules/ui/components/skeletons';
import { Suspense } from 'react';

import CourseList from './CourseList';

async function CoursesDashboardContent() {
	const user = await getUser();
	if (!user) return <div>Please login</div>;

	const courses = await getCourses();

	return <CourseList courses={courses} userId={user.id} />;
}

export default async function CoursesDashboardPage() {
	return (
		<Suspense fallback={<PageSkeleton />}>
			<CoursesDashboardContent />
		</Suspense>
	);
}
