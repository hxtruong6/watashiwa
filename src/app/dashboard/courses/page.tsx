import { getUser } from '@/services/actions';
import { getCourses } from '@/services/course-actions';

import CourseList from './CourseList';

export default async function CoursesDashboardPage() {
	const user = await getUser();
	if (!user) return <div>Please login</div>;

	const courses = await getCourses({ userId: user.id });

	return <CourseList courses={courses} userId={user.id} />;
}
