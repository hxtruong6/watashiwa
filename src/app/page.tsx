import LandingPage from '@/components/landing/LandingPage';
import { getUser } from '@/modules/auth/auth.actions';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function Page() {
	// Check for authenticated user
	const user = await getUser();

	// If user is logged in, redirect to dashboard
	if (user) {
		redirect('/dashboard?app=true');
	}

	// Otherwise show public landing page
	return <LandingPage />;
}
