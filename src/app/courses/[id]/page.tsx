import { routing } from '@/i18n/routing';
import { generateCourseSchema, schemaToJsonLd } from '@/lib/seo/structured-data';
import { isUUID } from '@/lib/utils/uuid';
import { getUser } from '@/modules/auth/auth.actions';
import { getCourseWithUserProgress } from '@/modules/course/course.actions';
import { getCourseById } from '@/modules/course/course.data';
import { PageSkeleton } from '@/modules/ui/components/skeletons';
import { type RedirectType, notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';

import CourseDetailClient from './CourseDetailClient';

// Metadata removed - Sentry intercepts generateMetadata before cookies() can be accessed
// SEO is handled via structured data (JSON-LD) in the page content, which is more reliable

async function CourseDetailContent({ params }: { params: Promise<{ id: string }> }) {
	const user = await getUser();
	const { id } = await params;

	if (isUUID(id)) {
		const course = await getCourseById(id);
		if (course?.slug) {
			redirect(`/courses/${course.slug}`, 'permanent' as RedirectType);
		}
		notFound();
	}

	// Normal slug lookup
	const course = await getCourseWithUserProgress(id);

	if (!course) {
		notFound();
	}

	const isOwner = user?.id === course.authorId;
	// Use default locale statically - no dynamic data access during prerendering
	const locale = routing.defaultLocale as 'vi' | 'en';

	// Generate structured data for this course
	const courseSchema = generateCourseSchema(course, locale);
	const jsonLd = schemaToJsonLd(courseSchema);

	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
			<CourseDetailClient course={course} isOwner={isOwner} />
		</>
	);
}

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
	return (
		<Suspense fallback={<PageSkeleton />}>
			<CourseDetailContent params={params} />
		</Suspense>
	);
}
