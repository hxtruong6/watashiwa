import { generateCourseMetadata } from '@/lib/seo/metadata';
import { generateCourseSchema, schemaToJsonLd } from '@/lib/seo/structured-data';
import { getUser } from '@/modules/auth/auth.actions';
import { getCourseWithUserProgress } from '@/modules/course/course.actions';
import { getCourseByIdOrSlug } from '@/modules/course/course.data';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import CourseDetailClient from './CourseDetailClient';

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;
	const locale = (await getLocale()) as 'vi' | 'en';

	// Fetch course for metadata (public data only)
	const course = await getCourseByIdOrSlug(id);

	if (!course || !course.isPublic) {
		// Return default metadata if course not found or not public
		return generateCourseMetadata(
			{
				title: 'Gợi ý Lộ trình',
				titleEn: 'Suggested Path',
			},
			locale,
		);
	}

	return generateCourseMetadata(course, locale);
}

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const user = await getUser();
	const { id } = await params;

	// Support both UUID and slug - getCourseWithUserProgress handles both
	const course = await getCourseWithUserProgress(id);

	if (!course) {
		notFound();
	}

	const isOwner = user?.id === course.authorId;
	const locale = (await getLocale()) as 'vi' | 'en';

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
