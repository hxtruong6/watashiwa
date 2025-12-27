import LandingPage from '@/components/landing/LandingPage';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getUser } from '@/modules/auth/auth.actions';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import React from 'react';

export async function generateMetadata(): Promise<Metadata> {
	const locale = (await getLocale()) as 'vi' | 'en';
	return generatePageMetadata({
		locale,
		url: '/',
	});
}

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
