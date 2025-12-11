import React from 'react';
import { redirect } from 'next/navigation';
import { getUser } from '@/services/actions';
import LandingPage from '@/components/landing/LandingPage';

export default async function Page() {
	// Check for authenticated user
	const user = await getUser();

	// If user is logged in, redirect to dashboard
	if (user) {
		redirect('/dashboard');
	}

	// Otherwise show public landing page
	return <LandingPage />;
}
