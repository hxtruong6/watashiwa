import React from 'react';
import { redirect } from 'next/navigation';
import { getLastStudySession, getUser } from '@/services/actions';
import StudyContent from '@/components/StudyContent';

// Mark as Server Component (default in App Router, but good to be explicit by NOT having 'use client')
export default async function StudyPage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const user = await getUser();

	if (!user) {
		redirect('/login');
	}

	const resolvedParams = await searchParams;
	const hasDeckOrCourse = resolvedParams.deckId || resolvedParams.courseId;

	// If no specific study target is provided, try to resume the last session
	if (!hasDeckOrCourse) {
		const lastSession = await getLastStudySession();
		if (lastSession?.deckId) {
			redirect(`/study?deckId=${lastSession.deckId}`);
		}
	}

	return <StudyContent />;
}
