import React from 'react';
import { redirect } from 'next/navigation';
import { getUser } from '@/services/actions';
import StudyContent from '@/components/StudyContent';

// Mark as Server Component (default in App Router, but good to be explicit by NOT having 'use client')
export default async function StudyPage() {
	const user = await getUser();

	if (!user) {
		redirect('/login');
	}

	return <StudyContent />;
}
