import { routing } from '@/i18n/routing';
import { generateCourseMetadata } from '@/lib/seo/metadata';
import { generateCourseSchema, schemaToJsonLd } from '@/lib/seo/structured-data';
import { isUUID } from '@/lib/utils/uuid';
import { getUser } from '@/modules/auth/auth.actions';
import { getCourseWithUserProgress } from '@/modules/course/course.actions';
import { getCourseById, getCourseByIdOrSlug } from '@/modules/course/course.data';
import type { Metadata } from 'next';
import { type RedirectType, notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';

import CourseDetailClient from './CourseDetailClient';

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;
	// Use default locale statically - no dynamic data access during prerendering
	const locale = routing.defaultLocale as 'vi' | 'en';

	// Fetch course for metadata (public data only)
	const course = await getCourseByIdOrSlug(id);

	if (!course || !course.isPublic) {
		// Return default metadata if course not found or not public
		return generateCourseMetadata(
			{
				title: 'Gợi ý Lộ trình',
				titleEn: 'Suggested Path',
				slug: 'suggested-path',
			},
			locale,
		);
	}

	return generateCourseMetadata(course, locale);
}

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
		<Suspense
			fallback={
				<div
					style={{
						minHeight: '100vh',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					Loading...
				</div>
			}
		>
			<CourseDetailContent params={params} />
		</Suspense>
	);
}
